
import { supabase } from "../config/supabase.js";

export async function getCourses(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("id, code, name")
      .order("name", { ascending: true });

    if (error) {
      return next(error);
    }

    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}



export async function getCourseTopics(req, res, next) {
  try {
    const courseId = Number(req.params.id);

    // 1. Validate the course ID.
    if (!Number.isSafeInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        error: {
          code: "INVALID_COURSE_ID",
          message: "Course ID must be a positive integer.",
        },
      });
    }

    // 2. Confirm the course exists.
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .maybeSingle();

    if (courseError) {
      return next(courseError);
    }

    if (!course) {
      return res.status(404).json({
        error: {
          code: "COURSE_NOT_FOUND",
          message: "The requested course was not found.",
        },
      });
    }

    // 3. Retrieve topics belonging to this course.
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("id, parent_id, unit, name, position")
      .eq("course_id", courseId)
      .order("position", { ascending: true });

    if (topicsError) {
      return next(topicsError);
    }

    return res.status(200).json(topics);
  } catch (error) {
    return next(error);
  }
}



export async function enrollInCourse(req, res, next) {
  try {
    const courseId = Number(req.params.id);

    // 1. Validate the course ID.
    if (!Number.isSafeInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        error: {
          code: "INVALID_COURSE_ID",
          message: "Course ID must be a positive integer.",
        },
      });
    }

    // 2. Verify that the course exists.
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .maybeSingle();

    if (courseError) {
      return next(courseError);
    }

    if (!course) {
      return res.status(404).json({
        error: {
          code: "COURSE_NOT_FOUND",
          message: "The requested course was not found.",
        },
      });
    }

    // 3. Use the authenticated student's ID.
    const { error: enrollmentError } = await supabase
      .from("enrollments")
      .upsert(
        {
          student_id: req.user.id,
          course_id: courseId,
        },
        {
          onConflict: "student_id,course_id",
          ignoreDuplicates: true,
        }
      );

    if (enrollmentError) {
      return next(enrollmentError);
    }

    return res.status(200).json({
      course_id: courseId,
    });
  } catch (error) {
    return next(error);
  }
}


export async function getMyCourses(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        courses (
          id,
          code,
          name
        )
      `)
      .eq("student_id", req.user.id);

    if (error) {
      return next(error);
    }

    const courses = data.map((enrollment) => enrollment.courses);

    return res.status(200).json(courses);
  } catch (error) {
    return next(error);
  }
}


