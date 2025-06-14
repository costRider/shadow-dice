// src/components/PageBgmController.jsx
import React from 'react';
import { useBgm } from '@/context/BgmContext';

export default function PageBgmController() {
    const { isPlaying, volume, play, stop, setVolume } = useBgm();
    return (
        <div className="fixed bottom-4 right-4 bg-white/80 p-3 rounded-lg shadow-md flex items-center gap-3 z-50">
            <button
                onClick={isPlaying ? stop : play}
                className="px-3 py-1 bg-blue-500 text-white rounded"
            >
                {isPlaying ? '⏸️ Stop' : '▶️ Play'}
            </button>

            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24"
            />
        </div>
    );
}
