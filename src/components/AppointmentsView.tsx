import React, { useState } from 'react';
import { Calendar, Clock, MessageSquare, Send, CheckCircle, AlertCircle, Plus, Phone, Search, Filter, ShieldCheck, UserCheck, Smartphone } from 'lucide-react';
import { Appointment, Patient, ReminderChannel, AppointmentStatus } from '../types';
import { sendAppointmentReminder } from '../services/apiService';
import { logAuditEvent } from '../services/storageService';

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  onUpdateAppointments: (appointments: Appointment[]) => void;
  onSelectPatient: (patientId: string) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  patients,
  onUpdateAppointments,
  onSelectPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // New appointment form state
  const [newPatientId, setNewPatientId] = useState(patients[0]?.id || '');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('09:00');
  const [newPurpose, setNewPurpose] = useState<Appointment['purpose']>('Tái khám Dermoscopy');
  const [newDoctor, setNewDoctor] = useState('BS. CKII Lê Hoàng Minh');
  const [newChannel, setNewChannel] = useState<ReminderChannel>('SMS');
  const [newNotes, setNewNotes] = useState('');

  // Default automated reminder message template
  const [reminderTemplate, setReminderTemplate] = useState(
    '[Phòng khám Da liễu Dermacare] Xin chào {patientName}, bạn có lịch hẹn {purpose} vào lúc {time} ngày {date} cùng {doctor}. Vui lòng đến đúng giờ. Hotline hỗ trợ: (028) 3822 9999.'
  );

  const filteredAppointments = appointments.filter((apt) => {
    const matchSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientPhone.includes(searchTerm) ||
      apt.patientCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const generateReminderText = (apt: Appointment) => {
    return reminderTemplate
      .replace('{patientName}', apt.patientName)
      .replace('{purpose}', apt.purpose)
      .replace('{time}', apt.appointmentTime)
      .replace('{date}', apt.appointmentDate)
      .replace('{doctor}', apt.doctorName);
  };

  const handleSendReminder = async (apt: Appointment) => {
    setIsSendingReminder(apt.id);
    setFeedbackMessage(null);

    try {
      const response = await sendAppointmentReminder({
        appointmentId: apt.id,
        patientName: apt.patientName,
        patientPhone: apt.patientPhone,
        appointmentDate: apt.appointmentDate,
        appointmentTime: apt.appointmentTime,
        doctorName: apt.doctorName,
        messageChannel: apt.reminderChannel,
      });

      const messageContent = generateReminderText(apt);

      const updated = appointments.map((a) => {
        if (a.id === apt.id) {
          return {
            ...a,
            reminderSent: true,
            lastReminderAt: new Date().toISOString(),
            reminderContent: messageContent,
          };
        }
        return a;
      });

      onUpdateAppointments(updated);
      setFeedbackMessage(response.message || `Đã gửi tin nhắn tự động qua ${apt.reminderChannel} tới ${apt.patientPhone}.`);

      logAuditEvent(
        'SEND_REMINDER',
        `Gửi tin nhắn tự động nhắc lịch khám (${apt.reminderChannel}) cho ${apt.patientName} (${apt.patientPhone})`,
        apt.id,
        apt.patientName
      );
    } catch (err: any) {
      console.error('Error sending reminder:', err);
      setFeedbackMessage('Lỗi gửi tin nhắn: ' + (err.message || 'Không thể kết nối dịch vụ viễn thông'));
    } finally {
      setIsSendingReminder(null);
    }
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPatient = patients.find((p) => p.id === newPatientId);
    if (!targetPatient) return;

    const newApt: Appointment = {
      id: 'apt-' + Date.now().toString(36),
      patientId: targetPatient.id,
      patientName: targetPatient.fullName,
      patientCode: targetPatient.code,
      patientPhone: targetPatient.phone,
      doctorName: newDoctor,
      appointmentDate: newDate,
      appointmentTime: newTime,
      purpose: newPurpose,
      status: 'SCHEDULED',
      reminderSent: false,
      reminderChannel: newChannel,
      notes: newNotes.trim(),
    };

    onUpdateAppointments([newApt, ...appointments]);
    setIsNewModalOpen(false);
    setNewNotes('');

    logAuditEvent(
      'SEND_REMINDER',
      `Tạo lịch hẹn khám mới ngày ${newApt.appointmentDate} cho bệnh nhân ${newApt.patientName}`,
      newApt.id,
      newApt.patientName
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Auto-reminder Config Header - Geometric Balance Style */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30">
              <MessageSquare className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold">Hệ Thống Lịch Hẹn & Tự Động Nhắc SMS</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Hệ thống tự động gửi tin nhắn nhắc lịch (SMS / Zalo) trước 24h - 48h, giúp giảm tỷ lệ bỏ hẹn và theo dõi sát sao tiến triển điều trị.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Đặt Lịch Khám Mới
        </button>
      </div>

      {feedbackMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-blue-700 hover:text-blue-900">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, SĐT hoặc mã BN..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Lọc trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SCHEDULED">Đã lên lịch (Chờ khám)</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="COMPLETED">Đã hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Appointments Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3 font-semibold">Bệnh nhân</th>
                <th className="px-5 py-3 font-semibold">Ngày & Giờ hẹn</th>
                <th className="px-5 py-3 font-semibold">Mục đích khám</th>
                <th className="px-5 py-3 font-semibold">Bác sĩ phụ trách</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold">Nhắc lịch (SMS/Zalo)</th>
                <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => {
                  const smsUri = `sms:${apt.patientPhone}?body=${encodeURIComponent(generateReminderText(apt))}`;
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => onSelectPatient(apt.patientId)}
                          className="text-left group"
                        >
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 group-hover:underline block">
                            {apt.patientName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {apt.patientCode} • {apt.patientPhone}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>{apt.appointmentDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{apt.appointmentTime}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {apt.purpose}
                        {apt.notes && (
                          <span className="block text-[10px] text-slate-400 truncate max-w-xs">{apt.notes}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">{apt.doctorName}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            apt.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : apt.status === 'COMPLETED'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {apt.status === 'CONFIRMED'
                            ? 'Đã xác nhận'
                            : apt.status === 'SCHEDULED'
                            ? 'Sắp tới'
                            : apt.status === 'COMPLETED'
                            ? 'Hoàn thành'
                            : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {apt.reminderSent ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle className="w-3 h-3" />
                              Đã gửi qua {apt.reminderChannel}
                            </span>
                            {apt.lastReminderAt && (
                              <span className="block text-[9px] text-slate-400">
                                {new Date(apt.lastReminderAt).toLocaleString('vi-VN')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Chờ kích hoạt
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Native SMS quick button for mobile phone */}
                          <a
                            href={smsUri}
                            title="Mở SMS trên điện thoại"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </a>

                          {/* Automated System Trigger */}
                          <button
                            onClick={() => handleSendReminder(apt)}
                            disabled={isSendingReminder === apt.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            {isSendingReminder === apt.id ? 'Đang gửi...' : 'Gửi tự động'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                    Không tìm thấy lịch hẹn nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Appointment Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Đặt Lịch Khám Da Liễu Mới
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn bệnh nhân:
                </label>
                <select
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.code}) - SĐT: {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày hẹn:</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giờ khám:</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mục đích khám:</label>
                  <select
                    value={newPurpose}
                    onChange={(e) => setNewPurpose(e.target.value as any)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Khám mới">Khám mới</option>
                    <option value="Tái khám Dermoscopy">Tái khám Dermoscopy</option>
                    <option value="Theo dõi tiến triển điều trị">Theo dõi tiến triển điều trị</option>
                    <option value="Sinh thiết / Tiểu phẫu">Sinh thiết / Tiểu phẫu</option>
                    <option value="Cắt chỉ">Cắt chỉ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kênh gửi tin nhắn:</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="SMS">Tin nhắn SMS truyền thống</option>
                    <option value="Zalo">Zalo ZNS Official Account</option>
                    <option value="WhatsApp">WhatsApp Business</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bác sĩ phụ trách:</label>
                <input
                  type="text"
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú bổ sung:</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ví dụ: Mang theo kết quả giải phẫu bệnh cũ..."
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  Tạo lịch hẹn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
