import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Grid, Eye, Sliders, Download } from 'lucide-react';
import { LesionImage } from '../types';

interface DermoscopyViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: LesionImage | null;
  patientName?: string;
  lesionSite?: string;
}

export const DermoscopyViewerModal: React.FC<DermoscopyViewerModalProps> = ({
  isOpen,
  onClose,
  image,
  patientName,
  lesionSite,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [filterMode, setFilterMode] = useState<'normal' | 'high-contrast' | 'red-free' | 'invert'>('normal');

  if (!isOpen || !image) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFilterMode('normal');
  };

  const getFilterStyle = () => {
    switch (filterMode) {
      case 'high-contrast':
        return 'contrast-150 brightness-95 saturate-125';
      case 'red-free':
        // Red-free / green filter enhances vascular structures like arborizing telangiectasia
        return 'hue-rotate-90 saturate-200 contrast-125';
      case 'invert':
        return 'invert contrast-125';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 select-none">
      <div className="relative w-full max-w-5xl h-[92vh] bg-slate-900 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-800">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-slate-800 text-white gap-3 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                image.type === 'dermoscopy' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {image.type === 'dermoscopy' ? 'DERMOSCOPY' : 'MACROSCOPIC'}
              </span>
              <h4 className="text-sm font-semibold text-slate-100">{image.label || 'Chi tiết hình ảnh'}</h4>
            </div>
            <p className="text-xs text-slate-400">
              {patientName ? `${patientName} • ` : ''}{lesionSite ? `${lesionSite} • ` : ''}Độ phóng đại: {image.magnification || '10x'}
            </p>
          </div>

          {/* Viewer Tools */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-slate-300">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1" />
            <button
              onClick={handleRotate}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Xoay 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-lg transition ${
                showGrid ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Thước lưới vi thể Dermoscopy (1mm)"
            >
              <Grid className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1" />
            {/* Filter selection */}
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as any)}
              className="text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none"
              title="Bộ lọc quang học"
            >
              <option value="normal">Màu tự nhiên</option>
              <option value="high-contrast">Tương phản cao (Mạng sắc tố)</option>
              <option value="red-free">Lọc không đỏ (Nổi mạch máu)</option>
              <option value="invert">Âm bản (Phân tích biên)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={image.dataUrl}
              download={`dermoscopy-${image.id}.jpg`}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Tải ảnh gốc"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center">
          <div
            className="transition-transform duration-100 ease-out cursor-grab active:cursor-grabbing flex items-center justify-center max-w-full max-h-full"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={image.dataUrl}
              alt="Dermoscopy detail"
              className={`max-w-[85vw] max-h-[75vh] object-contain rounded-lg shadow-2xl transition ${getFilterStyle()}`}
            />
          </div>

          {/* 1mm Dermoscopic Reticle Scale Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-72 h-72 rounded-full border border-blue-400/40 grid grid-cols-6 grid-rows-6 shadow-inner">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="border border-blue-400/15" />
                ))}
              </div>
              <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-xs text-blue-300 text-xs px-3 py-1.5 rounded-lg border border-blue-500/30 flex items-center gap-2">
                <Grid className="w-3.5 h-3.5 text-blue-400" />
                <span>Mỗi ô lưới = 1.0 mm (Chuẩn kính soi da)</span>
              </div>
            </div>
          )}

          {/* Information Pill */}
          <div className="absolute bottom-6 right-6 bg-slate-900/80 backdrop-blur-xs text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-3">
            <span>Ngày chụp: {new Date(image.takenAt).toLocaleDateString('vi-VN')}</span>
            <button
              onClick={handleReset}
              className="text-blue-400 hover:underline font-medium"
            >
              Đặt lại (100%)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
