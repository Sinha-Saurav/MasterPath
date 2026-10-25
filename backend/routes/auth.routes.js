
import { Router } from "express";
import { 
    register,
    login,
    refreshSession,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshSession);

export default router;
