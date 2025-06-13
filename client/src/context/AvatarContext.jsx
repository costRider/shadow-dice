// src/context/AvatarContext.jsx
import React, {
  createContext, useContext,
  useState, useEffect, useCallback
} from "react";
import useAuth from "@/hooks/useAuth";

const AvatarContext = createContext();

export function AvatarProvider({ children }) {
  const { user } = useAuth();
  const [gender, setGender] = useState(user?.avatar_gender || "F");
  const [partDepth, setPartDepth] = useState({});
  const [avatarsByGender, setAvatarsByGender] = useState({ F: [], M: [] });

  const expList = [
    { key: "default", label: "기본" },
    { key: "haha", label: "하하" },
    { key: "angry", label: "우씨" },
    { key: "cry", label: "으앙" },
    { key: "happy", label: "좋아" },
    { key: "shock", label: "헉" },
  ];
  const expCounts = { default: 1, haha: 5, angry: 6, cry: 6, happy: 6, shock: 6 };

  // ─── 리소스 URL 헬퍼 ───
  const toAvatarUrl = useCallback(path => path ? `/resources/avatar/${path}` : null, []);

  // ─── 1) 성별별 메타 한 번만 로드
  const loadAvatars = useCallback(async g => {
    if (avatarsByGender[g]?.length) return;
    const res = await fetch(`/api/avatars?gender=${g}`);
    const data = await res.json();
    setAvatarsByGender(prev => ({ ...prev, [g]: data || [] }));
  }, [avatarsByGender]);

  useEffect(() => { loadAvatars(gender); }, [gender, loadAvatars]);

  // ─── 2) 파트 depth 로드 ───
  useEffect(() => {
    fetch("/api/parts")
      .then(r => r.json())
      .then(arr => {
        const m = {};
        arr.forEach(p => { m[p.part_code] = p.depth; });
        setPartDepth(m);
      })
      .catch(() => setPartDepth({}));
  }, []);

  // ─── 3) 로그인 유저 gender 동기화 ───
  useEffect(() => {
    if (user?.avatar_gender && user.avatar_gender !== gender) {
      setGender(user.avatar_gender);
    }
  }, [user?.avatar_gender]);

  /*
    // ─── 4) 착장 상태 관리 (상점용) ───
    const [avatarState, setAvatarState] = useState({
      gender, equippedItems: {}, expression: "default", expNumber: 1
    });
  */
  // ─── 4) 착장 상태 관리 (상점용) ───
  //    + code: 어떤 base-avatar(meta.code)를 쓸지
  const [avatarState, setAvatarState] = useState({
    gender,
    code: user?.avatar_code,                   // ← 추가
    equippedItems: {},
    expression: user?.expression || "default", // 로그인 유저의 기본 표정
    expNumber: user?.exp_number || 1,
  });



  const previewEquip = ({ partCode, itemId }) => {
    setAvatarState(s => {
      const eq = { ...s.equippedItems };
      if (eq[partCode] === itemId) delete eq[partCode];
      else eq[partCode] = itemId;
      return { ...s, equippedItems: eq };
    });
  };
  const resetEquip = () => setAvatarState(s => ({ ...s, equippedItems: {} }));
  /*
    // ─── 5) getBodyLayer: targetGender 인자 추가 (변경) ───
    function getBodyLayer(partCode, itemId, targetGender = gender) {
      const list = avatarsByGender[targetGender] || [];
      const meta = list.find(a => a.code === itemId)
        || list.find(a => a.defaultItems?.some(d => d.id === itemId));
      if (!meta?.image_path) return null;
      return toAvatarUrl(meta.image_path);
    }
  */
  // 로그인 유저 프로필이 바뀌면 code/표정도 갱신해 주기
  useEffect(() => {
    if (user) {
      setAvatarState(s => ({
        ...s,
        gender: user.avatar_gender,
        code: user.avatar_code,
        expression: user.expression,
        expNumber: user.exp_number
      }));
    }
  }, [user]);

  function getBodyLayer(partCode, itemId, targetGender = gender) {
    const list = avatarsByGender[targetGender] || [];

    // 1) defaultItems 에서 id 매핑 우선 찾기
    for (const avatar of list) {
      const def = avatar.defaultItems?.find(d => d.id === itemId);
      if (def?.image_path) {
        return toAvatarUrl(def.image_path);
      }
    }

    // 2) avatar.code 에 매핑
    const meta = list.find(a => a.code === itemId);
    if (meta?.image_path) {
      return toAvatarUrl(meta.image_path);
    }

    return null;
  }

  // ─── 6) getExpressionLayer: targetGender 인자 추가 (변경) ───
  function getExpressionLayer(avatarCode, expKey, expNum, targetGender = gender) {
    const suffix = expKey === "default" ? "" : expNum;
    const filename = `items/expressions/${avatarCode}_${expKey}${suffix}_${targetGender}.gif`;
    return toAvatarUrl(filename);
  }

  return (
    <AvatarContext.Provider value={{
      gender, setGender,
      avatarsByGender, loadAvatars,
      partDepth, expList, expCounts, toAvatarUrl,
      avatarState, previewEquip, resetEquip,
      getBodyLayer, getExpressionLayer
    }}>
      {children}
    </AvatarContext.Provider>
  );
}

export const useAvatar = () => useContext(AvatarContext);

