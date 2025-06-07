// src/context/AvatarContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AvatarContext = createContext();

export function AvatarProvider({ children }) {
  const [partDepth, setPartDepth] = useState({});
  const expList = [
    { key: "default", label: "기본" },
    { key: "haha", label: "하하" },
    { key: "angry", label: "우씨" },
    { key: "cry", label: "으앙" },
    { key: "happy", label: "좋아" },
    { key: "shock", label: "헉" },
  ];
  const expCounts = { default: 1, haha: 5, angry: 6, cry: 6, happy: 6, shock: 6 };

  const chatToExpMap = [
    { exp: "haha", keywords: ["ㅋㅋ", "ㅎㅎ", "하하", "ㅋㅋㅋㅋ", "ㅋㅋㅋ"] },
    { exp: "cry", keywords: ["ㅠㅠ", "ㅜㅜ", "으앙", "안돼", '안되'] },
    { exp: "angry", keywords: ["화남", "짜증", "우씨", "아씨", "씨발", "ㅆㅂ", "ㅅㅂ"] },
    { exp: "happy", keywords: ["좋아", "굿", "멋짐", "최고", "대박"] },
    { exp: "shock", keywords: ["헉", "헐", "깜짝"] },
  ];
  const getExpressionByChat = (msg) => {
    for (const map of chatToExpMap)
      if (map.keywords.some((kw) => msg.includes(kw)))
        return map.exp;
    return "default";
  };

  useEffect(() => {
    fetch("/api/parts")
      .then(res => res.json())
      .then(data => {
        const map = {};
        data.forEach(part => { map[part.part_code] = part.depth; });
        setPartDepth(map);
      });
  }, []);

  return (
    <AvatarContext.Provider value={{
      partDepth,
      expList,
      expCounts,
      getExpressionByChat
    }}>
      {children}
    </AvatarContext.Provider>
  );
}
export function useAvatar() {
  return useContext(AvatarContext);
}
