import { useEffect, useState } from "react";
import axios from "axios";

function useQuestions(topic, difficulty, numQuestions) {
  const [quizes, setQuizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log("useQuestions called with:", { topic, difficulty, numQuestions });

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      const parsedNumQuestions = Number.parseInt(numQuestions, 10);
      const safeNumQuestions =
        Number.isNaN(parsedNumQuestions) || parsedNumQuestions <= 0
          ? 5
          : parsedNumQuestions;

      if (!topic) {
        setError("Topic is required to fetch questions.");
        setLoading(false);
        return;
      }

      try {
        console.log("Sending request to the server...");
        const response = await axios.post(
          "https://quizly-ai-worker.defund-ai.workers.dev/generate-quiz",
          {
            topic: topic,
            difficulty: difficulty,
            numQuestions: safeNumQuestions,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        setQuizes(response.data);
      } catch (err) {
        console.error("Error fetching questions:", err); // Log the actual error for debugging
        setError("Failed to fetch questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      fetchQuestions();
    }
  }, [topic, difficulty, numQuestions]);

  return { quizes, loading, error };
}

export default useQuestions;
