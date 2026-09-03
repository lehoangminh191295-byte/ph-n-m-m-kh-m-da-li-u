import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local disk data directory and database files
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "clinic_database.json");
const DB_BACKUP_FILE = path.join(DATA_DIR, "clinic_database.bak.json");

// Ensure data folder exists on the computer disk
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Could not create local data directory:", err);
  }
}

const app = express();
const PORT = 3000;

// Support large payload for high-resolution dermoscopy and macroscopic images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy get Google GenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// --- Local Computer File Storage Endpoints ---

// 1. Get status of database on local computer hard drive
app.get("/api/storage/status", (_req, res) => {
  try {
    const exists = fs.existsSync(DB_FILE);
    let sizeBytes = 0;
    let updatedAt: string | null = null;
    let counts = {
      patients: 0,
      lesions: 0,
      appointments: 0,
      procedures: 0,
      inventory: 0,
      auditLogs: 0,
    };

    if (exists) {
      const stats = fs.statSync(DB_FILE);
      sizeBytes = stats.size;
      updatedAt = stats.mtime.toISOString();
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        const d = parsed.data || parsed;
        counts = {
          patients: Array.isArray(d.patients) ? d.patients.length : 0,
          lesions: Array.isArray(d.lesions) ? d.lesions.length : 0,
          appointments: Array.isArray(d.appointments) ? d.appointments.length : 0,
          procedures: Array.isArray(d.procedures) ? d.procedures.length : 0,
          inventory: Array.isArray(d.inventory) ? d.inventory.length : 0,
          auditLogs: Array.isArray(d.auditLogs) ? d.auditLogs.length : 0,
        };
        if (parsed.updatedAt) {
          updatedAt = parsed.updatedAt;
        }
      } catch (parseErr) {
        console.warn("Notice: could not parse existing database JSON for counts:", parseErr);
      }
    }

    res.json({
      success: true,
      isLocal: true,
      dataDir: "data",
      dbFileName: "clinic_database.json",
      dbFilePath: DB_FILE,
      exists,
      sizeBytes,
      sizeFormatted: sizeBytes > 0 ? (sizeBytes / 1024).toFixed(1) + " KB" : "0 KB",
      updatedAt,
      counts,
      hasBackup: fs.existsSync(DB_BACKUP_FILE),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Load database from local computer hard drive
app.get("/api/storage/load", (_req, res) => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return res.json({ exists: false, data: null });
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    res.json({
      exists: true,
      data: parsed.data || parsed,
      updatedAt: parsed.updatedAt || null,
      appVersion: parsed.appVersion || "1.2.0",
      clinicName: parsed.clinicName || "Phòng Khám Da Liễu Dermacare AI",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Save database to local computer hard drive (data/clinic_database.json)
app.post("/api/storage/save", (req, res) => {
  try {
    const { data, clinicName, appVersion } = req.body;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "Dữ liệu không hợp lệ." });
    }

    // Create automatic rolling backup of previous file if it exists
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, DB_BACKUP_FILE);
      } catch (backupErr) {
        console.warn("Could not create rolling backup:", backupErr);
      }
    }

    const payload = {
      appVersion: appVersion || "1.2.0",
      updatedAt: new Date().toISOString(),
      clinicName: clinicName || "Phòng Khám Da Liễu Dermacare AI",
      data,
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), "utf-8");
    const stats = fs.statSync(DB_FILE);

    res.json({
      success: true,
      message: "Đã lưu trữ dữ liệu an toàn vào ổ cứng máy tính (data/clinic_database.json).",
      savedAt: payload.updatedAt,
      sizeBytes: stats.size,
      sizeFormatted: (stats.size / 1024).toFixed(1) + " KB",
      dbFilePath: DB_FILE,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Direct download of database file
app.get("/api/storage/download", (_req, res) => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return res.status(404).json({ error: "Chưa có tệp dữ liệu lưu trữ trên máy tính." });
    }
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Disposition", `attachment; filename="dermacare_backup_${dateStr}.json"`);
    res.setHeader("Content-Type", "application/json");
    const fileStream = fs.createReadStream(DB_FILE);
    fileStream.pipe(res);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Restore database from uploaded JSON payload
app.post("/api/storage/restore", (req, res) => {
  try {
    const payload = req.body;
    if (!payload || (!payload.data && !payload.patients)) {
      return res.status(400).json({ error: "Tệp sao lưu không đúng định dạng chuẩn Dermacare." });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, DB_BACKUP_FILE);
      } catch (e) {
        // ignore
      }
    }

    const standardPayload = {
      appVersion: payload.appVersion || "1.2.0",
      updatedAt: new Date().toISOString(),
      clinicName: payload.clinicName || "Phòng Khám Da Liễu Dermacare AI",
      data: payload.data || payload,
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(standardPayload, null, 2), "utf-8");

    res.json({
      success: true,
      message: "Đã khôi phục cơ sở dữ liệu trên ổ cứng máy tính thành công.",
      restoredAt: standardPayload.updatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to parse base64 image data
function parseBase64Image(dataUriOrBase64: string): { mimeType: string; data: string } {
  if (dataUriOrBase64.startsWith("data:")) {
    const matches = dataUriOrBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return { mimeType: matches[1], data: matches[2] };
    }
  }
  return { mimeType: "image/jpeg", data: dataUriOrBase64 };
}

// AI Analysis Endpoint for Dermatological Lesion (Macroscopic & Dermoscopy)
app.post("/api/ai/analyze-lesion", async (req, res) => {
  try {
    const {
      patient,
      lesionInfo,
      images, // Array<{ type: 'macroscopic' | 'dermoscopy', dataUrl: string, label?: string }>
      clinicalNotes,
    } = req.body;

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng kiểm tra mục Settings > Secrets.",
      });
    }

    const contentsParts: any[] = [];

    // Add prompt instructions
    const promptText = `
Bạn là một Chuyên gia Da liễu và Soi da (Dermoscopist) hàng đầu. Hãy phân tích ca bệnh da liễu lâm sàng và hình ảnh học (tổn thương đại thể và dermoscopy) được cung cấp dưới đây.

THÔNG TIN BỆNH NHÂN & LÂM SÀNG:
- Mã bệnh nhân: ${patient?.code || "N/A"}
- Tuổi: ${patient?.age || "N/A"}, Giới tính: ${patient?.gender || "N/A"}
- Loại tổn thương lâm sàng: ${lesionInfo?.type || "Không rõ"}
- Vị trí tổn thương: ${lesionInfo?.location || "Chưa xác định"}
- Thời gian xuất hiện: ${lesionInfo?.duration || "Không rõ"}
- Kích thước ước tính: ${lesionInfo?.size || "Không rõ"}
- Mô tả chi tiết hình dạng sang thương: ${lesionInfo?.morphology || "Không có mô tả chi tiết hình dạng"}
- Triệu chứng kèm theo: ${lesionInfo?.symptoms?.join(", ") || "Không có"}
- Tiền sử cá nhân/gia đình về ung thư da hoặc nốt ruồi bất thường: ${patient?.history || "Không"}
- Phân loại da Fitzpatrick: ${patient?.fitzpatrick || "Type III"}
- Ghi chú lâm sàng: ${clinicalNotes || "Không có"}

HÃY ĐÁNH GIÁ CHI TIẾT THEO CÁC TIÊU CHUẨN DA LIỄU QUỐC TẾ:
1. ĐẶC ĐIỂM TỔN THƯƠNG ĐẠI THỂ (Macroscopic evaluation: kích thước, bờ, màu sắc, bề mặt, loét, vảy, gồ lên...)
2. ĐẶC ĐIỂM DERMOSCOPY (Kính soi da):
   - Cấu trúc mạng sắc tố (Pigment network: typical / atypical / absent)
   - Chấm và hạt (Dots & globules: regular / irregular / peripheral)
   - Vệt và giả chân (Streaks, pseudopods)
   - Màn che xanh trắng (Blue-white veil)
   - Cấu trúc mạch máu (Vascular patterns: arborizing, hairpin, comma, dotted, polymorphous)
   - Cấu trúc thoái triển (Regression structures: white scar-like, peppering)
3. THANG ĐIỂM ABCD (TDS - Total Dermoscopy Score):
   - A (Asymmetry: 0-2) x 1.3
   - B (Border: 0-8) x 0.1
   - C (Color: 1-6) x 0.5
   - D (Differential structural components: 1-5) x 0.5
   - Tính tổng TDS ước lượng và phân nhóm nguy cơ (<4.75: Lành tính; 4.75-5.45: Đáng ngờ; >5.45: Nghi ngờ ác tính)
4. DANH SÁCH 7 ĐIỂM (7-Point Checklist) ước tính nếu phù hợp.
5. CHẨN ĐOÁN PHÂN BIỆT (Differential Diagnosis) xếp theo thứ tự xác suất (%).
6. KHUYẾN NGHỊ LÂM SÀNG (Theo dõi định kỳ 3 tháng, Sinh thiết trọn tổn thương, Cắt lạnh Mohs, Điều trị bôi tại chỗ, v.v.).

LƯU Ý QUAN TRỌNG:
Hãy trả về JSON CHÍNH XÁC với định dạng sau (không chứa markdown backticks ngoài JSON):
{
  "summary": "Tóm tắt ngắn gọn nhận định lâm sàng và dermoscopy (2-3 câu)",
  "macroscopicFindings": "Mô tả đặc điểm tổn thương đại thể...",
  "dermoscopyFindings": {
    "pigmentNetwork": "Bình thường / Không điển hình / Dạng sợi / Mất cấu trúc...",
    "vascularPattern": "Mạch máu hình cành cây / Dạng chấm / Không thấy...",
    "dotsAndGlobules": "Mô tả phân bố chấm hạt...",
    "blueWhiteVeil": "Có / Không / Vùng gợi ý...",
    "structures": ["Mạng sắc tố không điển hình", "Màn xanh trắng", "Cấu trúc thoái triển"]
  },
  "abcdScore": {
    "asymmetry": 1,
    "border": 4,
    "color": 3,
    "differentialStructures": 3,
    "tds": 5.15,
    "interpretation": "Tổn thương nghi ngờ, cần theo dõi sát hoặc sinh thiết"
  },
  "riskLevel": "LOW" | "MODERATE" | "HIGH",
  "differentialDiagnoses": [
    { "disease": "Tên bệnh (Tiếng Việt kèm thuật ngữ tiếng Anh)", "probability": 75, "rationale": "Lý do dựa trên hình ảnh..." },
    { "disease": "Tên bệnh khác", "probability": 15, "rationale": "Lý do..." }
  ],
  "suggestedPrimaryDiagnosis": "Chẩn đoán ban đầu khả dĩ nhất",
  "recommendations": [
    "Khuyến nghị cụ thể 1",
    "Khuyến nghị cụ thể 2"
  ],
  "urgentAttention": false,
  "followUpInterval": "3 tháng / 6 tháng / Can thiệp ngay"
}
`;

    // Process and attach images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.dataUrl) {
          const parsed = parseBase64Image(img.dataUrl);
          contentsParts.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data,
            },
          });
          contentsParts.push({
            text: `[Hình ảnh: ${img.type === "dermoscopy" ? "Kính soi da (Dermoscopy)" : "Tổn thương lâm sàng đại thể (Macroscopic)"}${img.label ? ` - ${img.label}` : ""}]`,
          });
        }
      }
    }

    contentsParts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: contentsParts },
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = response.text || "{}";
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      // Clean possible wrapper if any
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedResult = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      data: parsedResult,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in AI analysis:", error);
    return res.status(500).json({
      error: error.message || "Lỗi trong quá trình xử lý phân tích hình ảnh AI.",
    });
  }
});

// AI Comparison Endpoint to track Treatment Progress over time
app.post("/api/ai/compare-progress", async (req, res) => {
  try {
    const { patient, previousVisit, currentVisit } = req.body;

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Chưa cấu hình GEMINI_API_KEY trên máy chủ.",
      });
    }

    const contentsParts: any[] = [];

    if (previousVisit?.image?.dataUrl) {
      const prevImg = parseBase64Image(previousVisit.image.dataUrl);
      contentsParts.push({
        inlineData: { mimeType: prevImg.mimeType, data: prevImg.data },
      });
      contentsParts.push({
        text: `[Hình ảnh lần khám trước: Ngày ${previousVisit.date} - ${previousVisit.diagnosis || ""}]`,
      });
    }

    if (currentVisit?.image?.dataUrl) {
      const curImg = parseBase64Image(currentVisit.image.dataUrl);
      contentsParts.push({
        inlineData: { mimeType: curImg.mimeType, data: curImg.data },
      });
      contentsParts.push({
        text: `[Hình ảnh lần khám hiện tại: Ngày ${currentVisit.date} - Phác đồ đã áp dụng: ${currentVisit.treatmentApplied || "Chưa ghi nhận"}]`,
      });
    }

    const promptText = `
Hãy so sánh tiến triển tổn thương da liễu và dermoscopy giữa 2 lần khám của bệnh nhân ${patient?.name || "Bệnh nhân"}:
- Lần khám trước (${previousVisit?.date}): Chẩn đoán: ${previousVisit?.diagnosis || "Không rõ"}, Kích thước: ${previousVisit?.size || "Không rõ"}
- Lần khám hiện tại (${currentVisit?.date}): Phác đồ điều trị đã dùng: ${currentVisit?.treatmentApplied || "Không rõ"}

YÊU CẦU ĐÁNH GIÁ:
1. So sánh thay đổi về kích thước diện tích tổn thương (thu nhỏ, giữ nguyên, hay mở rộng lan tỏa).
2. So sánh thay đổi màu sắc và sắc tố (giảm ban đỏ, mờ dần sắc tố, hay xuất hiện màu sắc mới bất thường).
3. So sánh cấu trúc dermoscopy (mạng lưới sắc tố, mạch máu có thoái triển tốt hay có cấu trúc mới).
4. Đánh giá đáp ứng điều trị: RẤT TỐT (Significant Improvement), ỔN ĐỊNH (Stable), hay TIẾN TRIỂN XẤU / CẦN THAY ĐỔI PHÁC ĐỒ (Progression/Concern).
5. Khuyến nghị cho bác sĩ điều trị trong lần tái khám kế tiếp.

Trả về định dạng JSON:
{
  "progressStatus": "IMPROVED" | "STABLE" | "REGRESSED" | "CONCERN",
  "statusLabel": "Tiến triển tốt / Ổn định / Tổn thương thu nhỏ / Nghi ngờ thoái triển xấu",
  "sizeChangeDescription": "Mô tả thay đổi kích thước...",
  "pigmentationChangeDescription": "Mô tả thay đổi sắc tố và viêm đỏ...",
  "dermoscopyEvolution": "Đánh giá thay đổi cấu trúc soi da...",
  "treatmentEfficacyEvaluation": "Đánh giá hiệu quả phác đồ đã sử dụng...",
  "nextStepRecommendations": [
    "Khuyến nghị 1",
    "Khuyến nghị 2"
  ]
}
`;

    contentsParts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: contentsParts },
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = response.text || "{}";
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedResult = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      data: parsedResult,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in AI comparison:", error);
    return res.status(500).json({
      error: error.message || "Lỗi phân tích so sánh tiến triển ca bệnh.",
    });
  }
});

// Automated Notification / SMS / Zalo dispatch simulation with delivery logs
app.post("/api/notifications/send-reminder", (req, res) => {
  const { appointmentId, patientName, patientPhone, appointmentDate, appointmentTime, doctorName, messageChannel } = req.body;

  const simulatedMessage = `[Phòng khám Da liễu Dermacare] Xin chào ${patientName || "Quý khách"}, bạn có lịch hẹn khám da liễu vào lúc ${appointmentTime || "09:00"} ngày ${appointmentDate}. Bác sĩ phụ trách: ${doctorName || "BS. Chuyên khoa"}. Vui lòng đến đúng giờ hoặc liên hệ hotline để đổi lịch. Chúc bạn một ngày tốt lành!`;

  const logEntry = {
    id: "SMS-" + Date.now().toString(36).toUpperCase(),
    appointmentId,
    patientName,
    patientPhone,
    channel: messageChannel || "SMS",
    message: simulatedMessage,
    status: "DELIVERED",
    timestamp: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: logEntry,
    message: `Đã kích hoạt gửi tin nhắn nhắc hẹn tự động qua ${logEntry.channel} tới số ${patientPhone}.`,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dermacare Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
