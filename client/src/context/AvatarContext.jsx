// src/context/AvatarContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AvatarContext = createContext();

export function AvatarProvider({ children }) {
  const [partDepth, setPartDepth] = useState({});
  const [avatarsByGender, setAvatarsByGender] = useState({ F: [], M: [] });

  // (1) 표정 리스트/갯수
  const expList = [
    { key: "default", label: "기본" },
    { key: "haha", label: "하하" },
    { key: "angry", label: "우씨" },
    { key: "cry", label: "으앙" },
    { key: "happy", label: "좋아" },
    { key: "shock", label: "헉" },
  ];
  const expCounts = { default: 1, haha: 5, angry: 6, cry: 6, happy: 6, shock: 6 };

  // (2) 부위별 depth 로드
  useEffect(() => {
    fetch("/api/parts")
      .then(r => r.json())
      .then(data => {
        const map = {};
        data.forEach(p => map[p.part_code] = p.depth);
        setPartDepth(map);
      })
      .catch(() => setPartDepth({}));
  }, []);

  // (3) 아바타 메타 + 기본 아이템 로드
  const loadAvatars = (gender) => {
    if (avatarsByGender[gender]?.length) return; // 이미 불러왔으면 skip
    fetch(`/api/avatars?gender=${gender}`)
      .then(r => r.json())
      .then(data => {
        // API 리턴: { code, name, gender, description, image_path: bodyPath, defaultItems: [...] }
        setAvatarsByGender(prev => ({ ...prev, [gender]: data || [] }));
      });
  };

  // (4) body 레이어 객체 생성
  const getBodyLayer = (avatar) => ({
    part_code: "BODY",
    id: `body_${avatar.code}`,
    image_path: avatar.image_path,    // avatars.image_path 에서 내려받은 마네킹 경로
  });

  // (5) 표정 레이어 객체 생성 헬퍼
  const getExpressionLayer = (avatarCode, expKey, expNum, gender) => {
    const suffix = expKey === "default" ? "" : expNum;
    return {
      part_code: "EXP",
      id: `exp_${avatarCode}_${expKey}${suffix}_${gender}`,
      image_path: `items/expressions/${avatarCode}_${expKey}${suffix}_${gender}.gif`,
    };
  };

  return (
    <AvatarContext.Provider value={{
      partDepth,
      expList,
      expCounts,
      avatarsByGender,
      loadAvatars,
      getBodyLayer,
      getExpressionLayer,
    }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  return useContext(AvatarContext);
}
