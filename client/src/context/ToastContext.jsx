// client/src/context/ToastContext.jsx
import React, { createContext, useState, useCallback, useContext } from 'react';

let _toastFn = (msg) => console.warn('Toast not initialized:', msg);

// ① 모듈 스코프에 순수 toast 함수 내보내기
export function toast(message) {
    _toastFn(message);
}

// ② Context & Provider
const ToastContext = createContext({
    toast: (message) => { },
});

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const toastFn = useCallback((message) => {
        setToasts((prev) => [...prev, message]);
        setTimeout(() => setToasts((prev) => prev.slice(1)), 3000);
    }, []);

    // ③ provider가 마운트될 때, 모듈 스코프 함수에도 걸어둔다
    _toastFn = toastFn;

    return (
        <ToastContext.Provider value={{ toast: toastFn }}>
            {children}
            <div className="fixed bottom-4 right-4 space-y-2 z-50">
                {toasts.map((msg, i) => (
                    <div
                        key={i}
                        className="bg-amber-400 bg-opacity-75 text-black px-4 py-2 rounded-lg shadow-lg"
                    >
                        {'📢 알림 : ' + msg}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const { toast } = useContext(ToastContext);
    if (!toast) throw new Error('useToast must be inside ToastProvider');
    return toast;
};
