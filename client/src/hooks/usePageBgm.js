// src/hooks/usePageBgm.js
import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import audioRef from './audioInstance'; // ✅ 공유 인스턴스

const BGM_BASE_URL = import.meta.env.VITE_BGM_URL;

const pageBgmMap = {
    '/': `${BGM_BASE_URL}Log-in.mp3`,
    '/lobby': `${BGM_BASE_URL}Anomarad_Sky.mp3`,
    '/gamelobby': `${BGM_BASE_URL}Break_Time.mp3`,
    '/game': `${BGM_BASE_URL}game.mp3`,
};

export default function usePageBgm() {
    const location = useLocation();
    const [isPlaying, setIsPlaying] = useState(true); // 기본 자동 재생
    const [volume, setVolume] = useState(0.4); // 기본 볼륨

    const play = useCallback(() => {
        console.log('🎵 [Play] 버튼 클릭됨');
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.play();
            setIsPlaying(true);
        }
    }, [volume]);

    const stop = useCallback(() => {
        console.log('⏸️ [Stop] 버튼 클릭됨');
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            console.log('🛑 정지됨');
        } else {
            console.warn('⚠️ audioRef 없음 (정지할 것 없음)');
        }
    }, []);

    const setVolumeLevel = useCallback((v) => {
        const vol = Math.max(0, Math.min(1, v)); // 0 ~ 1 제한
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
    }, []);

    useEffect(() => {
        const path = location.pathname;
        const src = pageBgmMap[path];

        if (!src) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setIsPlaying(false);
            return;
        }

        const newAudio = new Audio(src);
        newAudio.loop = true;
        newAudio.volume = volume;

        newAudio.play()
            .then(() => {
                // ✅ play() 성공 이후에만 기존 audio 중단 및 교체
                if (audioRef.current) {
                    audioRef.current.pause();
                }
                audioRef.current = newAudio;
                setIsPlaying(true);
            })
            .catch((err) => {
                console.warn('🔇 BGM 재생 실패:', err.message);
                setIsPlaying(false);
            });

        return () => {
            // 컴포넌트 unmount 시 정리
            newAudio.pause();
        };
    }, [location.pathname]);
    return {
        isPlaying,
        volume,
        play,
        stop,
        setVolume: setVolumeLevel,
    };
}
