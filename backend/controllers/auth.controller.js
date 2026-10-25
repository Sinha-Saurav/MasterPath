
import { supabaseAuth } from "../config/supabaseAuth.js";

export async function register(req, res, next) {
  try {
    const { full_name, email, password } = req.body ?? {};

    // 1. Validate required fields.
    if (
      typeof full_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST",
          message: "Full name, email, and password are required.",
        },
      });
    }

    // 2. Normalize and validate the name.
    const normalizedName = full_name.trim();

    if (!normalizedName || normalizedName.length > 100) {
      return res.status(400).json({
        error: {
          code: "INVALID_NAME",
          message: "Full name must contain 1–100 characters.",
        },
      });
    }

    // 3. Normalize and validate the email.
    const normalizedEmail = email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      normalizedEmail.length > 254 ||
      !emailPattern.test(normalizedEmail)
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_EMAIL",
          message: "Provide a valid email address.",
        },
      });
    }

    // 4. Validate the password.
    // Do not trim passwords; whitespace can be intentional.
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        error: {
          code: "INVALID_PASSWORD",
          message: "Password must contain 8–128 characters.",
        },
      });
    }

    // 5. Register through Supabase Auth.
    const { data, error } = await supabaseAuth.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: normalizedName,
        },
      },
    });

    if (error) {
      // Invalid credentials/configuration and other Supabase errors
      // are handled centrally without exposing internal details.
      return next(error);
    }

    // 6. Return a response that does not expose tokens or passwords.
    return res.status(201).json({
      message: "Registration received. Check your email to confirm your account.",
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      email_confirmation_required: true,
    });
  } catch (error) {
    return next(error);
  }
}




export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    // 1. Validate required fields.
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST",
          message: "Email and password are required.",
        },
      });
    }

    // 2. Normalize the email.
    const normalizedEmail = email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      normalizedEmail.length > 254 ||
      !emailPattern.test(normalizedEmail)
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_EMAIL",
          message: "Provide a valid email address.",
        },
      });
    }

    // 3. Authenticate with Supabase.
    const { data, error } =
      await supabaseAuth.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    if (error) {
      // Invalid credentials should not reveal whether
      // a particular email address exists.
      if (
        error.code === "invalid_credentials" ||
        error.code === "email_not_confirmed"
      ) {
        return res.status(401).json({
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password, or email confirmation is required.",
          },
        });
      }

      return next(error);
    }

    const { user, session } = data;

    if (!user || !session) {
      return res.status(401).json({
        error: {
          code: "LOGIN_FAILED",
          message: "Unable to establish a session.",
        },
      });
    }

    // 4. Return only the fields the client needs.
    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.id,
        email: user.email,
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
      },
    });
  } catch (error) {
    return next(error);
  }
}



export async function refreshSession(req, res, next) {
  try {
    const { refresh_token } = req.body ?? {};

    // 1. Validate the refresh token.
    if (
      typeof refresh_token !== "string" ||
      refresh_token.trim().length === 0
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST",
          message: "Refresh token is required.",
        },
      });
    }

    // 2. Ask Supabase to refresh the session.
    const { data, error } =
      await supabaseAuth.auth.refreshSession({
        refresh_token: refresh_token.trim(),
      });

    if (error || !data.session || !data.user) {
      return res.status(401).json({
        error: {
          code: "INVALID_REFRESH_TOKEN",
          message: "Refresh token is invalid, expired, or no longer usable. Please log in again.",
        },
      });
    }

    const { session, user } = data;

    // 3. Return the new session tokens.
    return res.status(200).json({
      message: "Session refreshed successfully.",
      user: {
        id: user.id,
        email: user.email,
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
      },
    });
  } catch (error) {
    return next(error);
  }
}

