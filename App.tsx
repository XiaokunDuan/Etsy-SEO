import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataInput } from './components/DataInput';
import { ResultsSection } from './components/ResultsSection';
import { analyzeSeoData, generateInitialKeywords } from './services/geminiService';
import { FileItem, AnalysisResult } from './types';
import { Search, Loader2, BarChart2, Wand2, Copy, Check } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [rawData, setRawData] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New state for keyword suggestions
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerateKeywords = async () => {
    if (files.length === 0) {
      setError("请先上传图片，AI 才能分析并推荐关键词。");
      return;
    }
    setIsGeneratingKeywords(true);
    setError(null);
    try {
      const imagesBase64 = files.map(f => f.base64);
      const keywords = await generateInitialKeywords(imagesBase64);
      setSuggestedKeywords(keywords);
    } catch (err: any) {
      setError("无法生成关键词建议，请重试。");
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const handleCopyKeywords = () => {
    const text = suggestedKeywords.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("请至少上传一张产品图片。");
      return;
    }
    if (!rawData.trim()) {
      setError("请粘贴一些关键词数据。");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Extract base64 strings from all files
      const imagesBase64 = files.map(f => f.base64);
      const data = await analyzeSeoData(imagesBase64, rawData);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "分析过程中发生未知错误。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Etsy SEO 挖掘机
              </h1>
              <p className="text-xs text-slate-500 font-medium">Golden Keyword Finder</p>
            </div>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Section */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">找到你的 <span className="text-emerald-600">黄金关键词</span> 💎</h2>
          <p className="text-slate-600 max-w-2xl">
            上传产品图片并粘贴 eRank/Etsy 原始数据。AI 将自动分析视觉风格，剔除无效流量（如Pattern/PDF），并为您绘制 SEO 竞争矩阵。
          </p>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <FileUpload files={files} onFilesChange={setFiles} />
            </div>

            {/* Cold Start / Keyword Ideas Section */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                  <Wand2 className="w-4 h-4" /> 没思路？AI 帮你想词
                </h3>
              </div>
              <p className="text-xs text-indigo-700 mb-3">
                分析图片并生成适合搜索的关键词列表。
              </p>
              
              {!suggestedKeywords.length ? (
                <button 
                  onClick={handleGenerateKeywords}
                  disabled={isGeneratingKeywords || files.length === 0}
                  className={`w-full py-2 rounded-lg text-sm font-medium border transition-colors
                    ${files.length === 0 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                      : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                >
                  {isGeneratingKeywords ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> 分析中...
                    </span>
                  ) : "🪄 生成搜索词建议 (Generate Ideas)"}
                </button>
              ) : (
                <div className="animate-fade-in">
                  <div className="bg-white rounded-lg border border-indigo-200 p-3 max-h-40 overflow-y-auto mb-2">
                    <ul className="text-sm text-slate-600 space-y-1">
                      {suggestedKeywords.map((kw, i) => (
                        <li key={i} className="border-b border-slate-50 last:border-0 pb-1 last:pb-0">{kw}</li>
                      ))}
                    </ul>
                  </div>
                  <button 
                    onClick={handleCopyKeywords}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "已复制！" : "复制全部 (Copy All)"}
                  </button>
                  <p className="text-[10px] text-indigo-400 mt-2 text-center">
                    👆 复制后去 eRank 搜索，然后把数据粘贴到下方
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[300px] flex flex-col">
              <DataInput value={rawData} onChange={setRawData} />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || files.length === 0 || !rawData}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95
                ${isAnalyzing || files.length === 0 || !rawData
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/25'
                }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  正在深度挖掘...
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  开始分析 (Analyze)
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                 <span className="font-bold">Error:</span> {error}
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
             {result ? (
               <ResultsSection result={result} />
             ) : (
               <div className="h-full min-h-[500px] bg-slate-100/50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 p-8">
                  {!isAnalyzing ? (
                    <>
                      <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                        <BarChart2 className="w-10 h-10 text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-500">等待数据输入...</p>
                      <p className="text-sm mt-2 max-w-md text-center">
                        请在左侧上传图片和数据，AI 助手将为您生成可视化的 SEO 策略报告。
                      </p>
                    </>
                  ) : (
                    <div className="text-center">
                       <div className="w-24 h-24 relative mb-6 mx-auto">
                          <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                       </div>
                       <h3 className="text-xl font-semibold text-slate-700 mb-2">AI 正在思考中</h3>
                       <p className="text-slate-500">识别产品特征... 过滤垃圾词汇... 计算竞争象限...</p>
                    </div>
                  )}
               </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
}