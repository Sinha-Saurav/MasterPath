
import { supabase } from "../config/supabase.js";

export async function getQuizQuestions({
  courseId,
  topicId = null,
  studentId,
  questionCount = 10,
}) {
  let query = supabase
    .from("questions")
    .select(`
      id,
      topic_id,
      type,
      difficulty,
      prompt,
      options,
      explanation,
      correct_answer,
      topics!inner(course_id)
    `)
    .eq("topics.course_id", courseId)
    .eq("type", "mcq");

  if (topicId !== null) {
    query = query.eq("topic_id", topicId);
  }

  const { data: questions, error } = await query;

  if (error) throw error;

  if (!questions?.length) return [];

  // Fetch mastery for the student's topics in this course.
  const { data: masteryRows, error: masteryError } = await supabase
    .from("mastery")
    .select("topic_id, score")
    .eq("student_id", studentId)
    .in("topic_id", [...new Set(questions.map(q => q.topic_id))]);

  if (masteryError) throw masteryError;

  const masteryMap = new Map(
    (masteryRows ?? []).map(row => [
      row.topic_id,
      Number(row.score),
    ])
  );

  // Prefer a difficulty suitable for each topic's current mastery.
  const ranked = questions.map(question => {
    const mastery = masteryMap.get(question.topic_id) ?? 0.5;

    const targetDifficulty =
      mastery < 0.4 ? 2 :
      mastery > 0.75 ? 4 :
      3;

    return {
      ...question,
      selectionDistance: Math.abs(
        question.difficulty - targetDifficulty
      ),
    };
  });

  // Shuffle within difficulty preference groups to avoid always
  // selecting the same first questions.
  ranked.sort((a, b) => {
    if (a.selectionDistance !== b.selectionDistance) {
      return a.selectionDistance - b.selectionDistance;
    }

    return Math.random() - 0.5;
  });

  return ranked.slice(0, questionCount);
}
