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

  // ─── 4) 착장 상태 관리 (아바타룸) ───
  //    + code: 어떤 base-avatar(meta.code)를 쓸지
  const [avatarState, setAvatarState] = useState({
    gender,
    code: user?.avatar_code,                   // ← 추가
    equippedItems: {},
    expression: user?.expression || "default", // 로그인 유저의 기본 표정
    expNumber: user?.exp_number || 1,
  });

  // 착장 상태 관리(상점용)
  const [previewOnlyState, setPreviewOnlyState] = useState({
    gender,
    code: user?.avatar_code || "default",
    equippedItems: {},
    expression: user?.expression || "default",
    expNumber: user?.exp_number || 1,
  });

  const previewEquip = ({ partCode, itemId, thumbnailUrl }) => {
    const url = thumbnailUrl.startsWith("/resources/")
      ? thumbnailUrl
      : `/resources/avatar/${thumbnailUrl}`;

    setAvatarState(prev => updateEquipState(prev, partCode, itemId, url));
    setPreviewOnlyState(prev => updateEquipState(prev, partCode, itemId, url));
  };


  function resetEquip(partCode) {
    setAvatarState(prev => clearEquipState(prev, partCode));
    setPreviewOnlyState(prev => clearEquipState(prev, partCode));
  }

  function clearEquipState(prev, partCode) {
    const eq = { ...prev.equippedItems };
    if (partCode) delete eq[partCode];
    else return { ...prev, equippedItems: {} };
    return { ...prev, equippedItems: eq };
  }

  function updateEquipState(prev, partCode, itemId, url) {
    const eq = { ...prev.equippedItems };
    if (eq[partCode]?.id === itemId) {
      delete eq[partCode];
    } else {
      eq[partCode] = { id: itemId, thumbnailUrl: url };
    }
    return { ...prev, equippedItems: eq };
  }

  useEffect(() => {
    if (user) {
      const nextState = {
        gender: user.avatar_gender,
        code: user.avatar_code,
        expression: user.expression,
        expNumber: user.exp_number,
        equippedItems: {},
      };
      setAvatarState(nextState);
      setPreviewOnlyState(nextState);
    }
  }, [user]);

  function getBodyLayer(partCode, equippedItem, targetGender = gender) {
    if (!equippedItem) return null;

    // ① thumbnailUrl 직접 사용
    if (typeof equippedItem === "object" && equippedItem.thumbnailUrl) {
      return equippedItem.thumbnailUrl;
    }

    // ② fallback: 기존 defaultItems 구조 (id 매칭)
    const itemId = typeof equippedItem === "object" ? equippedItem.id : equippedItem;
    const list = avatarsByGender[targetGender] || [];

    for (const avatar of list) {
      const def = avatar.defaultItems?.find(d => d.id === itemId);
      if (def?.image_path) {
        return toAvatarUrl(def.image_path);
      }
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
      avatarsByGender, loadAvatars, previewOnlyState, setPreviewOnlyState,
      partDepth, expList, expCounts, toAvatarUrl,
      avatarState, previewEquip, resetEquip,
      getBodyLayer, getExpressionLayer
    }}>
      {children}
    </AvatarContext.Provider>
  );
}

export const useAvatar = () => useContext(AvatarContext);

