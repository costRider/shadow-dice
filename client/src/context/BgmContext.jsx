// src/context/BgmContext.jsx
import { createContext, useContext } from 'react';
import usePageBgm from '@/hooks/usePageBgm';

const defaultValue = {
    isPlaying: false,
    volume: 0.4,
    play: () => { },
    stop: () => { },
    setVolume: () => { },
};

const BgmContext = createContext(defaultValue);

export function BgmProvider({ children }) {
    const bgm = usePageBgm();
    return <BgmContext.Provider value={bgm}>{children}</BgmContext.Provider>;
}

export function useBgm() {
    const context = useContext(BgmContext);
    if (!context) {
        throw new Error('useBgm must be used within a BgmProvider');
    }
    return context;
}
