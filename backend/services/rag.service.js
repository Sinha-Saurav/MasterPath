
const RAG_API_URL = process.env.RAG_API_URL;
const RAG_API_KEY = process.env.RAG_API_KEY;

export async function queryRag({
  studentId,
  courseId = null,
  topicId = null,
  question,
  topK = 5,
  learnerContext = null,
}) {    
  if (!RAG_API_URL || !RAG_API_KEY) {
    throw new Error("RAG API environment variables are missing.");
  }

  const url = `${RAG_API_URL.replace(/\/+$/, "")}/api/rag/v1/query`;

  const payload = {
    student_id: studentId,
    course_id: courseId,
    topic_id: topicId,
    question,
    top_k: topK,
    learner_context: learnerContext,
  };

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 60000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RAG_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        result?.detail ||
        result?.message ||
        `RAG API request failed with status ${response.status}`
      );

      error.status = response.status;
      error.code = "RAG_API_ERROR";

      throw error;
    }

    return result;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("RAG API request timed out.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
