const API_BASE = "http://localhost:4000/api/auth";

// 가입 api
export async function signup({ userId, password, nickname }) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, password, nickname }),
  });
  return res.json();
}

// 로그인 api
export async function loginUser(userId, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }

  return await data;
}
