# PHẦN MỀM QUẢN LÝ PHÒNG MẠCH — CLINIC CLOUD

> Giải pháp số hóa toàn diện cho phòng khám tư nhân: từ tiếp đón, khám bệnh, kê đơn,
> bán thuốc đến thu phí và báo cáo — tất cả trên một nền tảng duy nhất.

---

## 1. TỔNG QUAN

**Clinic Cloud** là hệ thống quản lý phòng mạch hiện đại, giúp phòng khám vận hành
chuyên nghiệp và minh bạch theo đúng quy trình thực tế:

**Tiếp nhận → Khám bệnh → Kê đơn (xuất thuốc theo lô) → Thu phí → Báo cáo**

Phần mềm phù hợp cho:
- Phòng khám tư nhân, phòng mạch chuyên khoa (Nội, Tai Mũi Họng, Sản, Nhi…)
- Phòng khám đa khoa quy mô nhỏ và vừa
- Nhà thuốc – quầy dược có kết hợp khám bệnh

**Điểm khác biệt:** Giao diện hoàn toàn tiếng Việt, dễ dùng, không cần đào tạo phức
tạp; phân quyền rõ ràng theo từng vị trí công việc; tích hợp gọi số bằng giọng nói
và nhắc lịch hẹn cho bệnh nhân.

---

## 2. PHÂN QUYỀN THEO 4 VAI TRÒ

Mỗi nhân viên đăng nhập sẽ chỉ thấy đúng những chức năng thuộc phận sự của mình —
giao diện tự động tối giản, tránh thao tác nhầm và bảo mật thông tin.

| Vai trò | Phận sự | Quyền truy cập |
|---------|---------|----------------|
| 🟢 **Lễ tân** | Tiếp đón & thu phí | Lịch hẹn, tiếp nhận bệnh nhân, tivi sảnh chờ, thanh toán viện phí |
| 🟣 **Bác sĩ** | Chẩn trị & kê đơn | Lịch hẹn, khám lâm sàng, kê toa thuốc |
| 🔵 **Dược sĩ** | Quản lý kho dược | Kho thuốc, nhập thuốc, nhà cung cấp |
| ⚫ **Chủ phòng mạch** | Quản trị & ERP | Toàn quyền: báo cáo, cài đặt, và tất cả module trên |

---

## 3. CÁC TÍNH NĂNG CHÍNH

### 🏥 3.1. Tiếp nhận & Khám lâm sàng
Trung tâm vận hành của phòng khám:
- **Hồ sơ bệnh nhân điện tử:** lưu trữ họ tên, tuổi, giới tính, số điện thoại, địa
  chỉ, **tiền sử bệnh lý** và **dị ứng thuốc** — tra cứu nhanh khi tái khám.
- **Hàng chờ khám trực tiếp:** danh sách bệnh nhân theo trạng thái rõ ràng —
  *Chờ khám → Đang khám → Đã kê đơn → Đã thanh toán*.
- **Phòng khám của bác sĩ:** ghi nhận triệu chứng, chẩn đoán, lời dặn và kê đơn
  thuốc trực tiếp trên màn hình.

### 📅 3.2. Lịch hẹn phòng khám
- Đặt lịch hẹn cho bệnh nhân theo ngày/giờ, kèm lý do khám.
- Liên kết với hồ sơ bệnh nhân cũ, tự động theo dõi trạng thái:
  *Chưa khám / Đã khám / Quá hẹn*.
- Hỗ trợ **nhắc lịch hẹn tự động** trước giờ hẹn (xem mục Cài đặt).

### 📺 3.3. Tivi sảnh chờ — Gọi số bằng giọng nói
Màn hình hiển thị chuyên nghiệp cho khu vực sảnh chờ:
- Hai cột rõ ràng: **"Đang được gọi vào phòng khám"** và **"Đang chờ lượt tiếp theo"**.
- **Loa gọi tự động bằng giọng nói tiếng Việt:** một cú nhấp sẽ đọc to
  *"Mời bệnh nhân [tên]… vào [phòng khám] để bác sĩ khám bệnh."*
- Đồng hồ thời gian thực, hiển thị số thứ tự và phòng khám phụ trách.

### 💊 3.4. Kê đơn thuốc theo lô (FEFO)
Quản lý xuất thuốc thông minh, hạn chế tối đa thất thoát:
- **Nguyên tắc FEFO** (First Expired – First Out): hệ thống ưu tiên xuất lô thuốc
  **gần hết hạn trước**, tránh thuốc tồn quá hạn.
- Mỗi đơn thuốc ghi rõ: tên thuốc, hoạt chất, số lượng, **cách dùng**, đơn giá tại
  thời điểm kê.
- Tự động trừ tồn kho theo từng lô khi kê đơn.

### 💰 3.5. Thanh toán viện phí
Quầy thu ngân minh bạch, đầy đủ:
- Tự động tổng hợp **tiền khám + tiền thuốc + dịch vụ cận lâm sàng**, áp dụng
  **giảm giá** nếu có.
- Nhiều hình thức thanh toán: **Tiền mặt, Chuyển khoản, Thẻ, QR VietQR**.
- Hỗ trợ **thanh toán một phần & theo dõi công nợ** bệnh nhân.
- **In hóa đơn / phiếu thu** trực tiếp, chọn khổ giấy **A4** (chuẩn báo cáo) hoặc
  **A5** (chuẩn toa thuốc).

### 📦 3.6. Quản lý kho dược phẩm
Kiểm soát toàn diện thuốc và vật tư:
- **Danh mục thuốc:** tên biệt dược, hoạt chất, đơn vị tính, nhóm thuốc, nhà sản
  xuất, mức tồn tối thiểu.
- **Quản lý theo lô (FEFO):** số lô, ngày hết hạn, số lượng tồn, giá nhập, giá bán.
- **Cảnh báo thông minh:** tự động báo thuốc **sắp hết hàng** và thuốc **sắp/đã hết hạn**.
- **Nhật ký xuất – nhập kho:** ghi lại mọi biến động kèm lý do và người thực hiện.

### 🚚 3.7. Nhập thuốc & Nhà cung cấp
- **Tạo phiếu nhập thuốc** từ nhà cung cấp, tự động cập nhật tồn kho và giá vốn.
- **Hồ sơ nhà cung cấp:** thông tin liên hệ, lịch sử giao dịch, ghi chú.

### 📊 3.8. Bảng điều khiển & Báo cáo ERP
Bức tranh toàn cảnh cho chủ phòng mạch:
- **Bảng điều khiển:** chỉ số tổng quan, **bảng xếp hạng bác sĩ năng suất**, và
  **theo dõi công nợ** bệnh nhân.
- **Báo cáo doanh thu** theo Ngày / Tháng / Năm với **biểu đồ xu thế trực quan**.
- **Bảng xếp hạng** dược phẩm bán chạy và dịch vụ được chỉ định nhiều nhất.
- **Thống kê bệnh nhân** theo nhân khẩu học và lượt khám.
- **Xuất báo cáo ra Excel** chỉ với một cú nhấp.

### ⚙️ 3.9. Cài đặt & Tùy biến
- **Hồ sơ phòng khám:** tên, logo, địa chỉ, hotline, email — hiển thị trên hóa đơn in.
- **Khổ in mặc định:** A4 hoặc A5.
- **Tự động cấp số thứ tự (STT)** tiếp đón khám.
- **Nhắc lịch hẹn** trước X phút và **gửi tin nhắn Zalo OA** tự động cho bệnh nhân.
- **Xem trước hóa đơn** ngay khi chỉnh cấu hình.

---

## 4. ĐIỂM MẠNH NỔI BẬT

| Tiêu chí | Lợi ích cho phòng khám |
|----------|------------------------|
| 🇻🇳 **100% tiếng Việt** | Nhân viên dùng được ngay, gần như không cần đào tạo |
| 🎨 **Giao diện hiện đại** | Thiết kế sạch, có **chế độ Sáng / Tối**, chuyên nghiệp |
| 📱 **Đa thiết bị** | Chạy mượt trên máy tính, máy tính bảng và điện thoại |
| 🔒 **Phân quyền chặt chẽ** | Mỗi vị trí chỉ thấy đúng phần việc của mình |
| 🔊 **Gọi số bằng giọng nói** | Tăng trải nghiệm chuyên nghiệp tại sảnh chờ |
| 📈 **Báo cáo trực quan** | Chủ phòng mạch nắm doanh thu, công nợ, tồn kho tức thì |
| 🗂️ **Quản lý lô FEFO** | Giảm thất thoát do thuốc hết hạn |

---

## 5. QUY TRÌNH VẬN HÀNH MẪU

```
1. LỄ TÂN     →  Đặt lịch hẹn / Tiếp nhận bệnh nhân, tạo phiếu khám
2. SẢNH CHỜ   →  Tivi gọi số bằng giọng nói mời bệnh nhân vào phòng
3. BÁC SĨ     →  Khám, chẩn đoán, kê đơn thuốc (tự động xuất lô FEFO)
4. LỄ TÂN     →  Thu phí (khám + thuốc + dịch vụ), in hóa đơn A4/A5
5. DƯỢC SĨ    →  Theo dõi tồn kho, nhập thuốc, cảnh báo hạn dùng
6. CHỦ PM     →  Xem báo cáo doanh thu, công nợ, hiệu suất, xuất Excel
```

---

## 6. LIÊN HỆ TƯ VẤN & DÙNG THỬ

Để được tư vấn chi tiết, demo trực tiếp hoặc dùng thử miễn phí, vui lòng liên hệ:

- **Hotline:** _[điền số điện thoại]_
- **Email:** _[điền email]_
- **Website / Zalo:** _[điền thông tin]_

> *Tài liệu này mô tả các tính năng hiện có của phần mềm. Một số tính năng nâng cao
> (gửi Zalo OA, đồng bộ đám mây nhiều chi nhánh) có thể được kích hoạt theo gói dịch vụ.*
</content>
</invoke>
