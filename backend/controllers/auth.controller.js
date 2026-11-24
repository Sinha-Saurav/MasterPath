
import { supabaseAuth } from "../config/supabaseAuth.js";
import { createClient } from "@supabase/supabase-js";

const isProduction = process.env.NODE_ENV === "production";

const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/api/auth/refresh",
};

function setAuthCookies(res, session) {
  const accessMaxAge = Math.max(
    0,
    session.expires_at * 1000 - Date.now()
  );

  res.cookie("access_token", session.access_token, {
    ...accessCookieOptions,
    maxAge: accessMaxAge,
  });

  res.cookie("refresh_token", session.refresh_token, {
    ...refreshCookieOptions,
    // Cookie expiry is a client-side bound; Supabase
    // remains authoritative for refresh-token validity.
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res) {
  res.clearCookie("access_token", accessCookieOptions);
  res.clearCookie("refresh_token", refreshCookieOptions);
}

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

    setAuthCookies(res, session);

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.id,
        email: user.email,
      },
    });

  } catch (error) {
    return next(error);
  }
}




export async function refreshSession(req, res, next) {
  try {
    const refresh_token = req.cookies?.refresh_token;

    if (!refresh_token) {
      return res.status(401).json({
        error: {
          code: "INVALID_REFRESH_TOKEN",
          message: "Refresh token is missing. Please log in again.",
        },
      });
    }

    const { data, error } =
      await supabaseAuth.auth.refreshSession({
        refresh_token,
      });

    if (error || !data.session || !data.user) {
      clearAuthCookies(res);

      return res.status(401).json({
        error: {
          code: "INVALID_REFRESH_TOKEN",
          message:
            "Refresh token is invalid or expired. Please log in again.",
        },
      });
    }

    const { session, user } = data;

    // Rotate both cookies with the new Supabase session.
    setAuthCookies(res, session);

    return res.status(200).json({
      message: "Session refreshed successfully.",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
}



export async function logout(req, res, next) {
  try {
    clearAuthCookies(res);

    return res.status(200).json({
      message: "Logout successful.",
    });
  } catch (error) {
    return next(error);
  }
}



export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body ?? {};

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST",
          message: "Email address is required.",
        },
      });
    }

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

    const { error } =
      await supabaseAuth.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        }
      );

    if (error) {
      return next(error);
    }

    // Generic response to avoid revealing whether an account exists.
    return res.status(200).json({
      message:
        "If an account exists for this email, reset instructions will be sent.",
    });
  } catch (error) {
    return next(error);
  }
}



export async function recoverySession(req, res, next) {
  try {
    const { access_token, refresh_token } = req.body ?? {};

    if (
      typeof access_token !== "string" ||
      !access_token.trim() ||
      typeof refresh_token !== "string" ||
      !refresh_token.trim()
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_RECOVERY_TOKEN",
          message: "A valid recovery session is required.",
        },
      });
    }

    // Use a request-scoped client to avoid sharing auth state.
    const recoveryClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );

    const { data, error } = await recoveryClient.auth.setSession({
      access_token: access_token.trim(),
      refresh_token: refresh_token.trim(),
    });

    if (error || !data.session || !data.user) {
      clearAuthCookies(res);

      return res.status(401).json({
        error: {
          code: "INVALID_RECOVERY_TOKEN",
          message: "Recovery link is invalid or expired.",
        },
      });
    }

    setAuthCookies(res, data.session);

    return res.status(200).json({
      message: "Recovery session established.",
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
}


export async function updatePassword(req, res, next) {
  try {
    const { password } = req.body ?? {};

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_PASSWORD",
          message: "Password must contain 8–128 characters.",
        },
      });
    }

    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Recovery session is required.",
        },
      });
    }

    const { data: userData, error: userError } =
      await supabaseAuth.auth.getUser(accessToken);

    if (userError || !userData.user) {
      return res.status(401).json({
        error: {
          code: "INVALID_SESSION",
          message: "Recovery session is invalid or expired.",
        },
      });
    }

    const { data, error } =
      await supabaseAuth.auth.updateUser({
        password,
      });

    if (error) {
      return next(error);
    }

    clearAuthCookies(res);

    return res.status(200).json({
      message: "Password updated successfully. Please log in again.",
    });
  } catch (error) {
    return next(error);
  }
}
