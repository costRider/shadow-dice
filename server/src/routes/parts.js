// src/routes/parts.js
import express from "express";
import { getAllAvatarParts } from "../services/avatar-utils.js";

const router = express.Router();

router.get("/", (req, res) => {
    try {
        const parts = getAllAvatarParts();
        res.json(parts);
    } catch (err) {
        console.error("[parts 라우트 에러]", err);
        res.status(500).json({ error: "서버 오류: 매핑 정보 전달 실패" });
    }
});

export default router;
