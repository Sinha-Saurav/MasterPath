import { supabase } from "../config/supabase.js";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check whether the Authorization header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Access token is required",
        },
      });
    }

    // 2. Extract the access token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Access token is missing",
        },
      });
    }

    // 3. Verify the token with Supabase Auth
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

    // 4. Attach the verified user to the request
    req.user = user;

    // 5. Continue to the next middleware/controller
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
