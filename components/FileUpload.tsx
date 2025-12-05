import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Plus, Loader2 } from 'lucide-react';
import { FileItem } from '../types';

interface FileUploadProps {
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
}

// Helper to resize image
const resizeImage = (file: File): Promise<{ base64: string, preview: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Resize to max 800px width
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          const base64Content = dataUrl.split(',')[1];
          resolve({ base64: base64Content, preview: dataUrl });
        } else {
            reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesChange }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      const newFiles: FileItem[] = [];
      const fileList = Array.from(e.target.files) as File[];
      
      try {
        for (const file of fileList) {
            // Process images sequentially to avoid browser hanging on many large files
            const { base64, preview } = await resizeImage(file);
            newFiles.push({
                id: Math.random().toString(36).substring(7),
                file,
                previewUrl: preview,
                base64: base64,
            });
        }
        onFilesChange([...files, ...newFiles]);
      } catch (error) {
        console.error("Error processing images:", error);
        alert("图片处理失败，请尝试上传较小的图片。");
      } finally {
        setIsProcessing(false);
      }
    }
  }, [files, onFilesChange]);

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        1. 上传产品图片 (Product Images)
      </label>
      
      <div className="space-y-4">
        {/* Upload Area */}
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isProcessing ? (
                <>
                    <Loader2 className="w-8 h-8 mb-2 text-indigo-500 animate-spin" />
                    <p className="mb-1 text-sm text-slate-500">正在优化图片...</p>
                </>
            ) : (
                <>
                    <Upload className="w-8 h-8 mb-2 text-slate-500" />
                    <p className="mb-1 text-sm text-slate-500">
                    <span className="font-semibold">点击上传</span> 或拖拽多张图片
                    </p>
                    <p className="text-xs text-slate-500">支持多选 (PNG, JPG) - 自动压缩</p>
                </>
            )}
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleFileChange}
            disabled={isProcessing} 
          />
        </label>

        {/* Preview Grid */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
            {files.map((item) => (
              <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                <img 
                  src={item.previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                      onClick={() => removeFile(item.id)}
                      className="bg-white/90 p-1.5 rounded-full hover:bg-white text-red-500 transition-colors shadow-sm"
                  >
                      <X size={18} />
                  </button>
                </div>
                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded max-w-[90%] truncate">
                  {item.file.name}
                </div>
              </div>
            ))}
            
            {/* Add More Button */}
            {!isProcessing && (
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-slate-200 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <Plus className="w-6 h-6 text-slate-400" />
                    <span className="text-xs text-slate-400 mt-1">添加更多</span>
                    <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFileChange} 
                    />
                </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
