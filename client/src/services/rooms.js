const API_BASE = "http://localhost:4000/api/rooms";

// room
export async function fetchRooms() {
  const res = await fetch(`${API_BASE}/list`);
  return res.json();
}

export async function createRoomAPI(roomData) {
  const res = await fetch(`${API_BASE}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(roomData),
  });
  return res.json();
}

export async function joinRoomAPI(roomId, userId) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return res.json();
}

export async function readyRoomAPI(roomId, userId, isReady) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/ready`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, isReady }),
  });
  return res.json();
}

export async function startRoomAPI(roomId) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/start`, {
    method: "PUT",
  });
  return res.json();
}
