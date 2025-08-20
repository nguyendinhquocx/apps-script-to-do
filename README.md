# Hệ thống gửi email tự động từ Google Sheets

Ứng dụng Google Apps Script để gửi email tự động 3 lần mỗi ngày với nội dung từ Google Sheets "bai hoc moi ngay".

## Tính năng

- Gửi email tự động 3 lần mỗi ngày (6h sáng, 12h trưa, 8h tối)
- Lấy dữ liệu ngẫu nhiên từ 3 sheets khác nhau:
  - **Bài học mỗi ngày**: 3 bài học ngẫu nhiên từ cột B
  - **To Do**: 1 việc cần làm ngẫu nhiên từ cột A
  - **Ghi lại cuộc sống**: 1 hàng ngẫu nhiên gồm 3 cột (B, C, D)
- Thiết kế email tối giản với màu trắng đen
- Template HTML responsive và đẹp mắt

## Cài đặt

### Bước 1: Chuẩn bị Google Sheets

1. Tạo Google Sheets với tên "bai hoc moi ngay"
2. Tạo 3 sheets con:
   - `bai hoc moi ngay`
   - `to do`
   - `ghi lai cuoc song`

### Bước 2: Cấu trúc dữ liệu

#### Sheet "bai hoc moi ngay"
| A (Ngày) | B (Bài học) | C (Nguồn) | D (Điều rán) | E (Tạo file PDF) |
|----------|-------------|-----------|--------------|------------------|
| 11/04/2025 | Những gì rút ra hằng ngày... | chính ta | điều rán số 1 | /Drive/... |

#### Sheet "to do"
| A (To Do) | B (Ngày) |
|-----------|----------|
| Đọc sách và nhận ra nhiều điều | 20/08/2025 |

#### Sheet "ghi lai cuoc song"
| A (Ngày) | B (Nhìn thấy) | C (Nhận ra) | D (Bài học khách quan) |
|----------|---------------|-------------|------------------------|
| 07/05/2025 | mua tai nghe 3 triệu... | Phi lí trí của tiết kiệm | |

### Bước 3: Tạo Google Apps Script

1. Mở Google Sheets của bạn
2. Vào **Extensions** > **Apps Script**
3. Xóa code mặc định và copy toàn bộ nội dung từ file `Code.gs`
4. Lưu project với tên "Daily Email Automation"

### Bước 4: Cấu hình

1. **Cập nhật URL Spreadsheet**:
   ```javascript
   function getSpreadsheetUrl() {
     return 'https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit';
   }
   ```
   
2. **Cập nhật email nhận**:
   ```javascript
   const CONFIG = {
     // ...
     EMAIL_RECIPIENT: 'your-email@gmail.com', // Thay bằng email của bạn
     // ...
   };
   ```

### Bước 5: Cấp quyền

1. Chạy hàm `testScript()` để test
2. Cấp quyền truy cập Google Sheets và Gmail khi được yêu cầu
3. Kiểm tra log để đảm bảo không có lỗi

### Bước 6: Tạo Triggers

1. Chạy hàm `createTriggers()` để tạo lịch tự động
2. Kiểm tra trong **Triggers** tab để đảm bảo đã tạo thành công

## Sử dụng

### Chạy thủ công
```javascript
// Test toàn bộ hệ thống
testScript();

// Gửi email ngay lập tức
sendDailyEmail();

// Tạo lại triggers
createTriggers();
```

### Kiểm tra Triggers

1. Vào **Apps Script** > **Triggers**
2. Kiểm tra 3 triggers đã được tạo:
   - 6:00 AM hàng ngày
   - 12:00 PM hàng ngày
   - 8:00 PM hàng ngày

### Debug

1. Kiểm tra **Executions** tab để xem lịch sử chạy
2. Xem **Logs** để debug lỗi
3. Chạy `testScript()` để kiểm tra từng phần

## Cấu trúc Code

### Các hàm chính

- `sendDailyEmail()`: Hàm chính để gửi email
- `getRandomBaiHoc()`: Lấy 3 bài học ngẫu nhiên
- `getRandomToDo()`: Lấy 1 to-do ngẫu nhiên
- `getRandomGhiLai()`: Lấy 1 ghi chú cuộc sống ngẫu nhiên
- `createEmailContent()`: Tạo HTML email
- `sendEmail()`: Gửi email
- `createTriggers()`: Tạo lịch tự động
- `testScript()`: Test hệ thống

### Cấu hình

```javascript
const CONFIG = {
  SPREADSHEET_NAME: 'bai hoc moi ngay',
  SHEETS: {
    BAI_HOC: 'bai hoc moi ngay',
    TO_DO: 'to do',
    GHI_LAI: 'ghi lai cuoc song'
  },
  EMAIL_RECIPIENT: 'your-email@gmail.com',
  EMAIL_SUBJECT: 'Bài học và suy ngẫm hàng ngày'
};
```

## Thiết kế Email

- **Phong cách**: Tối giản, trắng đen
- **Font**: Segoe UI, Tahoma, Geneva, Verdana
- **Layout**: Responsive, tối đa 600px
- **Sections**: Header, Bài học, To Do, Ghi lại cuộc sống, Footer

## Troubleshooting

### Lỗi thường gặp

1. **"Không tìm thấy sheet"**
   - Kiểm tra tên sheets có đúng không
   - Đảm bảo sheets tồn tại trong spreadsheet

2. **"Vui lòng cập nhật URL"**
   - Cập nhật hàm `getSpreadsheetUrl()` với URL thực tế

3. **Không nhận được email**
   - Kiểm tra email trong spam
   - Đảm bảo đã cấp quyền Gmail
   - Kiểm tra email recipient trong CONFIG

4. **Triggers không chạy**
   - Kiểm tra timezone trong Google Apps Script
   - Xem execution history để debug

### Tips

- Chạy `testScript()` trước khi tạo triggers
- Kiểm tra logs thường xuyên
- Backup code trước khi thay đổi
- Test với ít dữ liệu trước khi chạy production

## Tùy chỉnh

### Thay đổi thời gian gửi

Sửa trong hàm `createTriggers()`:
```javascript
// Ví dụ: thay đổi thành 7h sáng
ScriptApp.newTrigger('sendDailyEmail')
  .timeBased()
  .everyDays(1)
  .atHour(7)  // Thay đổi giờ ở đây
  .create();
```

### Thay đổi số lượng dữ liệu

Sửa trong các hàm `getRandomXXX()`:
```javascript
// Ví dụ: lấy 5 bài học thay vì 3
return getRandomItems(values, 5);
```

### Tùy chỉnh template email

Sửa trong hàm `createEmailContent()` để thay đổi CSS và HTML.

## Bảo mật

- Không chia sẻ URL spreadsheet
- Không commit email credentials
- Sử dụng email riêng cho testing
- Kiểm tra quyền truy cập thường xuyên

## Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra logs trong Apps Script
2. Chạy `testScript()` để debug
3. Xem execution history
4. Kiểm tra cấu hình CONFIG

---

**Lưu ý**: Đây là ứng dụng cá nhân, hãy đảm bảo tuân thủ chính sách sử dụng của Google Apps Script và Gmail.