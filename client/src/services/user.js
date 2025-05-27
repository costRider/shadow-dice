// client/src/services/user.js
import apiClient from './apiClient';

/**
 * 로비에 머물러 있는 온라인 사용자 리스트를 가져옵니다.
 * @returns {Promise<User[]>}
 */
export async function getLobbyUsers() {
  const { ok, data } = await apiClient.get('users/online');
  if (!ok) throw new Error(data.message || '로비 사용자 목록 조회 실패');
  // data.users: [ { id, nickname, avatar, ... }, ... ]
  return data.users;
}


/**
 * 사용자의 상태(status)를 업데이트합니다.
 * @param {string} userId
 * @param {string} status  // 'LOBBY', 'IN_ROOM', 'OFFLINE' 등
 */
export async function updateUserStatus(userId, status) {
  const { ok, data } = await apiClient.put(`users/${userId}/status`, { status });
  if (!ok) throw new Error(data.message || '사용자 상태 업데이트 실패');
  return data;
}

/**
 * 사용자 전체 정보를 서버에 동기화합니다.
 * @param {User} userData
 */
export async function updateUser(userData) {
  if (!userData || !userData.id) return null;
  const { ok, data } = await apiClient.put(`users/${userData.id}`, userData);
  if (!ok) throw new Error(data.message || '사용자 정보 업데이트 실패');
  return data;
}