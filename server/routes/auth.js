import express from "express";
import { createUser, getUserById } from "../userModel.js";

const router = express.Router();

// 회원가입
router.post("/signup", (req, res) => {
  const { userId, password, nickname } = req.body;
  if (!userId || !password || !nickname)
    return res.status(400).json({ error: "모든 칸을 입력해야함" });

  const result = createUser({ id: userId, password, nickname });
  if (!result.success) return res.status(409).json({ error: result.error });

  res.json({ success: true });
});

// 로그인
router.post("/login", (req, res) => {
  console.log("로그인 요청:", req.body);
  const { userId, password } = req.body;
  const user = getUserById(userId);
  console.log("로그인 시도한 사용자:", user);
  if (!user || user.password !== password)
    return res.status(401).json({ message: "ID 또는 비밀번호 오류" });

  // 보안을 위해 비밀번호는 제외하고 반환
  const { password: pw, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// 사용자 정보 업데이트
router.put("/update", (req, res) => {
  const { userId, ...userData } = req.body;
  if (!userId || !userData)
    return res.status(400).json({ error: "잘못된 입력 값" });

  const user = getUserById(userId);
  if (!user)
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });

  // 사용자 정보 업데이트 로직 추가 필요
  // 예: db.prepare('UPDATE users SET ... WHERE id = ?').run(userData, userId);
  // ...

  res.json({ success: true });
});

// 사용자 정보 조회
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const user = getUserById(userId);
  if (!user)
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });

  // 보안을 위해 비밀번호는 제외하고 반환
  const { password: pw, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// 사용자 정보 삭제
router.delete("/:userId", (req, res) => {
  const { userId } = req.params;
  const user = getUserById(userId);
  if (!user)
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });

  // 사용자 정보 삭제 로직 추가 필요
  // 예: db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  // ...

  res.json({ success: true });
});

// 사용자 정보 조회 (모든 사용자)
router.get("/", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  if (!users) return res.status(404).json({ error: "NO_USERS_FOUND" });

  const safeUsers = users.map((user) => {
    const { password: pw, ...safeUser } = user;
    return safeUser;
  });

  res.json({ success: true, users: safeUsers });
});

// 사용자 정보 업데이트 (특정 필드만)
router.put("/:userId", (req, res) => {
  const { userId } = req.params;
  const { field, value } = req.body;

  if (!userId || !field || !value)
    return res.status(400).json({ error: "MISSING_FIELDS" });

  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

  // 사용자 정보 업데이트 로직 추가 필요
  // 예: db.prepare('UPDATE users SET field = ? WHERE id = ?').run(value, userId);
  // ...

  res.json({ success: true });
});

// 사용자 정보 삭제 (특정 필드만)
router.delete("/:userId/:field", (req, res) => {
  const { userId, field } = req.params;

  if (!userId || !field)
    return res.status(400).json({ error: "MISSING_FIELDS" });

  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

  // 사용자 정보 삭제 로직 추가 필요
  // 예: db.prepare('UPDATE users SET field = NULL WHERE id = ?').run(userId);
  // ...

  res.json({ success: true });
});

export default router;
