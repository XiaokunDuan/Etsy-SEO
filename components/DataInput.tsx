import React from 'react';

interface DataInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const DataInput: React.FC<DataInputProps> = ({ value, onChange }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        2. 粘贴原始数据 (Raw Data from eRank/Etsy)
      </label>
      <textarea
        className="flex-1 w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm bg-slate-50"
        placeholder={`粘贴示例:\n\nCute Coaster  1520 searches  24000 competition\nDesk Mat  540 searches  1200 listings\nCrochet Pattern  8000 searches  50000 listings...`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
      />
      <p className="text-xs text-slate-500 mt-2">
        提示：直接从 eRank 或 Etsy 搜索栏复制粘贴即可，AI 会自动提取数据。
      </p>
    </div>
  );
};
