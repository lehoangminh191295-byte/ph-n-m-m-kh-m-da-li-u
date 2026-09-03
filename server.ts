import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
