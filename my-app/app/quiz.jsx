import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import useQuestions from "../hooks/useQuestions";

// const quizes = {
//   topic: "The Solar System",
//   difficulty: "easy",
//   totalQuestions: 3,
//   questions: [
//     {
//       question: "What is the largest planet in our solar system?",
//       options: ["Earth", "Mars", "Jupiter", "Saturn"],
//       answer: "Jupiter",
//     },
//     {
//       question: "Which planet is known as the Red Planet?",
//       options: ["Venus", "Mars", "Mercury", "Neptune"],
//       answer: "Mars",
//     },
//     {
//       question: "What is the name of the fifth planet from the Sun?",
//       options: ["Earth", "Mars", "Jupiter", "Saturn"],
//       answer: "Jupiter",
//     },
//   ],
// };

const Quiz = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isQuizEnded, setIsQuizEnded] = useState(false);
  const [score, setScore] = useState(0);

  const router = useRouter();

  const { topic } = useLocalSearchParams();

  const { quizes, loading, error } = useQuestions(topic, "easy", 3);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Loading Quiz...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>
          Failed to fetch quiz data. Please try again.
        </Text>
      </SafeAreaView>
    );
  }

  if (quizes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>No Questions Available</Text>
      </SafeAreaView>
    );
  }

  const isCorrectAnswer = (option) => {
    return option === quizes.questions[currentQuestionIndex].answer;
  };

  const handleOptionSelect = (option) => {
    if (isAnswered) {
      return; // Prevent changing answer after checking
    }
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (isAnswered) {
      return; // Prevent checking answer multiple times
    }

    if (selectedOption === null) {
      alert("Please select an option before checking the answer.");
      return;
    }

    if (isCorrectAnswer(selectedOption)) {
      setScore(score + 1);
    }

    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (!isAnswered) {
      alert("Please check the answer before moving to the next question.");
      return;
    }

    if (isQuizEnded) {
      return;
    }

    setSelectedOption(null);
    setIsAnswered(false);

    if (currentQuestionIndex < quizes.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleQuizComplete = () => {
    setIsQuizEnded(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isQuizEnded ? (
        <View style={styles.inner}>
          <View style={styles.quizHeader}>
            <Text style={styles.title}>{quizes.topic} Quiz</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Text style={styles.capsule}>{quizes.difficulty}</Text>
              <Text style={styles.capsule}>
                {currentQuestionIndex + 1}/{quizes.questions.length}
              </Text>
            </View>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>
              {quizes.questions[currentQuestionIndex].question}
            </Text>
            {quizes.questions[currentQuestionIndex].options.map(
              (option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    // Highlight the selected option
                    !isAnswered &&
                      selectedOption === option &&
                      styles.selectedOption,
                    // Highlight the correct answer (even if not selected)
                    isAnswered &&
                      isCorrectAnswer(option) &&
                      styles.correctOption,
                    // Highlight the incorrect option if selected
                    isAnswered &&
                      !isCorrectAnswer(option) &&
                      option === selectedOption &&
                      styles.incorrectOption,
                  ]}
                  onPress={() => handleOptionSelect(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          {!isAnswered ? (
            <TouchableOpacity style={styles.button} onPress={handleCheckAnswer}>
              <Text style={styles.buttonText}>Check Answer</Text>
            </TouchableOpacity>
          ) : currentQuestionIndex < quizes.questions.length - 1 ? (
            <TouchableOpacity
              style={styles.button}
              onPress={handleNextQuestion}
            >
              <Text style={styles.buttonText}>Next Question</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handleQuizComplete}
            >
              <Text style={styles.buttonText}>View Score</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <SafeAreaView style={styles.container}>
          <View style={styles.inner}>
            <Text style={styles.title}>Quiz Completed!</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                Your final score is: {score}/{quizes.questions.length}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/")}
            >
              <Text style={styles.buttonText}>Try Another Topic</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
};

export default Quiz;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  inner: {
    width: "100%",
    maxWidth: 400,
    padding: 30,
    backgroundColor: "#0f0f0f",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  quizHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  capsule: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 20,
    fontSize: 14,
    textTransform: "uppercase",
  },
  questionContainer: {
    marginTop: 30,
  },
  question: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  optionButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
  selectedOption: {
    backgroundColor: "#1a1a1a",
    borderColor: "#fff",
    borderWidth: 2,
  },
  button: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    marginTop: 30,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  correctOption: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
    borderWidth: 2,
  },
  incorrectOption: {
    backgroundColor: "#f44336",
    borderColor: "#f44336",
    borderWidth: 2,
  },
  scoreContainer: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: "#333",
    borderRadius: 10,
  },
  scoreText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});
