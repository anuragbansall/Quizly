import Groq from 'groq-sdk';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
	async fetch(request, env) {
		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		try {
			if (!env.GROQ_API_KEY) {
				return new Response('AI service not configured', {
					status: 500,
					headers: corsHeaders,
				});
			}

			if (request.method !== 'POST') {
				return new Response('Method Not Allowed', {
					status: 405,
					headers: corsHeaders,
				});
			}

			const url = new URL(request.url);

			if (url.pathname !== '/generate-quiz') {
				return new Response('Not Found', {
					status: 404,
					headers: corsHeaders,
				});
			}

			let body;

			try {
				body = await request.json();
			} catch {
				return new Response('Invalid JSON body', {
					status: 400,
					headers: corsHeaders,
				});
			}

			const { topic, difficulty = 'medium', numQuestions = 5 } = body;

			if (!topic) {
				return new Response('Topic is required', {
					status: 400,
					headers: corsHeaders,
				});
			}

			const groq = new Groq({
				apiKey: env.GROQ_API_KEY,
			});

			const prompt = `
Generate ${numQuestions} multiple choice questions about: "${topic}"

Difficulty: ${difficulty}

Rules:
- Each question must have exactly 4 options
- Only one correct answer
- Questions should be clear and concise

Return ONLY valid JSON in this format:

{
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct option text"
    }
  ]
}

Notes:
- Generate EXACTLY ${numQuestions} questions.
- If the number is not exactly ${numQuestions}, the response is invalid.
- Do not include explanations or additional text.
`;

			const completion = await groq.chat.completions.create({
				model: 'openai/gpt-oss-20b',
				messages: [
					{
						role: 'system',
						content: 'You generate structured quiz questions strictly in JSON format.',
					},
					{
						role: 'user',
						content: prompt,
					},
				],
				response_format: {
					type: 'json_schema',
					json_schema: {
						name: 'QuizSchema',
						strict: true,
						schema: {
							type: 'object',
							properties: {
								questions: {
									type: 'array',
									items: {
										type: 'object',
										properties: {
											question: { type: 'string' },
											options: {
												type: 'array',
												items: { type: 'string' },
												minItems: 4,
												maxItems: 4,
											},
											answer: { type: 'string' },
										},
										required: ['question', 'options', 'answer'],
										additionalProperties: false,
									},
								},
							},
							required: ['questions'],
							additionalProperties: false,
						},
					},
				},
				temperature: 0.6,
			});

			const text = completion.choices?.[0]?.message?.content;

			if (!text) {
				throw new Error('Empty AI response');
			}

			const result = JSON.parse(text);

			const responsePayload = {
				topic,
				difficulty,
				totalQuestions: result.questions.length,
				questions: result.questions,
			};

			return new Response(JSON.stringify(responsePayload), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		} catch (error) {
			console.error('Quiz Worker Error:', error);

			return new Response(
				JSON.stringify({
					error: 'AI quiz generation failed',
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				},
			);
		}
	},
};

/*
Request body format:

{
  "topic": "The Solar System",
  "difficulty": "easy", 
  "numQuestions": 5
}

Response format:

{
  "topic": "The Solar System",
  "difficulty": "easy",
  "totalQuestions": 5,
  "questions": [
    {
      "question": "What is the largest planet in our solar system?",
      "options": ["Earth", "Mars", "Jupiter", "Saturn"],
      "answer": "Jupiter"
    }
  ]
}
*/
