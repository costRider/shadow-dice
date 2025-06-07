import db from '../config/db.js';

// 아바타 전체 목록 + BODY(avatars.image_path)를 defaultItems로 포함
export function getAvatars({ gender }) {
    // avatars.code == avatar_items.avatar_concept (혹은 avatar_code)
    let query = `SELECT code, name, gender, description, image_path FROM avatars`;
    const params = [];
    if (gender && (gender === "M" || gender === "F")) {
        query += ` WHERE gender=?`;
        params.push(gender);
    }
    const avatars = db.prepare(query).all(...params);

    return avatars.map(avatar => {
        // BODY는 avatar의 image_path를 사용 (part_code: "BODY")
        const bodyItem = {
            part_code: "BODY",
            id: `body_${avatar.code}`,
            image_path: avatar.image_path, // avatars 테이블의 body 이미지 경로
        };
        // 기본 장착 아이템 (코스튬/장비)
        const defaultItems = db.prepare(
            `SELECT part_code, id, image_path FROM avatar_items WHERE is_default=1 AND avatar_concept=? AND gender=?`
        ).all(avatar.code, avatar.gender);

        // BODY를 맨 앞에 추가 (뎁스에서 항상 0~1로 처리)
        return {
            ...avatar,
            defaultItems: [bodyItem, ...defaultItems]
        };
    });
}

// 부위-뎁스 매핑정보 반환 (전역적 사용 용이)
export function getAllAvatarParts() {
    return db.prepare(
        "SELECT part_code, depth FROM avatar_parts"
    ).all();
}
