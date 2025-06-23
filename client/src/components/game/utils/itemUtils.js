export function getRandomItem() {
    const sampleItems = [
        "4칸전후진",
        "어빌-50",
        "왕폭탄",
        "여신의신발",
        "어빌+25",
        "저주",
        "체인지",
        "키퍼A",
        "키퍼B",
        "키퍼C",
        "홀수저주",
        "짝수저주",
        "비둘기",
        "어빌+50",
        "어빌-25",
        "오리발",
        "자폭",
        "아마게돈",
        "날개",
        "지혜의반지"
    ];
    const name = sampleItems[Math.floor(Math.random() * sampleItems.length)];
    return { id: Date.now(), name };
}
