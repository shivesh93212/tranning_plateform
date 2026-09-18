import { useEffect, useState } from "react";
import { getPracticeQuestions } from "../services/practiceApi";

function PracticeTest() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getPracticeQuestions();

        console.log("PRACTICE API RESPONSE:", data);

        setQuestions(data);
      } catch (err) {
        console.error("PRACTICE API ERROR:", err);

        setError(
          err.response?.data?.detail ||
            "Failed to load practice questions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return <div className="p-10">Loading questions...</div>;
  }

  if (error) {
    return (
      <div className="p-10 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold">
          Practice API Test
        </h1>

        <pre className="overflow-auto rounded-xl bg-white p-6 shadow">
          {JSON.stringify(questions, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default PracticeTest;