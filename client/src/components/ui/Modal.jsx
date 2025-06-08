import React from "react";

export default function Modal({ title, onClose, children, width = "w-[410px]" }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
            <div
                className={`${width} bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-300 p-6 relative`}
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    ✕
                </button>
                {/* 제목 */}
                {title && (
                    <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">
                        {title}
                    </h2>
                )}
                {children}
            </div>
        </div>
    );
}
