
import { supabase } from "../config/supabase.js";

export async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Access token is required",
        },
      });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired access token",
        },
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      error: {
        code: "AUTH_ERROR",
        message: "Internal authentication error",
      },
    });
  }
}
