import React from 'react';
import { AnalysisResult, QuadrantType, KeywordData } from '../types';
import { AnalysisChart } from './AnalysisChart';
import { Sparkles, TrendingUp, AlertTriangle, Trash2, Search } from 'lucide-react';

interface ResultsSectionProps {
  result: AnalysisResult;
}

const QuadrantIcon: React.FC<{ type: QuadrantType }> = ({ type }) => {
  switch (type) {
    case QuadrantType.GOLD_MINE: return <Sparkles className="w-4 h-4 text-emerald-500" />;
    case QuadrantType.LONG_TAIL: return <TrendingUp className="w-4 h-4 text-blue-500" />;
    case QuadrantType.WAR_ZONE: return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case QuadrantType.TRASH_RISK: return <Trash2 className="w-4 h-4 text-red-500" />;
    default: return null;
  }
};

const QuadrantLabel: React.FC<{ type: QuadrantType }> = ({ type }) => {
    switch (type) {
      case QuadrantType.GOLD_MINE: return <span className="text-emerald-700 font-bold">💎 黄金矿区</span>;
      case QuadrantType.LONG_TAIL: return <span className="text-blue-700 font-bold">🎯 长尾精准</span>;
      case QuadrantType.WAR_ZONE: return <span className="text-amber-700 font-bold">⚔️ 激烈战场</span>;
      case QuadrantType.TRASH_RISK: return <span className="text-red-700 font-bold">❌ 垃圾/风险</span>;
      default: return null;
    }
  };

export const ResultsSection: React.FC<ResultsSectionProps> = ({ result }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Product Context Header */}
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-4">
        <div className="bg-white p-2 rounded-lg shadow-sm">
            <Search className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
            <h3 className="font-semibold text-indigo-900">产品分析 (AI Vision)</h3>
            <p className="text-sm text-indigo-700 mt-1">
                <span className="font-medium">Niche:</span> {result.productContext.niche} • 
                <span className="font-medium ml-2">类型:</span> {result.productContext.isPhysical ? "实物商品 (Physical)" : "数字产品 (Digital)"} • 
                <span className="font-medium ml-2">风格:</span> {result.productContext.visualStyle}
            </p>
        </div>
      </div>

      {/* Chart */}
      <AnalysisChart data={result.keywords} />

      {/* Detailed Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">📋 关键词数据详情</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">象限</th>
                <th className="px-6 py-3">关键词</th>
                <th className="px-6 py-3 text-right">搜索量</th>
                <th className="px-6 py-3 text-right">竞争度</th>
                <th className="px-6 py-3">分析原因</th>
              </tr>
            </thead>
            <tbody>
              {result.keywords.sort((a,b) => b.searchVolume - a.searchVolume).map((kw, idx) => (
                <tr key={idx} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <QuadrantLabel type={kw.quadrant as QuadrantType} />
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{kw.keyword}</td>
                  <td className="px-6 py-4 text-right font-mono">{kw.searchVolume.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-500">{kw.competition.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={kw.reason}>{kw.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Value Analysis */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            💡 价值与策略分析
          </h3>
          <div className="prose prose-sm prose-slate max-w-none text-slate-600 whitespace-pre-line">
            {result.valueAnalysis}
          </div>
        </div>

        {/* Pricing & Next Steps */}
        <div className="space-y-6">
             <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    💰 定价建议
                </h3>
                <div className="prose prose-sm prose-slate max-w-none text-slate-600 whitespace-pre-line">
                    {result.pricingStrategy}
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    🚀 下一步搜索建议 (Action Plan)
                </h3>
                <p className="text-indigo-100 text-sm mb-4">请在 eRank 中搜索以下新词，填补当前数据的空白：</p>
                <div className="flex flex-wrap gap-2">
                    {result.nextSteps.map((step, idx) => (
                        <span key={idx} className="bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10">
                            {step}
                        </span>
                    ))}
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};
