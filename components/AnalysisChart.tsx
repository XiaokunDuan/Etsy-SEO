import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Label } from 'recharts';
import { KeywordData, QuadrantType } from '../types';

interface AnalysisChartProps {
  data: KeywordData[];
}

const COLORS = {
  [QuadrantType.GOLD_MINE]: '#10b981', // Emerald 500
  [QuadrantType.LONG_TAIL]: '#3b82f6', // Blue 500
  [QuadrantType.WAR_ZONE]: '#f59e0b', // Amber 500
  [QuadrantType.TRASH_RISK]: '#ef4444', // Red 500
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm z-50">
        <p className="font-bold text-slate-800 mb-1">{data.keyword}</p>
        <p className="text-slate-600">搜索量: <span className="font-mono font-semibold">{data.searchVolume}</span></p>
        <p className="text-slate-600">竞争度: <span className="font-mono font-semibold">{data.competition}</span></p>
        <p className="text-xs mt-2 text-slate-400 max-w-[200px]">{data.reason}</p>
      </div>
    );
  }
  return null;
};

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ data }) => {
  // Filter out data with 0 volume/competition to avoid log scale errors if we were using log
  // Ideally, use linear scale but clamp domains
  
  const chartData = data.map(d => ({ ...d }));

  return (
    <div className="w-full h-[400px] bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        📊 关键词象限矩阵 (The Matrix)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            dataKey="competition" 
            name="Competition" 
            label={{ value: '竞争度 (Listings)', position: 'bottom', offset: 0, fill: '#64748b' }}
            tick={{fontSize: 12, fill: '#64748b'}}
          />
          <YAxis 
            type="number" 
            dataKey="searchVolume" 
            name="Search Volume" 
            label={{ value: '搜索量 (Searches)', angle: -90, position: 'left', fill: '#64748b' }}
            tick={{fontSize: 12, fill: '#64748b'}}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Keywords" data={chartData} fill="#8884d8">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.quadrant] || '#94a3b8'} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-4 mt-2 justify-center text-xs text-slate-600">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> 💎 黄金矿区</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div> 🎯 长尾精准</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div> ⚔️ 激烈战场</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> ❌ 垃圾/风险</div>
      </div>
    </div>
  );
};
