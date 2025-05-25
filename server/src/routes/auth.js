/*
import express from "express";
import { createUser, getUserById } from "../services/userModel.js";

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
  const { userId, password } = req.body;
  const user = getUserById(userId);
  if (!user || user.password !== password)
    return res.status(401).json({ message: "ID 또는 비밀번호 오류" });

  // 보안을 위해 비밀번호는 제외하고 반환
  const { password: pw, ...safeUser } = user;

  // 세션에 사용자 정보 저장
  console.log("세션에 저장된 사용자 정보:", safeUser);
  req.session.user = user;
  res.json({ success: true, user: safeUser });
});

// 사용자 정보 업데이트
router.put("/update", (req, res) => {
  //const { userId, ...userData } = req.body;
  const { userId, ...userData } = req.session.user;
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

// 사용자 로그아웃
router.post("/logout", (req, res) => {
  //const userId = req.body.userId;
  const userId = req.session.user.id;
  try {
    // updateUserStatus(userId, "OFFLINE");
    req.session.destroy(err => {
      if (err) return res.sendStatus(500);
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ ok: false, message: "Logout failed" });
  }

});


export default router;*/

import express from 'express';
import { createUser, getUserById } from '../services/userModel.js';

const router = express.Router();

// 회원가입
router.post('/signup', (req, res) => {
  const { userId, password, nickname } = req.body;
  if (!userId || !password || !nickname)
    return res.status(400).json({ error: '모든 칸을 입력해야 합니다.' });

  const result = createUser({ id: userId, password, nickname });
  if (!result.success)
    return res.status(409).json({ error: result.error });

  res.json({ success: true });
});

// 로그인
router.post('/login', (req, res) => {
  const { userId, password } = req.body;
  const user = getUserById(userId);
  if (!user || user.password !== password)
    return res.status(401).json({ message: 'ID 또는 비밀번호 오류' });

  // 보안을 위해 비밀번호 제거 후 반환
  const { password: pw, ...safeUser } = user;
  req.session.user = safeUser;
  console.log('세션에 저장된 사용자 정보:', safeUser);
  res.json({ success: true, user: safeUser });
});

// 로그아웃
router.post('/logout', (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(400).json({ error: '세션이 유효하지 않습니다.' });

  try {
    req.session.destroy(err => {
      if (err) return res.sendStatus(500);
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

export default router;


