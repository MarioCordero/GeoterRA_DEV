import React from 'react';

/**
 * PillTabs component for GeoterRA CRUD views.
 * Renders tab pills with icons, labels, and record counts.
 * 
 * @param {Array<{key: string, label: string, icon?: React.ReactNode, count?: number}>} items
 * @param {string} activeKey
 * @param {(key: string) => void} onChange
 */
const PillTabs = ({ items = [], activeKey, onChange }) => (
  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
    <div className="flex gap-2 flex-wrap">
      {items.map(({ key, label, icon, count }) => {
        const active = key === activeKey;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              active
                ? 'bg-[#12467E] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {icon}
            <span>{label}</span>
            {count !== undefined && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export default PillTabs;

