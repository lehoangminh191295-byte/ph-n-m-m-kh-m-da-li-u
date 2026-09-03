import React, { useState } from 'react';
import { 
  Zap, 
  Syringe, 
  Droplets, 
  Sparkles, 
  Layers, 
  Scissors, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Clock, 
  Filter, 
  FileText, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Package
} from 'lucide-react';
import { ClinicalProcedure, ProcedureType, Patient } from '../types';
import { RecordProcedureModal } from './RecordProcedureModal';

interface ProceduresViewProps {
  procedures: ClinicalProcedure[];
  patients: Patient[];
  onAddProcedure: (procedure: ClinicalProcedure, deductStock: boolean) => void;
  onDeleteProcedure: (procedureId: string) => void;
  onSelectPatient?: (patientId: string) => void;
}

const TYPE_FILTERS: { key: string; label: string; icon: string; countKey?: ProcedureType }[] = [
  { key: 'ALL', label: 'Tất cả thủ thuật', icon: '📋' },
  { key: 'LASER', label: 'Laser Da Liễu', icon: '⚡', countKey: 'LASER' },
  { key: 'BOTOX', label: 'Tiêm Botox (Toxin)', icon: '💉', countKey: 'BOTOX' },
  { key: 'FILLER', label: 'Tiêm Filler (HA)', icon: '✨', countKey: 'FILLER' },
  { key: 'MESOTHERAPY', label: 'Mesotherapy & BAP', icon: '💧', countKey: 'MESOTHERAPY' },
  { key: 'MICRONEEDLING', label: 'Lăn kim / Phi kim', icon: '🎯', countKey: 'MICRONEEDLING' },
  { key: 'CHEMICAL_PEEL', label: 'Peel da hóa học', icon: '🧪', countKey: 'CHEMICAL_PEEL' },
  { key: 'MINOR_SURGERY', label: 'Tiểu phẫu da', icon: '✂️', countKey: 'MINOR_SURGERY' },
];

const TYPE_BADGE_STYLE: Record<ProcedureType, { bg: string; text: string; border: string }> = {
  LASER: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  BOTOX: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  FILLER: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  MESOTHERAPY: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  MICRONEEDLING: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  CHEMICAL_PEEL: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  MINOR_SURGERY: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' }
};

export const ProceduresView: React.FC<ProceduresViewProps> = ({
  procedures,
  patients,
  onAddProcedure,
  onDeleteProcedure,
  onSelectPatient
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProcedureForDetail, setSelectedProcedureForDetail] = useState<ClinicalProcedure | null>(null);

  // Filter procedures
  const filteredProcedures = procedures.filter((proc) => {
    const matchesType = selectedType === 'ALL' || proc.procedureType === selectedType;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      proc.procedureName.toLowerCase().includes(term) ||
      proc.patientName.toLowerCase().includes(term) ||
      proc.patientCode.toLowerCase().includes(term) ||
      proc.targetArea.toLowerCase().includes(term) ||
      (proc.productUsed && proc.productUsed.toLowerCase().includes(term)) ||
      proc.doctorName.toLowerCase().includes(term);

    return matchesType && matchesSearch;
  });

  // Calculate stats
  const laserCount = procedures.filter(p => p.procedureType === 'LASER').length;
  const botoxCount = procedures.filter(p => p.procedureType === 'BOTOX').length;
  const fillerCount = procedures.filter(p => p.procedureType === 'FILLER').length;
  const mesoCount = procedures.filter(p => p.procedureType === 'MESOTHERAPY' || p.procedureType === 'MICRONEEDLING').length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <span>💉</span> Quản Lý Thủ Thuật & Can Thiệp Da Liễu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ghi nhận thông số kỹ thuật Laser, Botox, Filler HA, Mesotherapy, Lăn kim và kiểm soát an toàn y khoa
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Ghi Nhận Thủ Thuật Mới
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-semibold block">Tổng Thủ Thuật</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">{procedures.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
            📋
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-semibold block">Laser Da Liễu</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5 block">{laserCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
            ⚡
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-semibold block">Tiêm Botox & Toxin</span>
            <span className="text-xl sm:text-2xl font-black text-purple-600 mt-0.5 block">{botoxCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
            💉
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-semibold block">Filler & Meso & Kim</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 block">{fillerCount + mesoCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            ✨
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo thủ thuật, tên BN, mã BN, thuốc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium self-end sm:self-center">
            Hiển thị <strong>{filteredProcedures.length}</strong> / {procedures.length} thủ thuật
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setSelectedType(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedType === f.key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              {f.countKey && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  selectedType === f.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {procedures.filter(p => p.procedureType === f.countKey).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Procedures List */}
      {filteredProcedures.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto text-xl">
            💉
          </div>
          <p className="text-sm font-semibold text-slate-700">Chưa có thủ thuật nào phù hợp với bộ lọc</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Bác sĩ có thể bấm nút "Ghi Nhận Thủ Thuật Mới" để thêm hồ sơ điều trị Laser, Botox, Filler, Meso hoặc Lăn kim.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Ghi nhận thủ thuật ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProcedures.map((proc) => {
            const badgeStyle = TYPE_BADGE_STYLE[proc.procedureType] || { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200' };

            return (
              <div
                key={proc.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition space-y-3.5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Type Badge & Date */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} flex items-center gap-1.5`}>
                      <span>{proc.procedureType === 'LASER' ? '⚡' : proc.procedureType === 'BOTOX' ? '💉' : proc.procedureType === 'FILLER' ? '✨' : proc.procedureType === 'MESOTHERAPY' ? '💧' : '🎯'}</span>
                      <span>{proc.procedureType}</span>
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{proc.treatmentDate}</span>
                    </div>
                  </div>

                  {/* Title & Patient */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {proc.procedureName}
                  </h3>

                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bệnh nhân: </span>
                    <button
                      onClick={() => onSelectPatient?.(proc.patientId)}
                      className="font-bold text-blue-700 hover:underline"
                    >
                      {proc.patientName} ({proc.patientCode})
                    </button>
                    {proc.sessionNumber && (
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                        Buổi {proc.sessionNumber}/{proc.totalSessions || 1}
                      </span>
                    )}
                  </div>

                  {/* Product & Dosage */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Vùng thực hiện:</span>
                      <strong className="text-slate-800">{proc.targetArea}</strong>
                    </div>
                    {proc.productUsed && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Sản phẩm / Dược chất:</span>
                        <strong className="text-blue-900">{proc.productUsed}</strong>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Liều / Thể tích / Shots:</span>
                      <strong className="text-emerald-700 font-mono">{proc.dosageOrVolume}</strong>
                    </div>

                    {/* Specific Params summary */}
                    {proc.technicalParams && (
                      <div className="pt-1.5 mt-1 border-t border-slate-200/60 grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                        {proc.technicalParams.wavelength && (
                          <div>Bước sóng: <strong>{proc.technicalParams.wavelength}</strong></div>
                        )}
                        {proc.technicalParams.energy && (
                          <div>Năng lượng: <strong>{proc.technicalParams.energy}</strong></div>
                        )}
                        {proc.technicalParams.botoxUnits && (
                          <div>Liều Botox: <strong>{proc.technicalParams.botoxUnits} Units</strong></div>
                        )}
                        {proc.technicalParams.fillerVolumeMl && (
                          <div>Thể tích Filler: <strong>{proc.technicalParams.fillerVolumeMl} ml</strong></div>
                        )}
                        {proc.technicalParams.needleDepthMm && (
                          <div>Độ sâu kim: <strong>{proc.technicalParams.needleDepthMm}</strong></div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Immediate Response & Safety */}
                  <div className="mt-2.5 text-xs text-slate-700 space-y-1">
                    <p className="line-clamp-2">
                      <span className="font-semibold text-slate-600">Phản ứng sau thủ thuật: </span>
                      {proc.immediateResponse}
                    </p>
                    <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{proc.complications || 'Không có biến chứng ghi nhận'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500">
                    Bác sĩ: <strong className="text-slate-800">{proc.doctorName}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedProcedureForDetail(proc)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Xác nhận xóa hồ sơ thủ thuật "${proc.procedureName}" của bệnh nhân ${proc.patientName}?`)) {
                          onDeleteProcedure(proc.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Xóa thủ thuật"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Procedure Modal */}
      <RecordProcedureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        allPatients={patients}
        onSaveProcedure={onAddProcedure}
      />

      {/* Procedure Detail Viewer Modal */}
      {selectedProcedureForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] uppercase font-bold text-blue-600 tracking-wider">
                  Phiếu ghi nhận thủ thuật lâm sàng
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedProcedureForDetail.procedureName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProcedureForDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl">
              <div>
                <span className="text-slate-500 block">Bệnh nhân:</span>
                <strong className="text-slate-900 text-sm">{selectedProcedureForDetail.patientName}</strong> ({selectedProcedureForDetail.patientCode})
              </div>
              <div>
                <span className="text-slate-500 block">Ngày can thiệp:</span>
                <strong className="text-slate-900">{selectedProcedureForDetail.treatmentDate}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Bác sĩ thực hiện:</span>
                <strong className="text-slate-900">{selectedProcedureForDetail.doctorName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Kỹ thuật viên phụ tá:</span>
                <strong className="text-slate-900">{selectedProcedureForDetail.technicianName || 'Không có'}</strong>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-900 block mb-1">Dược chất & Thiết bị sử dụng:</span>
                <p className="text-slate-800">{selectedProcedureForDetail.productUsed} — Liều/Lượng: <strong>{selectedProcedureForDetail.dosageOrVolume}</strong></p>
                <p className="text-slate-600 mt-1">Vùng điều trị: <strong>{selectedProcedureForDetail.targetArea}</strong></p>
              </div>

              {selectedProcedureForDetail.technicalParams && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block mb-1">Thông số kỹ thuật can thiệp:</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    {Object.entries(selectedProcedureForDetail.technicalParams).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}: </span>
                        <strong>{String(v)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Phản ứng tức thì & An toàn:</span>
                <p className="text-slate-700">{selectedProcedureForDetail.immediateResponse}</p>
                <p className="text-emerald-700 font-semibold mt-1">✓ {selectedProcedureForDetail.complications}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Hướng dẫn chăm sóc sau thủ thuật:</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedProcedureForDetail.postCareInstructions}
                </p>
              </div>

              {selectedProcedureForDetail.notes && (
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-1">Ghi chú lâm sàng:</span>
                  <p className="text-slate-700">{selectedProcedureForDetail.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedProcedureForDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
