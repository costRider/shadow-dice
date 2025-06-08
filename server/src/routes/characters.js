// src/routes/characters.js
import express from "express";
import { getCharacterResources } from "../services/character-service.js";

const router = express.Router();

router.get("/:code/resources", (req, res) => {
    const code = req.params.code;
    const resources = getCharacterResources(code);
    if (!resources) return res.status(404).json({ error: "Not found" });
    res.json(resources);
});
export default router;
