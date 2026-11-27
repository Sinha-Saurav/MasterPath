import { supabase } from "../config/supabase.js";

const CACHE_DURATION_DAYS = 7;
const MAX_SEARCH_RESULTS = 10;
const MAX_RECOMMENDED_VIDEOS = 5;

function isCacheValid(fetchedAt) {
    if (!fetchedAt) return false;

    const age = Date.now() - new Date(fetchedAt).getTime();
    const maxAge = CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000;

    return age >= 0 && age < maxAge;
}

async function getCachedVideos(courseId, topicId) {
    const { data, error } = await supabase
        .from("topic_video_recommendations")
        .select("*")
        .eq("course_id", String(courseId))
        .eq("topic_id", String(topicId))
        .maybeSingle();

    if (error) {
        throw new Error(`Cache lookup failed: ${error.message}`);
    }

    if (!data || !isCacheValid(data.fetched_at)) {
        return null;
    }

    return data.videos;
}

async function searchYouTubeVideos(courseTitle, topicTitle) {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error("YOUTUBE_API_KEY is missing from backend environment");
    }

    const searchParams = new URLSearchParams({
        part: "snippet",
        q: `${courseTitle} ${topicTitle} tutorial`,
        type: "video",
        maxResults: String(MAX_SEARCH_RESULTS),
        order: "relevance",
        videoEmbeddable: "true",
        safeSearch: "moderate",
        regionCode: "IN",
        relevanceLanguage: "en",
        key: apiKey,
    });

    const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${searchParams}`
    );

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
        throw new Error(
            searchData.error?.message || "YouTube search request failed"
        );
    }

    const videoIds = (searchData.items || [])
        .map((item) => item.id?.videoId)
        .filter(Boolean);

    if (!videoIds.length) {
        return [];
    }

    const detailsParams = new URLSearchParams({
        part: "snippet,statistics,contentDetails,status",
        id: videoIds.join(","),
        key: apiKey,
    });

    const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?${detailsParams}`
    );

    const detailsData = await detailsResponse.json();

    if (!detailsResponse.ok) {
        throw new Error(
            detailsData.error?.message || "YouTube video details request failed"
        );
    }

    return (detailsData.items || [])
        .filter((video) => video.status?.embeddable !== false)
        .map((video) => ({
            youtubeId: video.id,
            title: video.snippet?.title || "Untitled video",
            description: video.snippet?.description || "",
            channelTitle: video.snippet?.channelTitle || "",
            thumbnail:
                video.snippet?.thumbnails?.high?.url ||
                video.snippet?.thumbnails?.medium?.url ||
                video.snippet?.thumbnails?.default?.url ||
                "",
            publishedAt: video.snippet?.publishedAt || null,
            viewCount: Number(video.statistics?.viewCount || 0),
            duration: video.contentDetails?.duration || null,
            url: `https://www.youtube.com/watch?v=${video.id}`,
        }))
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, MAX_RECOMMENDED_VIDEOS);
}

export async function getTopicVideoRecommendations({
    courseId,
    topicId,
    courseTitle,
    topicTitle,
}) {
    const cachedVideos = await getCachedVideos(courseId, topicId);

    if (cachedVideos) {
        return {
            videos: cachedVideos,
            cached: true,
        };
    }

    const videos = await searchYouTubeVideos(courseTitle, topicTitle);

    const { error } = await supabase
        .from("topic_video_recommendations")
        .upsert(
            {
                course_id: String(courseId),
                topic_id: String(topicId),
                course_title: courseTitle,
                topic_title: topicTitle,
                videos,
                fetched_at: new Date().toISOString(),
            },
            {
                onConflict: "course_id,topic_id",
            }
        );

    if (error) {
        throw new Error(`Could not save video recommendations: ${error.message}`);
    }

    return {
        videos,
        cached: false,
    };
}