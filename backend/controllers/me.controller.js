
import { supabase } from "../config/supabase.js";

export async function getMe(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, branch, semester")
      .eq("id", req.user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          error: {
            code: "PROFILE_NOT_FOUND",
            message: "Profile not found",
          },
        });
      }

      throw error;
    }

    return res.json(data);
  } catch (error) {
    next(error);
  }
}


export async function updateMe(req, res, next) {
  try {
    
    if (
      req.body === null ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST_BODY",
          message: "Request body must be a JSON object.",
        },
      });
    }

    const allowedFields = ["full_name", "branch", "semester"];
    const updates = {...req.body};

    // 1. Validate the request body.
    if (
      !updates ||
      typeof updates !== "object" ||
      Array.isArray(updates)
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST_BODY",
          message: "Request body must be a JSON object.",
        },
      });
    }

    // 2. Reject empty request bodies.
    const fields = Object.keys(updates);

    if (fields.length === 0) {
      return res.status(400).json({
        error: {
          code: "EMPTY_UPDATE",
          message: "Provide at least one field to update.",
        },
      });
    }

    // 3. Reject unsupported fields.
    const invalidFields = fields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: {
          code: "INVALID_FIELDS",
          message: `These fields cannot be updated: ${invalidFields.join(", ")}`,
        },
      });
    }

    // 4. Validate full_name and branch.
    for (const field of ["full_name", "branch"]) {
      if (field in updates) {
        if (
          typeof updates[field] !== "string" ||
          updates[field].trim().length === 0
        ) {
          return res.status(400).json({
            error: {
              code: "INVALID_FIELD",
              message: `${field} must be a non-empty string.`,
            },
          });
        }

        // Trim unnecessary whitespace.
        updates[field] = updates[field].trim();
      }
    }

    // 5. Validate semester.
    if ("semester" in updates) {
      if (
        !Number.isInteger(updates.semester) ||
        updates.semester < 1 ||
        updates.semester > 8
      ) {
        return res.status(400).json({
          error: {
            code: "INVALID_SEMESTER",
            message: "Semester must be an integer between 1 and 8.",
          },
        });
      }
    }

    // 6. Update only the authenticated student's profile.
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", req.user.id)
      .select("id, full_name, role, branch, semester")
      .maybeSingle();

    if (error) {
      return next(error);
    }

    // 7. Handle a profile that does not exist.
    if (!data) {
      return res.status(404).json({
        error: {
          code: "PROFILE_NOT_FOUND",
          message: "Student profile was not found.",
        },
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

