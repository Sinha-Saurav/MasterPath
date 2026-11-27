import {
    getTopicVideoRecommendations,
} from "../services/youtube.service.js";

export async function getTopicVideos(req, res) {
    try {
        const { id: courseId, topicId } = req.params;
        const { courseTitle, topicTitle } = req.query;

        if (!courseId || !topicId) {
            return res.status(400).json({
                message: "Course ID and topic ID are required",
            });
        }

        if (
            typeof courseTitle !== "string" ||
            typeof topicTitle !== "string" ||
            !courseTitle.trim() ||
            !topicTitle.trim()
        ) {
            return res.status(400).json({
                message: "Course title and topic title are required",
            });
        }

        if (courseTitle.length > 200 || topicTitle.length > 200) {
            return res.status(400).json({
                message: "Course or topic title is too long",
            });
        }

        const result = await getTopicVideoRecommendations({
            courseId,
            topicId,
            courseTitle: courseTitle.trim(),
            topicTitle: topicTitle.trim(),
        });

        return res.status(200).json({
            message: "Topic videos fetched successfully",
            videos: result.videos,
            cached: result.cached,
        });
    } catch (error) {
        console.error("Get topic videos error:", error);

        return res.status(500).json({
            message: "Failed to fetch topic videos",
            error: error.message,
        });
    }
}