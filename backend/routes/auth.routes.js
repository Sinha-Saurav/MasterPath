
import { Router } from "express";
import { 
    register,
    login,
    refreshSession,
    logout,
    forgotPassword,
    recoverySession,
    updatePassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshSession);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/recovery-session", recoverySession);
router.put("/update-password", updatePassword);

export default router;
