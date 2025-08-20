/**
 * File cấu hình mẫu cho Google Apps Script
 * Copy file này thành config.gs và cập nhật các thông tin cần thiết
 */

// Cấu hình chính
const CONFIG = {
  // Tên Google Sheets (phải khớp với tên thực tế)
  SPREADSHEET_NAME: 'bai hoc moi ngay',
  
  // Tên các sheets con
  SHEETS: {
    BAI_HOC: 'bai hoc moi ngay',
    TO_DO: 'to do', 
    GHI_LAI: 'ghi lai cuoc song'
  },
  
  // Email nhận thông báo (THAY ĐỔI THÀNH EMAIL CỦA BẠN)
  EMAIL_RECIPIENT: 'your-email@gmail.com',
  
  // Tiêu đề email
  EMAIL_SUBJECT: 'Bài học và suy ngẫm hàng ngày',
  
  // Số lượng dữ liệu lấy ngẫu nhiên
  RANDOM_COUNTS: {
    BAI_HOC: 3,  // Lấy 3 bài học
    TO_DO: 1,    // Lấy 1 to-do
    GHI_LAI: 1   // Lấy 1 ghi chú cuộc sống
  },
  
  // Thời gian gửi email (giờ trong ngày)
  SEND_TIMES: {
    MORNING: 6,   // 6h sáng
    NOON: 12,     // 12h trưa  
    EVENING: 20   // 8h tối
  }
};

/**
 * Lấy URL của Google Sheets
 * QUAN TRỌNG: Thay thế YOUR_SPREADSHEET_ID bằng ID thực tế
 * 
 * Cách lấy ID:
 * 1. Mở Google Sheets của bạn
 * 2. Copy URL, ví dụ: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * 3. ID là phần giữa /d/ và /edit: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
 */
function getSpreadsheetUrl() {
  const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // THAY ĐỔI DÒNG NÀY
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;
}

/**
 * Cấu hình email nâng cao (tùy chọn)
 */
const EMAIL_CONFIG = {
  // Có gửi email copy cho bản thân không
  SEND_COPY_TO_SELF: false,
  
  // Email CC (để trống nếu không cần)
  CC_EMAIL: '',
  
  // Tên người gửi hiển thị
  SENDER_NAME: 'Hệ thống bài học hàng ngày',
  
  // Có đính kèm dữ liệu gốc không
  INCLUDE_RAW_DATA: false
};

/**
 * Cấu hình giao diện email
 */
const UI_CONFIG = {
  // Màu chủ đạo
  COLORS: {
    PRIMARY: '#000000',     // Đen
    SECONDARY: '#666666',   // Xám đậm
    BACKGROUND: '#ffffff',  // Trắng
    BORDER: '#dddddd',      // Xám nhạt
    ACCENT: '#f9f9f9'       // Xám rất nhạt
  },
  
  // Font chữ
  FONTS: {
    PRIMARY: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    SIZE_HEADER: '24px',
    SIZE_SECTION: '18px',
    SIZE_CONTENT: '14px'
  },
  
  // Kích thước
  DIMENSIONS: {
    MAX_WIDTH: '600px',
    PADDING: '20px',
    BORDER_WIDTH: '2px'
  }
};

/**
 * Cấu hình debug và logging
 */
const DEBUG_CONFIG = {
  // Bật chế độ debug
  ENABLE_DEBUG: true,
  
  // Log chi tiết
  VERBOSE_LOGGING: false,
  
  // Gửi email test thay vì email thực
  TEST_MODE: false,
  
  // Email test (nếu TEST_MODE = true)
  TEST_EMAIL: 'test@gmail.com'
};

/**
 * Hàm kiểm tra cấu hình
 */
function validateConfig() {
  const errors = [];
  
  // Kiểm tra email
  if (!CONFIG.EMAIL_RECIPIENT || CONFIG.EMAIL_RECIPIENT === 'your-email@gmail.com') {
    errors.push('Chưa cập nhật EMAIL_RECIPIENT');
  }
  
  // Kiểm tra Spreadsheet ID
  try {
    const url = getSpreadsheetUrl();
    if (url.includes('YOUR_SPREADSHEET_ID')) {
      errors.push('Chưa cập nhật SPREADSHEET_ID trong getSpreadsheetUrl()');
    }
  } catch (e) {
    errors.push('Lỗi trong getSpreadsheetUrl(): ' + e.message);
  }
  
  if (errors.length > 0) {
    console.error('Lỗi cấu hình:');
    errors.forEach(error => console.error('- ' + error));
    return false;
  }
  
  console.log('Cấu hình hợp lệ!');
  return true;
}

/**
 * Hàm test cấu hình
 */
function testConfig() {
  console.log('=== KIỂM TRA CẤU HÌNH ===');
  
  console.log('Spreadsheet Name:', CONFIG.SPREADSHEET_NAME);
  console.log('Email Recipient:', CONFIG.EMAIL_RECIPIENT);
  console.log('Sheets:', CONFIG.SHEETS);
  console.log('Send Times:', CONFIG.SEND_TIMES);
  
  try {
    console.log('Spreadsheet URL:', getSpreadsheetUrl());
  } catch (e) {
    console.error('Lỗi URL:', e.message);
  }
  
  validateConfig();
  
  console.log('=== KẾT THÚC KIỂM TRA ===');
}