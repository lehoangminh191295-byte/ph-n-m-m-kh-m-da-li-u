import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Upload, Sliders } from 'lucide-react';
import { LesionImage } from '../types';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: LesionImage) => void;
  defaultType?: 'macroscopic' | 'dermoscopy';
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  defaultType = 'dermoscopy',
}) => {
  const [imageType, setImageType] = useState<'macroscopic' | 'dermoscopy'>(defaultType);
  const [magnification, setMagnification] = useState(defaultType === 'dermoscopy' ? '10x Polarized' : 'Macro 1:1');
  const [label, setLabel] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setImageType(defaultType);
    setMagnification(defaultType === 'dermoscopy' ? '10x Polarized' : 'Macro 1:1');
  }, [defaultType]);

  useEffect(() => {
    if (isOpen && !capturedDataUrl) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsStartingCamera(true);
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera not accessible:', err);
      setCameraError('Không thể mở camera (vui lòng cấp quyền hoặc tải ảnh trực tiếp từ thiết bị).');
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedDataUrl(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedDataUrl(result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!capturedDataUrl) return;

    const newImage: LesionImage = {
      id: 'img-' + Date.now().toString(36),
      type: imageType,
      dataUrl: capturedDataUrl,
      label: label.trim() || (imageType === 'dermoscopy' ? 'Ảnh soi da Dermoscopy' : 'Ảnh tổn thương đại thể'),
      takenAt: new Date().toISOString(),
      magnification: magnification,
    };

    onCapture(newImage);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCapturedDataUrl(null);
    setLabel('');
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-lg">Chụp / Tải ảnh tổn thương da</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Lesion Image Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setImageType('macroscopic');
                setMagnification('Macro 1:1');
              }}
              className={`py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                imageType === 'macroscopic'
                  ? 'bg-white text-blue-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tổn thương đại thể (Macro)
            </button>
            <button
              type="button"
              onClick={() => {
                setImageType('dermoscopy');
                setMagnification('10x Polarized');
              }}
              className={`py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                imageType === 'dermoscopy'
                  ? 'bg-white text-blue-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kính soi da (Dermoscopy)
            </button>
          </div>

          {/* Viewport Area */}
          <div className="relative aspect-4/3 w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
            {capturedDataUrl ? (
              <img
                src={capturedDataUrl}
                alt="Captured lesion"
                className="w-full h-full object-contain"
              />
            ) : cameraError ? (
              <div className="text-center p-6 text-slate-300 space-y-3">
                <p className="text-sm">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  <Upload className="w-4 h-4" />
                  Tải ảnh từ thư viện thiết bị
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Circular dermoscopy reticle guide overlay if dermoscopy mode */}
                {imageType === 'dermoscopy' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 rounded-full border-2 border-blue-400/60 border-dashed animate-pulse flex items-center justify-center">
                      <div className="w-4 h-4 border-t border-l border-blue-300" />
                    </div>
                    <span className="absolute bottom-3 text-xs bg-black/60 text-blue-300 px-2 py-0.5 rounded">
                      Căn chỉnh tổn thương vào tâm kính Dermatoscope
                    </span>
                  </div>
                )}

                {/* Flip camera button for mobile phones */}
                <button
                  type="button"
                  onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                  className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition"
                  title="Đổi camera trước/sau"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Image Meta Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Độ phóng đại / Bộ lọc quang học:
              </label>
              <select
                value={magnification}
                onChange={(e) => setMagnification(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {imageType === 'dermoscopy' ? (
                  <>
                    <option value="10x Polarized">10x Phân cực (Contact Polarized)</option>
                    <option value="10x Non-polarized">10x Không phân cực (Non-polarized)</option>
                    <option value="20x High-res Polarized">20x Phóng đại cao (Polarized)</option>
                    <option value="Non-contact Polarized">Không tiếp xúc (Non-contact)</option>
                  </>
                ) : (
                  <>
                    <option value="Macro 1:1">Ảnh chụp sát 1:1 (Có thước mm)</option>
                    <option value="Toàn cảnh vị trí cơ thể">Ảnh toàn cảnh vị trí giải phẫu</option>
                    <option value="Góc nghiêng 45 độ">Góc nghiêng 45 độ (Đánh giá gồ cao)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú / Nhãn ảnh:
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={imageType === 'dermoscopy' ? 'Ví dụ: Cực trên nốt ruồi' : 'Ví dụ: Ảnh trước can thiệp'}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            Tải ảnh từ máy
          </button>

          <div className="flex items-center gap-2">
            {capturedDataUrl ? (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/70 rounded-lg transition"
                >
                  Chụp lại
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-xs transition"
                >
                  <Check className="w-4 h-4" />
                  Xác nhận lưu ảnh
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSnap}
                disabled={Boolean(cameraError) || isStartingCamera}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-xs transition disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                Chụp ảnh ngay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
