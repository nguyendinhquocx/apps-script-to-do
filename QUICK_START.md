# Hướng dẫn nhanh - 5 phút thiết lập

## Bước 1: Chuẩn bị Google Sheets (2 phút)

1. Tạo Google Sheets mới với tên: **"bai hoc moi ngay"**
2. Tạo 3 sheets con:
   - `bai hoc moi ngay`
   - `to do` 
   - `ghi lai cuoc song`

3. **Thêm dữ liệu mẫu:**

### Sheet "bai hoc moi ngay"
```
A1: Ngày          | B1: Bài học
A2: 11/04/2025    | B2: Những gì rút ra hằng ngày mày phải ghi lại
A3: 10/04/2025    | B3: Để có trải nghiệm mày bắt buộc phải đánh đổi
```

### Sheet "to do"
```
A1: To Do                           | B1: Ngày
A2: Đọc sách và nhận ra nhiều điều  | B2: 20/08/2025
A3: Sống tử tế                      | B3: 20/08/2025
```

### Sheet "ghi lai cuoc song"
```
A1: Ngày     | B1: Nhìn thấy              | C1: Nhận ra                    | D1: Bài học
A2: 07/05/25 | B2: mua tai nghe 3 triệu   | C2: Phi lí trí của tiết kiệm   | D2: cân nhắc kỹ
```

## Bước 2: Tạo Apps Script (2 phút)

1. Trong Google Sheets, vào **Extensions** → **Apps Script**
2. Xóa code mặc định
3. Copy toàn bộ nội dung từ file `Code.gs` và paste vào
4. **Lưu** với tên "Daily Email Automation"

## Bước 3: Cấu hình (1 phút)

1. **Lấy ID của Google Sheets:**
   - Copy URL của sheets: `https://docs.google.com/spreadsheets/d/ABC123XYZ/edit`
   - ID là phần `ABC123XYZ`

2. **Cập nhật 2 thông tin quan trọng:**

```javascript
// Tìm hàm này và thay YOUR_SPREADSHEET_ID
function getSpreadsheetUrl() {
  return 'https://docs.google.com/spreadsheets/d/ABC123XYZ/edit'; // Thay ABC123XYZ
}

// Tìm CONFIG và thay email
const CONFIG = {
  // ...
  EMAIL_RECIPIENT: 'your-email@gmail.com', // Thay bằng email của bạn
  // ...
};
```

## Bước 4: Test và chạy

1. **Test ngay:**
   ```javascript
   testScript(); // Chạy hàm này để test
   ```

2. **Cấp quyền** khi được yêu cầu (Gmail + Sheets)

3. **Gửi email thử:**
   ```javascript
   sendDailyEmail(); // Chạy để gửi email ngay
   ```

4. **Tạo lịch tự động:**
   ```javascript
   createTriggers(); // Tạo lịch gửi 3 lần/ngày
   ```

## ✅ Hoàn thành!

Hệ thống sẽ tự động gửi email:
- **6h sáng** - Động lực bắt đầu ngày
- **12h trưa** - Nhắc nhở giữa ngày  
- **8h tối** - Suy ngẫm cuối ngày

## 🔧 Tùy chỉnh nhanh

### Thay đổi giờ gửi:
```javascript
// Trong hàm createTriggers(), thay số giờ:
.atHour(7)  // Thay 6 thành 7 để gửi 7h sáng
```

### Thay đổi số lượng bài học:
```javascript
// Trong getRandomBaiHoc(), thay số 3:
return getRandomItems(values, 5); // Lấy 5 bài học thay vì 3
```

## 🚨 Lỗi thường gặp

**"Không tìm thấy sheet"**
→ Kiểm tra tên sheets có đúng không

**"Vui lòng cập nhật URL"**
→ Chưa thay YOUR_SPREADSHEET_ID

**Không nhận email**
→ Kiểm tra spam, kiểm tra email trong CONFIG

**Triggers không chạy**
→ Vào Apps Script → Triggers để kiểm tra

## 📧 Mẫu email nhận được

```
📧 Bài học và suy ngẫm hàng ngày

🎯 BÀI HỌC MỖI NGÀY
1. Những gì rút ra hằng ngày mày phải ghi lại
2. Để có trải nghiệm mày bắt buộc phải đánh đổi
3. [Bài học thứ 3]

✅ VIỆC CẦN LÀM
Đọc sách và nhận ra nhiều điều

💭 GHI LẠI CUỘC SỐNG
Nhìn thấy: mua tai nghe 3 triệu
Nhận ra: Phi lí trí của tiết kiệm
Bài học: cân nhắc kỹ
```

---

**Cần hỗ trợ?** Xem file `README.md` để biết chi tiết hơn!