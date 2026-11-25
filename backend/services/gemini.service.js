
import { GoogleGenAI } from "@google/genai";

let ai;

function getGeminiClient() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }

    if (!ai) {
        ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });
    }

    return ai;
}

const DIFFICULTY_LEVELS = {
    easy: [1, 2],
    medium: [3],
    hard: [4, 5],
};

export async function generateMcqQuestions({
    courseName,
    topics,
    difficulty,
    questionCount,
}) {
    const allowedDifficulties = DIFFICULTY_LEVELS[difficulty];

    if (!allowedDifficulties) {
        throw new Error("Invalid quiz difficulty.");
    }

    if (!Array.isArray(topics) || topics.length === 0) {
        throw new Error("At least one topic is required.");
    }

    const topicDescription = topics
        .map(topic => ({
            id: topic.id,
            name: topic.name,
            unit: topic.unit ?? null,
        }));

    const prompt = `
You are an expert university-level question paper setter.

Generate exactly ${questionCount} high-quality multiple-choice
questions for the course "${courseName}".

DIFFICULTY: ${difficulty.toUpperCase()}

ALLOWED DATABASE DIFFICULTY VALUES:
${allowedDifficulties.join(", ")}

AVAILABLE TOPICS:
${JSON.stringify(topicDescription, null, 2)}

QUESTION QUALITY REQUIREMENTS:

1. Every question must belong to exactly one of the provided topics.
2. Use the corresponding topic ID in topic_id.
3. Generate exactly four options per question.
4. Only one option must be correct.
5. correct_answer must exactly match one of the four options.
6. Provide a clear and educational explanation.


DIFFICULTY GUIDELINES:

EASY:
- Test fundamental concepts and basic understanding.
- Keep questions relatively concise.
- Use straightforward options.
- Avoid unnecessary scenarios or excessive descriptions.

MEDIUM:
- Questions should generally contain 2-4 sentences.
- Prefer practical scenarios, technical situations,
  comparisons, and application-based problems.
- Provide sufficient context for students to analyze
  the problem before answering.
- Options should generally be descriptive, explaining
  different approaches, outcomes, or technical reasoning.
- Avoid simple definition-recall questions.
- Test whether students understand WHY something happens,
  not just WHAT it is.

HARD:
- Questions may contain 3-6 sentences when the scenario
  requires additional context.
- Use complex practical situations, edge cases,
  multi-step reasoning, and conceptual trade-offs.
- Options should be detailed and technically meaningful.
- Distractors should represent realistic misconceptions
  or plausible but incorrect approaches.
- Require students to analyze the scenario before choosing
  an answer.
- Avoid making questions difficult merely through
  complicated wording.

OPTION LENGTH:
- Easy: options can be short and direct.
- Medium: options should generally explain their reasoning
  or describe their consequences.
- Hard: options may contain multiple clauses and detailed
  technical explanations.
- Do not artificially increase option length.
- Keep every option relevant to the question.



ACADEMIC ACCURACY AND QUESTION QUALITY:

- Ensure every question has exactly ONE defensibly correct answer.
- Verify that the correct answer is technically accurate.
- Check that the explanation logically supports the answer.
- Never include multiple correct options.
- For questions involving calculations, functional dependencies,
  algorithms, or technical rules, verify the reasoning before
  generating the final answer.
- Avoid ambiguous wording such as "which is correct" when
  multiple answers may be valid.
- Do not repeat the same concept using different wording.
- Ensure the question difficulty matches its actual reasoning
  requirements.

`;

    const responseSchema = {
        type: "object",
        properties: {
            questions: {
                type: "array",
                minItems: questionCount,
                maxItems: questionCount,
                items: {
                    type: "object",
                    properties: {
                        topic_id: {
                            type: "integer",
                        },
                        difficulty: {
                            type: "integer",
                            enum: allowedDifficulties,
                        },
                        prompt: {
                            type: "string",
                        },
                        options: {
                            type: "array",
                            minItems: 4,
                            maxItems: 4,
                            items: {
                                type: "string",
                            },
                        },
                        correct_answer: {
                            type: "string",
                        },
                        explanation: {
                            type: "string",
                        },
                    },
                    required: [
                        "topic_id",
                        "difficulty",
                        "prompt",
                        "options",
                        "correct_answer",
                        "explanation",
                    ],
                },
            },
        },
        required: ["questions"],
    };

    const client = getGeminiClient();

    const result = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: responseSchema,
            temperature: 0.8,
        },
    });

    if (!result.text) {
        throw new Error("Gemini returned an empty response.");
    }

    let parsed;

    try {
        parsed = JSON.parse(result.text);
    } catch {
        throw new Error("Gemini returned invalid JSON.");
    }

    if (!Array.isArray(parsed.questions)) {
        throw new Error("Gemini returned an invalid question structure.");
    }

    return parsed.questions;
}
