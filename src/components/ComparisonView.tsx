import React, { useState } from 'react';
import { Sparkles, ArrowRight, TrendingDown, TrendingUp, CheckCircle, AlertTriangle, RefreshCw, Layers, Calendar } from 'lucide-react';
import { Patient, Lesion, LesionVisit, ProgressComparisonResult } from '../types';
import { compareProgressWithAI } from '../services/apiService';
import { logAuditEvent, saveLesions } from '../services/storageService';

interface ComparisonViewProps {
  patient: Patient;
  lesion: Lesion;
  allLesions: Lesion[];
  onUpdateLesion: (updated: Lesion) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  patient,
  lesion,
  onUpdateLesion,
}) => {
  const visits = lesion.visits || [];

  const [visitAId, setVisitAId] = useState<string>(visits[0]?.id || '');
  const [visitBId, setVisitBId] = useState<string>(visits[visits.length - 1]?.id || '');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider'>('side-by-side');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const visitA = visits.find((v) => v.id === visitAId) || visits[0];
  const visitB = visits.find((v) => v.id === visitBId) || visits[visits.length - 1];

  // Prefer dermoscopy image if available, else macroscopic
  const imageA = visitA?.images.find((i) => i.type === 'dermoscopy') || visitA?.images[0];
  const imageB = visitB?.images.find((i) => i.type === 'dermoscopy') || visitB?.images[0];

  const handleRunComparisonAI = async () => {
    if (!visitA || !visitB || visitA.id === visitB.id) {
      setAnalysisError('Vui lòng chọn 2 lần khám khác nhau để so sánh đối chiếu.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result: ProgressComparisonResult = await compareProgressWithAI({
        patient: {
          name: patient.fullName,
          code: patient.code,
        },
        previousVisit: {
          date: visitA.visitDate,
          diagnosis: visitA.diagnosis,
          size: visitA.lesionSize,
          image: imageA,
        },
        currentVisit: {
          date: visitB.visitDate,
          treatmentApplied: visitB.treatmentApplied,
          image: imageB,
        },
      });

      // Update visit B with this comparison
      const updatedVisits = lesion.visits.map((v) => {
        if (v.id === visitB.id) {
          return { ...v, comparisonWithPrevious: result };
        }
        return v;
      });

      const updatedLesion = { ...lesion, visits: updatedVisits };
      onUpdateLesion(updatedLesion);

      logAuditEvent(
        'COMPARE_PROGRESS',
        `Chạy AI so sánh tiến triển tổn thương ${lesion.code} giữa lần khám ${visitA.visitDate} và ${visitB.visitDate}`,
        lesion.id,
        lesion.code
      );
    } catch (err: any) {
      console.error('Comparison error:', err);
      setAnalysisError(err.message || 'Lỗi khi kết nối hệ thống phân tích AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (visits.length < 2) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs max-w-xl mx-auto my-6">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-500">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">Cần ít nhất 2 lần khám để đối chiếu tiến triển</h3>
        <p className="text-sm text-slate-500 mb-4">
          Tổn thương này hiện mới chỉ có 1 lần khám ({visits[0]?.visitDate}). Hãy thêm lần tái khám mới kèm hình ảnh dermoscopy để mở khóa tính năng theo dõi tiến triển và so sánh AI.
        </p>
      </div>
    );
  }

  const comparisonData = visitB?.comparisonWithPrevious;

  return (
    <div className="space-y-6">
      {/* Top Visit Selectors & Controls */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Lần khám mốc (Trước):
            </label>
            <select
              value={visitAId}
              onChange={(e) => setVisitAId(e.target.value)}
              className="text-sm font-medium border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {visits.map((v) => (
                <option key={v.id} value={v.id} disabled={v.id === visitBId}>
                  {v.visitDate} - {v.visitType} ({v.lesionSize})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center text-slate-400 mt-5">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Lần khám đối chiếu (Sau):
            </label>
            <select
              value={visitBId}
              onChange={(e) => setVisitBId(e.target.value)}
              className="text-sm font-medium border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {visits.map((v) => (
                <option key={v.id} value={v.id} disabled={v.id === visitAId}>
                  {v.visitDate} - {v.visitType} ({v.lesionSize})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle & AI Trigger */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                viewMode === 'side-by-side' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Song song (Side-by-side)
            </button>
            <button
              onClick={() => setViewMode('slider')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                viewMode === 'slider' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thanh trượt (Slider)
            </button>
          </div>

          <button
            onClick={handleRunComparisonAI}
            disabled={isAnalyzing || !imageA || !imageB}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-xs disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Đang đối chiếu AI...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                AI Đánh giá tiến triển
              </>
            )}
          </button>
        </div>
      </div>

      {analysisError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* Visual Image Comparison Container */}
      <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-800 shadow-xl overflow-hidden">
        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visit A View */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-2 text-slate-300">
                <span className="font-semibold text-blue-400">TRƯỚC: {visitA?.visitDate} ({visitA?.visitType})</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">{visitA?.lesionSize}</span>
              </div>
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                {imageA ? (
                  <img src={imageA.dataUrl} alt="Previous visit" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-slate-500 text-xs">Không có hình ảnh</span>
                )}
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 text-slate-300 px-2 py-0.5 rounded">
                  {imageA?.type === 'dermoscopy' ? 'Dermoscopy' : 'Đại thể'}
                </span>
              </div>
              <div className="text-xs text-slate-400 px-2">
                <strong className="text-slate-300">Chẩn đoán lúc đó:</strong> {visitA?.diagnosis}
              </div>
            </div>

            {/* Visit B View */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-2 text-slate-300">
                <span className="font-semibold text-sky-400">HIỆN TẠI: {visitB?.visitDate} ({visitB?.visitType})</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">{visitB?.lesionSize}</span>
              </div>
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                {imageB ? (
                  <img src={imageB.dataUrl} alt="Current visit" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-slate-500 text-xs">Không có hình ảnh</span>
                )}
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 text-slate-300 px-2 py-0.5 rounded">
                  {imageB?.type === 'dermoscopy' ? 'Dermoscopy' : 'Đại thể'}
                </span>
              </div>
              <div className="text-xs text-slate-400 px-2">
                <strong className="text-slate-300">Điều trị đã áp dụng:</strong> {visitB?.treatmentApplied || 'Chưa ghi nhận'}
              </div>
            </div>
          </div>
        ) : (
          /* Interactive Before / After Slider */
          <div className="space-y-3">
            <div className="relative aspect-16/10 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 select-none">
              {/* After image (base) */}
              {imageB && (
                <img
                  src={imageB.dataUrl}
                  alt="Visit B"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}

              {/* Before image (clipped) */}
              {imageA && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={imageA.dataUrl}
                    alt="Visit A"
                    className="absolute inset-0 w-full h-full object-contain max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              )}

              {/* Slider Divider Bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-[10px] font-bold text-slate-800">
                  ↔
                </div>
              </div>

              {/* Badges */}
              <span className="absolute top-3 left-3 bg-black/70 text-blue-300 text-xs px-2 py-1 rounded font-medium">
                TRƯỚC: {visitA?.visitDate}
              </span>
              <span className="absolute top-3 right-3 bg-black/70 text-sky-300 text-xs px-2 py-1 rounded font-medium">
                SAU: {visitB?.visitDate}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        )}
      </div>

      {/* AI Comparison & Clinical Progress Evaluation Panel */}
      {comparisonData ? (
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${
                comparisonData.progressStatus === 'IMPROVED' ? 'bg-emerald-50 text-emerald-600' :
                comparisonData.progressStatus === 'STABLE' ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {comparisonData.progressStatus === 'IMPROVED' ? (
                  <TrendingDown className="w-5 h-5" />
                ) : (
                  <TrendingUp className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-base">Đánh giá tiến triển điều trị (Gemini AI)</h4>
                <p className="text-xs text-slate-500">
                  Đối chiếu giữa {visitA?.visitDate} và {visitB?.visitDate} • Phân tích lúc {new Date(comparisonData.evaluatedAt).toLocaleTimeString('vi-VN')}
                </p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              comparisonData.progressStatus === 'IMPROVED'
                ? 'bg-emerald-100 text-emerald-800'
                : comparisonData.progressStatus === 'STABLE'
                ? 'bg-sky-100 text-sky-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {comparisonData.statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase">Thay đổi kích thước:</div>
              <p className="text-slate-800">{comparisonData.sizeChangeDescription}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase">Sắc tố & Hiện tượng viêm:</div>
              <p className="text-slate-800">{comparisonData.pigmentationChangeDescription}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase">Tiến triển cấu trúc Dermoscopy:</div>
              <p className="text-slate-800">{comparisonData.dermoscopyEvolution}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase">Hiệu quả phác đồ điều trị:</div>
              <p className="text-slate-800">{comparisonData.treatmentEfficacyEvaluation}</p>
            </div>
          </div>

          {comparisonData.nextStepRecommendations?.length > 0 && (
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4">
              <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                Khuyến nghị cho bác sĩ trong lần tái khám kế tiếp:
              </h5>
              <ul className="space-y-1 text-sm text-blue-950">
                {comparisonData.nextStepRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center text-slate-500 text-sm">
          Nhấn nút <strong className="text-blue-700">"AI Đánh giá tiến triển"</strong> ở trên để đối chiếu chi tiết sự thay đổi về kích thước, sắc tố và cấu trúc dermoscopy giữa 2 lần khám.
        </div>
      )}
    </div>
  );
};
