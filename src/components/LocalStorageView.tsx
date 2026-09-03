import React, { useState, useEffect, useRef } from 'react';
import {
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  FolderOpen,
  Terminal,
  CheckCircle2,
  Copy,
  AlertCircle,
  FileCode,
  Laptop,
  Save,
  Check,
  ShieldAlert,
  Server,
  Database,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  checkLocalDiskStatus,
  saveToLocalComputerDisk,
  loadFromLocalComputerDisk,
  downloadBackupFileToComputer,
  readAndRestoreBackupFile,
  LocalDiskStatus,
  getFullClinicExportData
} from '../services/storageService';

interface LocalStorageViewProps {
  onDataReloaded: () => void;
}

export function LocalStorageView({ onDataReloaded }: LocalStorageViewProps) {
  const [diskStatus, setDiskStatus] = useState<LocalDiskStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'storage' | 'guide' | 'scripts'>('storage');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshStatus = async () => {
    setIsLoading(true);
    try {
      const status = await checkLocalDiskStatus();
      setDiskStatus(status);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const showFeedback = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };

  const handleManualSaveToDisk = async () => {
    setIsLoading(true);
    try {
      const result = await saveToLocalComputerDisk();
      if (result.success) {
        showFeedback('success', `Đã lưu thành công dữ liệu vào tệp data/clinic_database.json (${result.sizeFormatted || 'Đã ghi đĩa'})!`);
        await refreshStatus();
      } else {
        // Fallback: download directly to computer
        downloadBackupFileToComputer();
        showFeedback('info', 'Đã tải tệp sao lưu trực tiếp về máy tính do đang trong môi trường trình duyệt trực tuyến.');
      }
    } catch (err: any) {
      downloadBackupFileToComputer();
      showFeedback('info', 'Đã xuất file dự phòng về thư mục Downloads của máy tính.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLoadFromDisk = async () => {
    if (!window.confirm('Thao tác này sẽ tải lại toàn bộ dữ liệu từ tệp data/clinic_database.json trên ổ cứng máy tính và cập nhật giao diện. Bạn có muốn tiếp tục?')) {
      return;
    }
    setIsLoading(true);
    try {
      const result = await loadFromLocalComputerDisk();
      if (result.success && result.loaded) {
        showFeedback('success', result.message);
        onDataReloaded();
        await refreshStatus();
      } else {
        showFeedback('info', result.message || 'Chưa tìm thấy tệp dữ liệu trên máy tính.');
      }
    } catch (err: any) {
      showFeedback('error', 'Lỗi khi đọc từ máy chủ local: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFile = () => {
    downloadBackupFileToComputer();
    showFeedback('success', 'Đã tạo và tải tệp sao lưu JSON toàn diện về máy tính thành công!');
    refreshStatus();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`Bạn có chắc chắn muốn nhập dữ liệu từ tệp "${file.name}"? Dữ liệu hiện tại sẽ được cập nhật.`)) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsLoading(true);
    try {
      const res = await readAndRestoreBackupFile(file);
      showFeedback('success', res.message);
      onDataReloaded();
      await refreshStatus();
    } catch (err: any) {
      showFeedback('error', err.message || 'Lỗi khi đọc tệp từ máy tính.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const currentLocalCounts = getFullClinicExportData().data;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Lưu Trữ Máy Tính & Chạy Local
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Dữ liệu trên máy tính
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Hệ thống hỗ trợ tự động lưu trữ dữ liệu vào ổ cứng máy tính tại thư mục <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono text-[11px]">./data/clinic_database.json</code>, xuất nhập tệp sao lưu độc lập, và chạy ứng dụng cục bộ (Local) không phụ thuộc Internet.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadFile}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Tải tệp sao lưu (.JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Khôi phục từ tệp máy tính</span>
          </button>

          <button
            type="button"
            onClick={handleManualSaveToDisk}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Lưu ngay vào ổ đĩa</span>
          </button>
        </div>
      </div>

      {/* Notification Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-medium shadow-sm transition ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : feedbackMessage.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}
        >
          {feedbackMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {feedbackMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          {feedbackMessage.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
          <span className="flex-1">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('storage')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'storage'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Quản lý Lưu trữ Ổ cứng</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'guide'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Hướng dẫn Chạy Local (Từng bước)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scripts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'scripts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Tệp Khởi chạy Tự động (Script 1-Click)</span>
        </button>
      </div>

      {/* TAB 1: Storage Management */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          {/* Storage Health & Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Disk File Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tệp Cơ Sở Dữ Liệu</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  diskStatus?.exists ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {diskStatus?.exists ? 'Đã tồn tại trên đĩa' : 'Chưa ghi tệp đĩa'}
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {diskStatus?.dbFileName || 'clinic_database.json'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono break-all">
                  Đường dẫn: {diskStatus?.dbFilePath || './data/clinic_database.json'}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Dung lượng: <strong>{diskStatus?.sizeFormatted || 'Chưa xác định'}</strong></span>
                <span>Sao lưu .bak: <strong>{diskStatus?.hasBackup ? 'Có' : 'Chưa'}</strong></span>
              </div>
            </div>

            {/* Sync Status Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cơ Chế Lưu Trữ Kép</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Dual-Sync Active
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>Trình duyệt:</strong> LocalStorage (Hiển thị tức thì)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span><strong>Ổ cứng máy tính:</strong> Thư mục <code>./data</code></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span><strong>Sao lưu thủ công:</strong> Tệp JSON tải về máy</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                Mỗi khi thêm/sửa bệnh nhân, thủ thuật, hệ thống tự động ghi nhớ vào cả 2 tầng lưu trữ.
              </div>
            </div>

            {/* Total Data Records Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Hồ Sơ Đang Lưu</span>
                <button
                  type="button"
                  onClick={refreshStatus}
                  title="Làm mới trạng thái"
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Bệnh nhân:</span>
                  <strong className="text-base text-slate-900">{currentLocalCounts.patients.length}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Tổn thương & Ảnh:</span>
                  <strong className="text-base text-slate-900">{currentLocalCounts.lesions.length}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Thủ thuật da liễu:</span>
                  <strong className="text-base text-slate-900">{currentLocalCounts.procedures.length}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Mặt hàng kho:</span>
                  <strong className="text-base text-slate-900">{currentLocalCounts.inventory.length}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Storage Actions Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-600" />
              Thao tác với dữ liệu lưu trên máy tính
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Action 1 */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Download className="w-4 h-4 text-blue-600" />
                    Tải Tệp Sao Lưu (.JSON)
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Xuất toàn bộ dữ liệu phòng khám ra file JSON tiêu chuẩn, lưu trực tiếp vào thư mục Downloads của máy tính.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất File JSON</span>
                </button>
              </div>

              {/* Action 2 */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    Khôi Phục Từ Tệp JSON
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Chọn một tệp sao lưu JSON từ ổ đĩa máy tính để nhập lại toàn bộ bệnh án, ảnh soi da và thủ thuật.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn Tệp Từ Máy</span>
                </button>
              </div>

              {/* Action 3 */}
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Save className="w-4 h-4 text-purple-600" />
                    Lưu Ngay Vào Thư Mục data/
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Ghi đè trực tiếp trạng thái hiện tại vào tệp <code className="font-mono">./data/clinic_database.json</code> trên máy chủ local.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleManualSaveToDisk}
                  disabled={isLoading}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Ghi Vào Ổ Đĩa</span>
                </button>
              </div>

              {/* Action 4 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <RefreshCw className="w-4 h-4 text-slate-700" />
                    Đọc Lại Từ Ổ Cứng
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Tải lại dữ liệu từ tệp trên ổ đĩa máy tính vào giao diện nếu bạn vừa cập nhật file hoặc chỉnh sửa thủ công.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleManualLoadFromDisk}
                  disabled={isLoading}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tải Lại Từ Ổ Cứng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Step-by-Step Local Run Guide */}
      {activeTab === 'guide' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-blue-600" />
              Hướng Dẫn Từng Bước Chạy Ứng Dụng Trên Máy Tính Cá Nhân (Localhost)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Bạn có thể dễ dàng tải toàn bộ mã nguồn về máy tính để chạy độc lập trong phòng khám, dữ liệu lưu trữ 100% trên máy tính của bạn và có thể chia sẻ mạng LAN.
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Cài đặt môi trường Node.js (Nếu máy tính chưa có)
                  </h3>
                  <a
                    href="https://nodejs.org"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Tải Node.js chính thức <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tải và cài đặt phiên bản <strong>Node.js 18 LTS hoặc 20 LTS trở lên</strong> cho hệ điều hành của bạn (Windows / macOS). Sau khi cài, mở Terminal hoặc Command Prompt kiểm tra:
                </p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
                  <span>node -v && npm -v</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('node -v && npm -v', 'cmd-check')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'cmd-check' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Tải mã nguồn về máy tính
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Trên giao diện Google AI Studio, nhấn vào <strong>Settings (Biểu tượng Bánh răng)</strong> ở góc trên bên phải &gt; chọn <strong>Export to ZIP</strong> hoặc <strong>Export to GitHub</strong>. Giải nén vào một thư mục trên máy (ví dụ: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">D:\Dermacare-App</code>).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Cài đặt các thư viện cần thiết (`npm install`)
                </h3>
                <p className="text-xs text-slate-600">
                  Mở Terminal (hoặc PowerShell / Command Prompt trên Windows) tại thư mục vừa giải nén và chạy lệnh:
                </p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
                  <span>npm install</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('npm install', 'cmd-install')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'cmd-install' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                4
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Cấu hình khóa Gemini AI (Tùy chọn cho phân tích Soi da AI)
                </h3>
                <p className="text-xs text-slate-600">
                  Sao chép tệp <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">.env.example</code> thành <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">.env</code> và điền khóa API (nếu cần dùng tính năng AI phân tích tổn thương):
                </p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
                  <span>GEMINI_API_KEY=AIzaSyYourSecretKeyHere</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('GEMINI_API_KEY=AIzaSyYourSecretKeyHere', 'cmd-env')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'cmd-env' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                5
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Khởi chạy ứng dụng trên máy tính
                </h3>
                <p className="text-xs text-slate-600">
                  Chạy lệnh sau để khởi động máy chủ cục bộ:
                </p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
                  <span>npm run dev</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('npm run dev', 'cmd-run')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'cmd-run' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  ✨ Mở trình duyệt bất kỳ (Chrome, Edge, Firefox, Cốc Cốc) và truy cập: <strong className="font-mono text-blue-700">http://localhost:3000</strong>
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                6
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Truy cập từ iPad / Điện thoại / Máy tính khác trong phòng khám (Mạng LAN)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vì máy chủ lắng nghe tại <code className="font-mono">0.0.0.0:3000</code>, bất kỳ thiết bị nào cùng kết nối vào mạng WiFi phòng khám đều có thể truy cập bằng địa chỉ IP của máy tính chủ:
                </p>
                <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono text-slate-800">
                  http://192.168.1.xxx:3000
                </div>
                <p className="text-[11px] text-slate-500">
                  (Xem địa chỉ IP máy tính bằng lệnh <code>ipconfig</code> trên Windows hoặc <code>ifconfig</code> trên macOS).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Auto Start Scripts */}
      {activeTab === 'scripts' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-emerald-600" />
              Tệp Script Khởi Chạy 1-Click (Không cần gõ lệnh)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Dự án đã có sẵn 2 tệp script khởi chạy tự động được tích hợp sẵn trong thư mục gốc. Bạn chỉ cần nhấp đúp là ứng dụng tự mở!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Windows Script */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  🪟 Dành Cho Windows
                </span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  start_local.bat
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Chỉ cần nhấp đúp chuột vào tệp <code className="bg-white px-1 py-0.5 rounded text-blue-700 font-mono font-bold">start_local.bat</code> trong thư mục dự án. Tệp sẽ:
              </p>
              <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                <li>Kiểm tra Node.js</li>
                <li>Tự động chạy <code className="font-mono">npm install</code> nếu chưa cài</li>
                <li>Khởi động máy chủ Node.js & Vite</li>
                <li>Tự động mở trình duyệt tại <code className="font-mono">http://localhost:3000</code></li>
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const batContent = `@echo off
echo ========================================================
echo   KHOI DONG PHONG KHAM DA LIEU DERMACARE AI (LOCAL)
echo ========================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Khong tim thay Node.js tren may tinh!
    echo Vui long cai dat Node.js tai https://nodejs.org
    pause
    exit /b
)

if not exist node_modules (
    echo [INFO] Dang cai dat thu vien phu thuoc (npm install)...
    call npm install
)

if not exist .env (
    if exist .env.example (
        copy .env.example .env
        echo [INFO] Da khoi tao tep .env tu .env.example
    )
)

echo [INFO] Dang khoi chay may chu Dermacare AI tren cong 3000...
start http://localhost:3000
npm run dev
pause
`;
                    const blob = new Blob([batContent], { type: 'application/bat' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'start_local.bat';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showFeedback('success', 'Đã tải tệp start_local.bat về máy tính!');
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải tệp start_local.bat</span>
                </button>
              </div>
            </div>

            {/* macOS / Linux Script */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  🍎 Dành Cho macOS / Linux
                </span>
                <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                  start_local.sh
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Chạy tệp script <code className="bg-white px-1 py-0.5 rounded text-purple-700 font-mono font-bold">./start_local.sh</code> trong Terminal để tự động khởi động:
              </p>
              <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-xs flex items-center justify-between">
                <span>chmod +x start_local.sh && ./start_local.sh</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('chmod +x start_local.sh && ./start_local.sh', 'cmd-mac-sh')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'cmd-mac-sh' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const shContent = `#!/bin/bash
echo "========================================================"
echo "  KHOI DONG PHONG KHAM DA LIEU DERMACARE AI (LOCAL)"
echo "========================================================"

if ! command -v node &> /dev/null; then
    echo "[LOI] Khong tim thay Node.js tren may tinh!"
    echo "Vui long cai dat Node.js tai https://nodejs.org"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] Dang cai dat thu vien phu thuoc (npm install)..."
    npm install
fi

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    echo "[INFO] Da khoi tao tep .env tu .env.example"
fi

echo "[INFO] Dang khoi chay may chu Dermacare AI tren cong 3000..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000 &
else
    xdg-open http://localhost:3000 2>/dev/null || sensible-browser http://localhost:3000 &
fi

npm run dev
`;
                    const blob = new Blob([shContent], { type: 'application/x-sh' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'start_local.sh';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showFeedback('success', 'Đã tải tệp start_local.sh về máy tính!');
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải tệp start_local.sh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
