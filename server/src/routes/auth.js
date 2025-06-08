import express from 'express';
import { createUser, getUserBasic, getUserProfile } from '../services/userModel.js';
import { grantDailyGP } from '../services/userService.js';

const router = express.Router();

// 회원가입
router.post('/signup', (req, res) => {
  const user = req.body;
  const { userId, password, nickname, avatarCode, gender } = user;
  if (!userId || !password || !nickname) {
    return res.status(400).json({ error: '모든 칸을 입력해야 합니다.' });
  }
  if (!avatarCode || !gender) {
    return res.status(400).json({ error: '아바타를 선택 해 주세요.' });
  }
  // createUser에서 반환된 error 코드를 그대로 전달
  const result = createUser({
    id: userId,
    password,
    nickname,
    avatarCode,
    gender,
    avatarExpression: "default"
  });

  if (!result.success) {
    // result.error: 'DUPLICATE_ID' | 'DUPLICATE_NICKNAME' | 'DUPLICATE' | 기타 에러 메시지
    return res.status(409).json({ success: false, error: result.error });
  }

  res.json({ success: true });
});

// 로그인
router.post('/login', (req, res) => {
  const { userId, password } = req.body;
  const userBasic = getUserBasic(userId);
  console.log('로그인 시도:', userId);
  // 1) 유저가 없거나 비밀번호가 틀리면
  if (!userBasic || userBasic.password !== password) {
    return res
      .status(401)
      .json({ success: false, message: 'ID 또는 비밀번호 오류' });
  }

  // 현재 로그인을 시도한 id의 status 가 OFFLINE이 아니면
  if (userBasic.status !== 'OFFLINE') {
    return res
      .status(403)
      .json({ success: false, message: '이미 로그인되어 있습니다.' });
  }

  const granted = grantDailyGP(userBasic.id);

  // 3) 프로필 전체 조립
  const user = getUserProfile(userId);
  if (!user) {
    return res.status(500).json({ success: false, message: "유저 프로필 로드 실패" });
  }

  //로그인 보너스 
  if (granted) { user.gp += 100; }

  const { password: pw, ...safeUser } = user; // 비밀번호 걸러내기
  req.session.user = safeUser;
  console.log('세션에 저장된 사용자 정보:', safeUser);

  // 4) success 플래그와 함께 유저 정보 리턴
  res.json({ success: true, user: safeUser, grantedDailyGP: granted });
  console.log('로그인 성공:', safeUser);
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


