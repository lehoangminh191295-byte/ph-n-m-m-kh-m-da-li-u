# Dermacare AI - Hệ Thống Hồ Sơ Bệnh Án Da Liễu & Soi Da (Dermoscopy)

Dermacare AI là giải pháp phần mềm quản lý lâm sàng chuyên khoa da liễu và thẩm mỹ da, tích hợp kính soi da Dermoscopy, phân tích trí tuệ nhân tạo Gemini 3.8 Flash, theo dõi tiến triển điều trị sang thương, quản lý thủ thuật (Laser, Botox, Filler, Mesotherapy), quản lý kho dược chất và hồ sơ bảo mật.

---

## 🚀 Hướng Dẫn Chạy Cục Bộ Trên Máy Tính (Local Setup)

Xem tài liệu hướng dẫn chi tiết bằng tiếng Việt tại: **[HUONG_DAN_CHAY_LOCAL.md](./HUONG_DAN_CHAY_LOCAL.md)**

### Khởi động nhanh (Quick Start):

1. **Khởi chạy tự động 1-Click**:
   - **Windows**: Nhấp đúp vào `start_local.bat`
   - **macOS / Linux**: Chạy `./start_local.sh`

2. **Khởi chạy thủ công qua Terminal**:
   ```bash
   # Cài đặt thư viện
   npm install

   # Cấu hình file môi trường
   cp .env.example .env

   # Khởi chạy máy chủ
   npm run dev
   ```

3. Mở trình duyệt tại: **`http://localhost:3000`**

---

## 💾 Cơ Chế Lưu Trữ Dữ Liệu Trên Máy Tính (Computer Disk Storage)

- Dữ liệu toàn bộ phòng khám (bệnh nhân, hình ảnh tổn thương, phác đồ, thủ thuật can thiệp, kho dược chất) được lưu trữ trực tiếp trên ổ cứng máy tính tại:
  `./data/clinic_database.json`
- Tự động sao lưu dự phòng: `./data/clinic_database.bak.json`
- Có thể xuất và nhập tệp sao lưu độc lập bất kỳ lúc nào tại mục **"Lưu Trữ Máy Tính & Chạy Local"** trong ứng dụng.
