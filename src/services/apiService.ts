import { Patient, AIAnalysisResult, ProgressComparisonResult, LesionImage } from '../types';

export interface AnalyzeLesionPayload {
  patient: {
    code: string;
    age: number;
    gender: string;
    fitzpatrick: string;
    history: string;
  };
  lesionInfo: {
    type?: string;
    location: string;
    duration: string;
    size: string;
    symptoms: string[];
    morphology?: string;
  };
  images: {
    type: 'macroscopic' | 'dermoscopy';
    dataUrl: string;
    label?: string;
  }[];
  clinicalNotes?: string;
}

export async function analyzeLesionWithAI(payload: AnalyzeLesionPayload): Promise<AIAnalysisResult> {
  const res = await fetch('/api/ai/analyze-lesion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Lỗi máy chủ (${res.status}) khi phân tích AI`);
  }

  const json = await res.json();
  return json.data;
}

export interface CompareProgressPayload {
  patient: {
    name: string;
    code: string;
  };
  previousVisit: {
    date: string;
    diagnosis?: string;
    size?: string;
    image?: LesionImage;
  };
  currentVisit: {
    date: string;
    treatmentApplied?: string;
    image?: LesionImage;
  };
}

export async function compareProgressWithAI(payload: CompareProgressPayload): Promise<ProgressComparisonResult> {
  const res = await fetch('/api/ai/compare-progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Lỗi máy chủ (${res.status}) khi so sánh tiến triển ca bệnh`);
  }

  const json = await res.json();
  return json.data;
}

export interface SendReminderPayload {
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorName: string;
  messageChannel: 'SMS' | 'Zalo' | 'WhatsApp';
}

export async function sendAppointmentReminder(payload: SendReminderPayload) {
  const res = await fetch('/api/notifications/send-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Lỗi gửi tin nhắn nhắc hẹn');
  }

  return await res.json();
}
