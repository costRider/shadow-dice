// 예: src/middleware/authenticate.js
export default function authenticate(req, res, next) {
    if (req.session && req.session.user) {
        // 세션에 저장된 안전한 사용자 정보
        req.user = req.session.user;
        return next();
    }
    return res.status(401).json({ message: "로그인이 필요합니다." });
}
