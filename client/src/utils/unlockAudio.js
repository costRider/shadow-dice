// src/utils/unlockAudio.js
export default function unlockAudio() {
    const emptyAudio = new Audio();
    emptyAudio.play().catch(() => { });
}
