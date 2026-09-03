# HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG DERMACARE AI TRÊN MÁY TÍNH CÁ NHÂN (LOCAL)

Tài liệu này hướng dẫn chi tiết cách tải về, khởi chạy ứng dụng **Dermacare AI** trên máy tính của bạn và cơ chế lưu trữ dữ liệu y khoa trực tiếp trên ổ cứng máy tính.

---

## 1. Yêu Cầu Hệ Thống (Prerequisites)

1. **Hệ điều hành**: Windows 10/11, macOS, hoặc Linux (Ubuntu, Debian, Fedora...).
2. **Node.js**: Phiên bản Node.js **18 LTS** hoặc **20 LTS** trở lên.
   - Kiểm tra xem máy đã cài Node.js chưa bằng cách mở Terminal / Command Prompt và gõ:
     ```bash
     node -v
     npm -v
     ```
   - Nếu chưa có, tải bộ cài đặt chính thức tại: [https://nodejs.org](https://nodejs.org) (chọn bản LTS khuyên dùng).

---

## 2. Cách Tải Mã Nguồn Về Máy Tính

1. Tại giao diện Google AI Studio, bấm vào biểu tượng **Cài Đặt / Settings** (hoặc dấu 3 chấm góc phải trên).
2. Chọn **Export to ZIP** (Tải file nén .zip về máy) hoặc **Export to GitHub**.
3. Giải nén file `.zip` vào một thư mục trên máy tính của bạn (ví dụ: `D:\DermacareAI` hoặc `C:\Users\Admin\DermacareAI`).

---

## 3. Khởi Chạy Ứng Dụng (2 Cách)

### Cách 1: Khởi chạy nhanh 1-Click (Khuyên Dùng)

- **Trên Windows**: 
  - Vào thư mục vừa giải nén, nhấp đúp chuột (Double click) vào tệp **`start_local.bat`**.
  - Script sẽ tự động kiểm tra Node.js, cài đặt thư viện (`npm install` nếu chưa có), tạo thư mục dữ liệu `data/` và tự động mở trình duyệt web tại địa chỉ `http://localhost:3000`.

- **Trên macOS / Linux**:
  - Mở Terminal tại thư mục dự án và chạy:
    ```bash
    chmod +x start_local.sh
    ./start_local.sh
    ```

---

### Cách 2: Khởi chạy thủ công bằng dòng lệnh (Terminal / Command Prompt)

1. Mở Terminal / PowerShell / CMD tại thư mục dự án.
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Tạo file cấu hình môi trường `.env`:
   - Sao chép file `.env.example` thành `.env`:
     - Trên Windows: `copy .env.example .env`
     - Trên Mac/Linux: `cp .env.example .env`
   - Mở file `.env` và điền khóa API Gemini (nếu muốn sử dụng tính năng Phân tích Soi da AI):
     ```env
     GEMINI_API_KEY=AIzaSy...
     ```
4. Khởi chạy máy chủ:
   ```bash
   npm run dev
   ```
5. Mở trình duyệt web bất kỳ (Chrome, Edge, Safari, Firefox, Cốc Cốc) và truy cập:
   ```
   http://localhost:3000
   ```

---

## 4. Cơ Chế Lưu Trữ Dữ Liệu Trên Ổ Cứng Máy Tính

Ứng dụng Dermacare AI sử dụng cơ chế **Lưu Trữ Kép An Toàn (Dual-Sync)**:

1. **Tệp Cơ sở dữ liệu Cục bộ (`data/clinic_database.json`)**:
   - Mọi thao tác thêm bệnh nhân mới, ghi nhận sang thương, tải ảnh soi da Dermoscopy, ghi nhận ca thủ thuật (Laser, Botox, Filler, Mesotherapy...) hay xuất kho dược chất đều được **tự động lưu vào file `data/clinic_database.json`** nằm ngay trong thư mục dự án trên ổ cứng máy tính của bạn.
   - Khi có chỉnh sửa, hệ thống sẽ tự động tạo thêm một bản sao lưu dự phòng an toàn `data/clinic_database.bak.json`.
2. **Lưu trữ trình duyệt (LocalStorage)**:
   - Giúp ứng dụng hoạt động mượt mà, phản hồi ngay lập tức mà không có độ trễ mạng.
3. **Xuất & Nhập file thủ công**:
   - Tại mục **"Lưu Trữ Máy Tính & Chạy Local"** trên menu phần mềm, bạn có thể:
     - Bấm **"Tải tệp sao lưu (.JSON)"** để tải toàn bộ dữ liệu về thư mục Downloads của máy tính hoặc chép vào USB.
     - Bấm **"Khôi phục từ tệp máy tính"** để nạp dữ liệu từ bất kỳ file `.json` nào đã sao lưu trước đó.

---

## 5. Truy Cập Trong Mạng Nội Bộ Phòng Khám (Mạng LAN / WiFi)

Máy chủ được cấu hình lắng nghe tại `0.0.0.0:3000`, cho phép tất cả các thiết bị cùng kết nối vào mạng WiFi phòng khám truy cập:

1. Trên máy tính chạy máy chủ, xem địa chỉ IP mạng LAN:
   - Trên Windows: gõ `ipconfig` (tìm dòng *IPv4 Address*, ví dụ: `192.168.1.15`).
   - Trên Mac: gõ `ifconfig | grep "inet "` (ví dụ: `192.168.1.15`).
2. Trên iPad, điện thoại hoặc máy tính khác tại phòng khám, mở trình duyệt và gõ:
   ```
   http://192.168.1.15:3000
   ```
   *(Thay 192.168.1.15 bằng IP thực tế của máy chủ)*.

---

## 6. Đóng Gói Và Chạy Bản Production (Hiệu Năng Tối Đa)

Khi đưa vào sử dụng thực tế hằng ngày tại phòng khám, bạn có thể đóng gói bản sản xuất:

```bash
# 1. Biên dịch ứng dụng
npm run build

# 2. Khởi động máy chủ Production tốc độ cao
npm start
```

---

## 7. Xử Lý Sự Cố Thường Gặp (Troubleshooting)

- **Lỗi cổng 3000 đã bị chiếm dụng (Port 3000 is already in use)**:
  - Kiểm tra xem có cửa sổ terminal nào khác đang chạy không và đóng lại.
  - Trên Windows: `netstat -ano | findstr :3000` rồi đóng tiến trình tương ứng.
- **Không phân tích được Soi da AI**:
  - Kiểm tra xem bạn đã điền `GEMINI_API_KEY` vào file `.env` chưa. Khóa API có thể tạo miễn phí tại [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey).
- **Mất điện hoặc tắt máy tính đột ngột**:
  - Dữ liệu luôn được lưu liên tục trong `data/clinic_database.json` và tệp sao lưu `clinic_database.bak.json`, khi khởi động lại ứng dụng sẽ tự động tải lại trạng thái nguyên vẹn.
