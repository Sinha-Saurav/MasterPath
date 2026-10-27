
export const mockWorkspaceTopics = [
    { id: "ds-intro", title: "What are Data Structures?", category: "Introduction to DSA", status: "completed", duration: 12 },
    { id: "ds-complexity", title: "Time and Space Complexity", category: "Introduction to DSA", status: "completed", duration: 18 },
    { id: "array-intro", title: "Introduction to Arrays", category: "Arrays", status: "completed", duration: 14 },
    { id: "two-pointer", title: "Two Pointer Technique", category: "Arrays", status: "in-progress", duration: 20 },
    { id: "sliding-window", title: "Sliding Window", category: "Arrays", status: "not-started", duration: 25 },
    { id: "ll-intro", title: "Introduction to Linked Lists", category: "Linked Lists", status: "not-started", duration: 15 },
];

export const mockVideos = [
    {
        id: "video-1",
        youtubeId: "8mAITcNt710",
        title: "Two Pointer Technique Explained",
        channel: "Code with Examples",
        duration: "12:40",
        views: "120K views",
    },
    {
        id: "video-2",
        youtubeId: "On03HWe2tZM",
        title: "Two Pointers: A Complete Guide",
        channel: "Programming Tutorials",
        duration: "18:22",
        views: "85K views",
    },
    {
        id: "video-3",
        youtubeId: "QzZ7nmouL2s",
        title: "Two Pointer Coding Problems",
        channel: "DSA Practice",
        duration: "15:10",
        views: "42K views",
    },
    {
        id: "video-4",
        youtubeId: "s5bd9KMSSW4",
        title: "Two Pointer Patterns for Interviews",
        channel: "Interview Prep",
        duration: "21:05",
        views: "64K views",
    },
    {
        id: "video-5",
        youtubeId: "BCL3xJr5Y5M",
        title: "Common Two Pointer Mistakes",
        channel: "Coding Academy",
        duration: "09:45",
        views: "31K views",
    },
];

export const mockTopicNotes = {
    title: "Two Pointer Technique",
    introduction:
        "The two pointer technique uses two indices to traverse a data structure, often reducing the need for nested loops.",
    sections: [
        {
            heading: "When should you use it?",
            body: "It is especially useful for sorted arrays, pairs that satisfy a target condition, palindrome checks, and problems involving opposite ends of a sequence.",
        },
        {
            heading: "How it works",
            body: "Place two pointers at appropriate starting positions. Evaluate the current elements, then move one or both pointers according to the problem's condition until the answer is found or the pointers meet.",
        },
    ],
    code: `function twoSumSorted(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const sum = nums[left] + nums[right];

    if (sum === target) {
      return [left, right];
    }

    if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return [];
    }`,
};

