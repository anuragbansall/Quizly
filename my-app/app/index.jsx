import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [topic, setTopic] = useState("");

  const router = useRouter();

  const handleGenerateQuiz = () => {
    if (topic.trim() === "") {
      alert("Please enter a topic to generate a quiz.");
      return;
    }

    router.push(`/quiz?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Quizly</Text>
        <TextInput
          placeholder="Enter your topic here..."
          placeholderTextColor="#888"
          style={styles.input}
          value={topic}
          onChangeText={setTopic}
        />
        <TouchableOpacity style={styles.button} onPress={handleGenerateQuiz}>
          <Text style={styles.buttonText}>Generate Quiz</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "#0a0a0a",
    color: "#fff",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
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
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    color: "#fff",
    borderColor: "#333",
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1a1a1a",
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
});
