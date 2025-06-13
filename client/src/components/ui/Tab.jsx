import React from 'react';

/**
 * Tab component
 * @param {{ key: string, label: string }[]} tabs - Array of tab definitions
 * @param {string} activeKey - Currently active tab key
 * @param {(key: string) => void} onChange - Callback when a tab is clicked
 */
export default function Tab({ tabs, activeKey, onChange }) {
    return (
        <div className="flex border-b">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={`px-4 py-2 -mb-px font-medium focus:outline-none transition-colors duration-150 ease-in-out
            ${activeKey === tab.key ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
