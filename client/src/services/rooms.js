// client/src/services/room.js
import apiClient from './apiClient';

/**
 * 전체 방 목록 조회
 * @returns {Promise<Room[]>}
 */
export async function getRooms() {
  const { ok, data } = await apiClient.get('rooms/list');
  if (!ok) throw new Error(data.message || '방 목록 조회 실패');
  return data.rooms;
}

/**
 * 새 방 생성
 * @param {object} roomData
 * @param {string} roomData.name
 * @param {number} roomData.capacity
 * @param {boolean} roomData.isPrivate
 * @param {string} [roomData.password]
 * @returns {Promise<Room>}
 */
export async function createRoom(roomData) {
  const { ok, data } = await apiClient.post('rooms/create', roomData);
  if (!ok) throw new Error(data.message || '방 생성 실패');
  return data;
}

/**
 * 방 입장
 * @param {string} roomId
 * @param {string} userId
 * @returns {Promise<Room>}
 */
export async function joinRoom(roomId, userId) {
  const { ok, data } = await apiClient.post(`rooms/${roomId}/join`, { userId });
  if (!ok) throw new Error(data.message || '방 입장 실패');
  return data;
}

/**
 * 방 나가기
 * @param {string} roomId
 * @param {string} userId
 * @returns {Promise<Room>}
 * 
 */
export async function leaveRoom(roomId, userId) {
  const { ok, data } = await apiClient.post(`rooms/${roomId}/leave`, { userId });
  if (!ok) throw new Error(data.message || '방 나가기 실패');
  return data;
}

/**
 * 준비 상태 토글
 * @param {string} roomId
 * @param {string} userId
 * @param {boolean} isReady
 * @returns {Promise<Room>}  // 방 정보 갱신된 전체 객체 리턴 가정
 */
export async function readyRoom(roomId, userId, isReady) {
  const { ok, data } = await apiClient.put(`rooms/${roomId}/ready`, { userId, isReady });
  if (!ok) throw new Error(data.message || '준비 상태 변경 실패');
  return data;
}

/**
 * 게임 시작 (호스트만 호출)
 * @param {string} roomId
 * @returns {Promise<Room>}
 */
export async function startRoom(roomId) {
  const { ok, data } = await apiClient.put(`rooms/${roomId}/start`);
  if (!ok) throw new Error(data.message || '게임 시작 실패');
  return data;
}
