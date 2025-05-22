const API_BASE = "http://localhost:4000/api/user";

export async function updateUser(user) {
  const res = await fetch(`${API_BASE}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
}
