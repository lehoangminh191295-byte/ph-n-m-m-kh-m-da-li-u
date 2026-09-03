import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudUpload,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  Download,
  ExternalLink,
  Shield,
  FolderOpen,
  User as UserIcon,
  LogOut,
  Upload,
  Database,
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
  initAuth,
  auth
} from '../services/googleAuthService';
import {
  getDriveAboutInfo,
  getOrCreateFolder,
  listClinicDriveFiles,
  uploadJsonToDrive,
  uploadBinaryFileToDrive,
  downloadDriveFileContent,
  deleteDriveFile,
  DriveFileItem,
  DriveQuotaInfo,
  DEFAULT_CLINIC_FOLDER
} from '../services/googleDriveService';
import {
  getFullClinicExportData,
  restoreFullClinicData,
  logAuditEvent
} from '../services/storageService';

interface GoogleDriveViewProps {
  onDataRestored?: () => void;
}

export const GoogleDriveView: React.FC<GoogleDriveViewProps> = ({ onDataRestored }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<DriveQuotaInfo | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Destructive Confirmation States (MANDATORY per Workspace skill)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fileToRestore, setFileToRestore] = useState<DriveFileItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Custom file upload
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [isUploadingCustomFile, setIsUploadingCustomFile] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // When token is available, load Drive info and files
  useEffect(() => {
    if (accessToken) {
      loadDriveWorkspace(accessToken);
    } else {
      setQuotaInfo(null);
      setDriveFiles([]);
      setFolderId(null);
    }
  }, [accessToken]);

  const loadDriveWorkspace = async (token: string) => {
    setIsLoadingFiles(true);
    try {
      const [about, fId] = await Promise.all([
        getDriveAboutInfo(token),
        getOrCreateFolder(token),
      ]);
      setQuotaInfo(about);
      setFolderId(fId);

      const files = await listClinicDriveFiles(token, fId);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Error loading Drive workspace:', err);
      setStatusMessage({
        text: `Lỗi kết nối Google Drive: ${err.message || 'Không thể tải tệp'}`,
        type: 'error',
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        setStatusMessage({
          text: `Đăng nhập Google thành công: ${res.user.email}`,
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setStatusMessage({
        text: `Đăng nhập Google thất bại: ${err.message || 'Vui lòng cấp quyền truy cập Google Drive'}`,
        type: 'error',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setAccessToken(null);
    setQuotaInfo(null);
    setDriveFiles([]);
    setStatusMessage({
      text: 'Đã ngắt kết nối tài khoản Google Drive an toàn.',
      type: 'info',
    });
  };

  const handleBackupNow = async () => {
    if (!accessToken) {
      setStatusMessage({ text: 'Vui lòng đăng nhập Google Drive trước.', type: 'error' });
      return;
    }

    setIsBackingUp(true);
    setStatusMessage(null);
    try {
      const clinicData = getFullClinicExportData();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `Dermacare_FullBackup_${timestamp}.json`;
      const description = `Bản sao lưu tự động hệ thống Dermacare AI (${clinicData.totalPatients} bệnh nhân, ${clinicData.totalLesions} tổn thương)`;

      const currentFolderId = folderId || (await getOrCreateFolder(accessToken));
      await uploadJsonToDrive(accessToken, fileName, clinicData, currentFolderId, description);

      logAuditEvent(
        'SYSTEM_EXPORT',
        `Sao lưu toàn bộ cơ sở dữ liệu phòng khám lên Google Drive (${fileName})`,
        undefined,
        'Google Drive Cloud',
        'INFO'
      );

      setStatusMessage({
        text: `Sao lưu thành công tệp "${fileName}" lên Google Drive!`,
        type: 'success',
      });

      // Refresh list
      const files = await listClinicDriveFiles(accessToken, currentFolderId);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Backup error:', err);
      setStatusMessage({
        text: `Sao lưu thất bại: ${err.message}`,
        type: 'error',
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Perform destructive file delete with strict user confirmation
  const handleConfirmDelete = async () => {
    if (!accessToken || !fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      setStatusMessage({
        text: `Đã xóa tệp "${fileToDelete.name}" khỏi Google Drive.`,
        type: 'success',
      });
      setDriveFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setFileToDelete(null);
    } catch (err: any) {
      setStatusMessage({
        text: `Xóa tệp thất bại: ${err.message}`,
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Perform restore with strict user confirmation
  const handleConfirmRestore = async () => {
    if (!accessToken || !fileToRestore) return;
    setIsRestoring(true);
    try {
      const payload = await downloadDriveFileContent(accessToken, fileToRestore.id);
      restoreFullClinicData(payload);
      setStatusMessage({
        text: `Khôi phục thành công dữ liệu phòng khám từ bản sao lưu "${fileToRestore.name}"!`,
        type: 'success',
      });
      setFileToRestore(null);
      if (onDataRestored) {
        onDataRestored();
      }
    } catch (err: any) {
      console.error('Restore error:', err);
      setStatusMessage({
        text: `Khôi phục thất bại: ${err.message}`,
        type: 'error',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDownloadFile = async (file: DriveFileItem) => {
    if (!accessToken) return;
    try {
      const content = await downloadDriveFileContent(accessToken, file.id);
      const text = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Không thể tải tệp: ${err.message}`);
    }
  };

  const handleUploadCustomFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !selectedUploadFile) return;

    setIsUploadingCustomFile(true);
    try {
      const currentFolderId = folderId || (await getOrCreateFolder(accessToken));
      await uploadBinaryFileToDrive(accessToken, selectedUploadFile, currentFolderId);
      setStatusMessage({
        text: `Tải tệp "${selectedUploadFile.name}" lên Google Drive thành công!`,
        type: 'success',
      });
      setSelectedUploadFile(null);
      const files = await listClinicDriveFiles(accessToken, currentFolderId);
      setDriveFiles(files);
    } catch (err: any) {
      setStatusMessage({
        text: `Tải tệp thất bại: ${err.message}`,
        type: 'error',
      });
    } finally {
      setIsUploadingCustomFile(false);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '0 KB';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return bytes;
    if (num < 1024) return num + ' B';
    if (num < 1024 * 1024) return (num / 1024).toFixed(1) + ' KB';
    return (num / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatGB = (bytes?: string) => {
    if (!bytes) return '0 GB';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '0 GB';
    return (num / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl text-white p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-xs text-blue-100">
              <Cloud className="w-3.5 h-3.5" />
              <span>Google Workspace Integration • Drive API v3</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              Đồng Bộ & Lưu Trữ Đám Mây Google Drive
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
              Tự động sao lưu hồ sơ bệnh án da liễu, hình ảnh dermoscopy quang học độ phân giải cao,
              kết quả phân tích AI và lịch sử thủ thuật lên kho lưu trữ đám mây Google Drive an toàn của bạn.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {currentUser && accessToken ? (
              <button
                onClick={handleBackupNow}
                disabled={isBackingUp}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center gap-2 transition"
              >
                <CloudUpload className={`w-4 h-4 ${isBackingUp ? 'animate-bounce' : ''}`} />
                {isBackingUp ? 'Đang sao lưu...' : 'Sao lưu phòng khám ngay'}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Auth Card: When NOT Logged In */}
      {!currentUser || !accessToken ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
            <Cloud className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-800">
              Kết nối Google Drive để bắt đầu lưu trữ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Đăng nhập bằng tài khoản Google của bạn để cấp quyền lưu trữ hồ sơ bệnh nhân, ảnh dermoscopy và xuất báo cáo vào Google Drive cá nhân hoặc phòng khám.
            </p>
          </div>

          {/* Standard Sign in with Google Button (GSI Guidelines) */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-full shadow-sm text-slate-700 font-semibold text-sm transition transform active:scale-98 disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isLoggingIn ? 'Đang kết nối Google Drive...' : 'Sign in with Google'}</span>
            </button>
          </div>

          {/* Feature bullet highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto pt-6 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 mb-1">
                <Shield className="w-4 h-4 text-blue-600" />
                Bảo Mật Chuẩn Y Tế
              </span>
              <p className="text-[11px] text-slate-500">
                Toàn bộ dữ liệu nằm trong Google Drive của bác sĩ, không lưu trên máy chủ bên ngoài.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 mb-1">
                <Database className="w-4 h-4 text-emerald-600" />
                Khôi Phục Mọi Thiết Bị
              </span>
              <p className="text-[11px] text-slate-500">
                Dễ dàng chuyển đổi hoặc khôi phục hồ sơ bệnh nhân khi mở app trên máy tính hoặc tablet mới.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 mb-1">
                <HardDrive className="w-4 h-4 text-purple-600" />
                Dung Lượng Đám Mây Lớn
              </span>
              <p className="text-[11px] text-slate-500">
                Tận dụng 15 GB miễn phí (hoặc gói Google One / Google Workspace) để lưu trữ không giới hạn ảnh dermoscopy.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Connected Dashboard */
        <div className="space-y-6">
          {/* Account Profile & Storage Quota Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* User card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google Account'}
                    className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                    {currentUser.displayName ? currentUser.displayName[0] : 'G'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-sm">{currentUser.displayName || 'Bác sĩ Da liễu'}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đã kết nối"></span>
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-[180px]">{currentUser.email}</p>
                  <p className="text-[10px] text-blue-600 font-medium mt-0.5">Google Drive Đã Kết Nối</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Đăng xuất Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Folder & Sync info */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-amber-500" />
                Thư mục lưu trữ trên Drive
              </span>
              <p className="font-bold text-slate-800 text-sm truncate" title={DEFAULT_CLINIC_FOLDER}>
                {DEFAULT_CLINIC_FOLDER}
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Tự động khởi tạo
                </span>
                <span>•</span>
                <span>{driveFiles.length} tệp đã lưu</span>
              </div>
            </div>

            {/* Storage Quota */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-indigo-500" />
                  Dung lượng Google Drive
                </span>
                <span className="font-mono font-bold text-slate-700">
                  {formatGB(quotaInfo?.usage)} / {quotaInfo?.limit ? formatGB(quotaInfo.limit) : '15 GB'}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full"
                  style={{
                    width: `${
                      quotaInfo?.limit && quotaInfo?.usage
                        ? Math.min(100, Math.round((parseInt(quotaInfo.usage, 10) / parseInt(quotaInfo.limit, 10)) * 100))
                        : 15
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-400">
                Lưu trữ đám mây cho hồ sơ bệnh nhân, hình ảnh tổn thương quang học và Dermoscopy.
              </p>
            </div>
          </div>

          {/* Action Row & Custom Upload */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Thao Tác Đồng Bộ Nhanh
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tạo bản snapshot dữ liệu phòng khám hoặc tải lên hình ảnh tổn thương bên ngoài vào thư mục Drive.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => accessToken && loadDriveWorkspace(accessToken)}
                disabled={isLoadingFiles}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                Làm mới danh sách
              </button>

              <button
                onClick={handleBackupNow}
                disabled={isBackingUp}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
              >
                <CloudUpload className={`w-4 h-4 ${isBackingUp ? 'animate-bounce' : ''}`} />
                {isBackingUp ? 'Đang tải lên...' : 'Tạo bản sao lưu mới'}
              </button>
            </div>
          </div>

          {/* Custom File Upload Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Upload className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Tải tệp ảnh dermoscopy / tài liệu y khoa thủ công lên thư mục Google Drive:</span>
            </div>
            <form onSubmit={handleUploadCustomFile} className="flex items-center gap-2">
              <input
                type="file"
                id="drive-custom-file-input"
                onChange={(e) => setSelectedUploadFile(e.target.files?.[0] || null)}
                className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
              />
              <button
                type="submit"
                disabled={!selectedUploadFile || isUploadingCustomFile}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-md transition shrink-0"
              >
                {isUploadingCustomFile ? 'Đang tải...' : 'Tải lên'}
              </button>
            </form>
          </div>

          {/* Files Stored in Google Drive Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Danh Sách Tệp & Bản Sao Lưu Trong Google Drive
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {driveFiles.length} tệp
              </span>
            </div>

            {isLoadingFiles ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                <p className="text-xs">Đang đồng bộ danh sách từ Google Drive...</p>
              </div>
            ) : driveFiles.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Cloud className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-semibold text-sm text-slate-700">Chưa có tệp nào trong thư mục Dermacare AI</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Hãy nhấn nút "Tạo bản sao lưu mới" ở trên để tải bản sao lưu đầu tiên của toàn bộ hồ sơ phòng khám lên Google Drive.
                </p>
                <button
                  onClick={handleBackupNow}
                  disabled={isBackingUp}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <CloudUpload className="w-4 h-4" />
                  Sao lưu ngay bây giờ
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Tên tệp trên Google Drive</th>
                      <th className="py-3 px-3">Loại tệp</th>
                      <th className="py-3 px-3">Kích thước</th>
                      <th className="py-3 px-3">Ngày cập nhật</th>
                      <th className="py-3 px-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {driveFiles.map((file) => {
                      const isJsonBackup = file.name.endsWith('.json');
                      return (
                        <tr key={file.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 hover:text-blue-600 transition truncate max-w-xs sm:max-w-md">
                                  {file.name}
                                </p>
                                {file.description && (
                                  <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                                    {file.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                isJsonBackup
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {isJsonBackup ? 'Bản sao lưu JSON' : file.mimeType.split('/').pop() || 'Tệp'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {file.modifiedTime
                              ? new Date(file.modifiedTime).toLocaleString('vi-VN')
                              : 'Chưa rõ'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Open in Google Drive */}
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                  title="Mở trong Google Drive"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Restore Button (for JSON backups) */}
                              {isJsonBackup && (
                                <button
                                  onClick={() => setFileToRestore(file)}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-semibold text-[11px] flex items-center gap-1 transition"
                                  title="Khôi phục cơ sở dữ liệu phòng khám từ bản sao lưu này"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  Khôi phục
                                </button>
                              )}

                              {/* Download file */}
                              <button
                                onClick={() => handleDownloadFile(file)}
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                                title="Tải tệp về máy"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete file (triggers confirmation dialog) */}
                              <button
                                onClick={() => setFileToDelete(file)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                title="Xóa tệp khỏi Google Drive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANDATORY DESTRUCTIVE CONFIRMATION MODAL: DELETE FILE FROM DRIVE */}
      {fileToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-bold text-slate-900 text-base">
                Xác nhận xóa tệp khỏi Google Drive?
              </h3>
              <p className="text-xs text-slate-600">
                Bạn có chắc chắn muốn xóa vĩnh viễn tệp <strong>"{fileToDelete.name}"</strong> khỏi Google Drive của bạn không?
              </p>
              <div className="p-3 bg-rose-50 rounded-lg text-left text-xs text-rose-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  Cảnh báo hành động không thể hoàn tác
                </p>
                <p className="text-[11px] text-rose-700">
                  Tệp sẽ bị xóa hoàn toàn khỏi thư mục lưu trữ của phòng khám trên Google Drive.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa tệp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION MODAL: RESTORE CLINIC DATABASE */}
      {fileToRestore && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-bold text-slate-900 text-base">
                Khôi phục dữ liệu từ bản sao lưu Google Drive?
              </h3>
              <p className="text-xs text-slate-600">
                Bạn sắp khôi phục cơ sở dữ liệu từ tệp:
              </p>
              <p className="text-xs font-mono font-bold text-blue-700 bg-blue-50 py-1 px-2 rounded">
                {fileToRestore.name}
              </p>
              <div className="p-3 bg-amber-50 rounded-lg text-left text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Lưu ý quan trọng
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Thao tác này sẽ cập nhật lại toàn bộ danh sách bệnh nhân, hình ảnh tổn thương, lịch hẹn, thủ thuật và kho dược chất theo đúng bản sao lưu đã chọn.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFileToRestore(null)}
                disabled={isRestoring}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                {isRestoring ? 'Đang khôi phục...' : 'Xác nhận khôi phục'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
