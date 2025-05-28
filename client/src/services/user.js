// client/src/services/user.js
import apiClient from './apiClient';

/**
 * 사용자의 상태(status)를 업데이트합니다.
 * @param {string} userId
 * @param {string} status  // 'LOBBY', 'IN_ROOM', 'OFFLINE' 등
 */
/*
export async function updateUserStatus(userId, status) {
  const { ok, data } = await apiClient.put(`users/${userId}/status`, { status });
  if (!ok) throw new Error(data.message || '사용자 상태 업데이트 실패');
  return data;
}
  */
export async function updateUserStatus(status) {
  // 기존: apiClient.put(`/users/${userId}/status`, { status })
  // 변경:
  const { ok, data } = await apiClient.put(`users/status`, { status });
  if (!ok) throw new Error(data?.message ?? '유저 상태 업데이트 실패');
  return data;
}


/**
 * 사용자 전체 정보를 서버에 동기화합니다.
 * @param {User} userData
 */
/*
export async function updateUser(userData) {
  if (!userData || !userData.id) return null;
  const { ok, data } = await apiClient.put(`users/${userData.id}`, userData);
  if (!ok) throw new Error(data.message || '사용자 정보 업데이트 실패');
  return data;
}*/
export async function updateUser(userData) {
  if (!userData || !userData.id) return null;
  const { ok, data } = await apiClient.put(`users/updateUser`, userData);
  if (!ok) throw new Error(data.message || '사용자 정보 업데이트 실패');
  return data;
}