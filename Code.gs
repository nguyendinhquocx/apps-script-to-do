/**
 * Google Apps Script để gửi email tự động từ Google Sheets
 * Lấy dữ liệu ngẫu nhiên từ 3 sheets và gửi email 3 lần mỗi ngày
 */

// Cấu hình
const CONFIG = {
  SPREADSHEET_NAME: 'bai hoc moi ngay',
  SHEETS: {
    BAI_HOC: 'bai hoc moi ngay',
    TO_DO: 'to do',
    GHI_LAI: 'ghi lai cuoc song'
  },
  EMAIL_RECIPIENT: 'quoc.nguyen3@hoanmy.com', // Thay đổi email của bạn
  EMAIL_SUBJECT: 'Bài học và suy ngẫm hàng ngày'
};

/**
 * Hàm chính để chạy toàn bộ quy trình
 */
function sendDailyEmail() {
  try {
    // Xác định thời điểm gửi email (1: sáng, 2: trưa, 3: tối)
    const currentHour = new Date().getHours();
    let emailSession;
    if (currentHour >= 6 && currentHour < 12) {
      emailSession = 1;
    } else if (currentHour >= 12 && currentHour < 18) {
      emailSession = 2;
    } else {
      emailSession = 3;
    }
    
    // Lấy dữ liệu từ các sheets
    const baiHocData = getRandomBaiHoc();
    const toDoData = getRandomToDo();
    const ghiLaiData = getRandomGhiLai();
    
    // Tạo nội dung email
    const emailContent = createEmailContent(baiHocData, toDoData, ghiLaiData);
    
    // Gửi email với tiêu đề mới
    sendEmail(emailContent, emailSession);
    
    console.log('Email đã được gửi thành công!');
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
  }
}

/**
 * Lấy 3 bài học ngẫu nhiên từ sheet 'bai hoc moi ngay' (cột B)
 */
function getRandomBaiHoc() {
  const spreadsheet = SpreadsheetApp.openByUrl(getSpreadsheetUrl());
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.BAI_HOC);
  
  if (!sheet) {
    throw new Error(`Không tìm thấy sheet: ${CONFIG.SHEETS.BAI_HOC}`);
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  
  // Lấy tất cả dữ liệu từ cột B (bỏ qua hàng tiêu đề)
  const range = sheet.getRange(2, 2, lastRow - 1, 1);
  const values = range.getValues().flat().filter(value => value && value.toString().trim() !== '');
  
  // Lấy 3 giá trị ngẫu nhiên
  return getRandomItems(values, 3);
}

/**
 * Lấy tất cả to do từ sheet 'to do' (cột B)
 */
function getRandomToDo() {
  const spreadsheet = SpreadsheetApp.openByUrl(getSpreadsheetUrl());
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.TO_DO);
  
  if (!sheet) {
    throw new Error(`Không tìm thấy sheet: ${CONFIG.SHEETS.TO_DO}`);
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  
  // Lấy tất cả dữ liệu từ cột B (bỏ qua hàng tiêu đề)
  const range = sheet.getRange(2, 2, lastRow - 1, 1);
  const values = range.getValues().flat().filter(value => {
    // Lọc bỏ các giá trị rỗng và các giá trị là Date object
    if (!value || value.toString().trim() === '') {
      return false;
    }
    // Loại bỏ Date objects
    if (value instanceof Date) {
      return false;
    }
    // Chấp nhận tất cả các kiểu dữ liệu khác (string, number, etc.)
    return true;
  });
  
  console.log('To Do values found:', values); // Debug log
  
  // Trả về tất cả các giá trị
  return values;
}

/**
 * Lấy 1 hàng ngẫu nhiên từ sheet 'ghi lai cuoc song' (cột B, C, D)
 */
function getRandomGhiLai() {
  const spreadsheet = SpreadsheetApp.openByUrl(getSpreadsheetUrl());
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.GHI_LAI);
  
  if (!sheet) {
    throw new Error(`Không tìm thấy sheet: ${CONFIG.SHEETS.GHI_LAI}`);
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return null;
  }
  
  // Lấy tất cả dữ liệu từ cột B, C, D (bỏ qua hàng tiêu đề)
  const range = sheet.getRange(2, 2, lastRow - 1, 3);
  const values = range.getValues();
  
  // Lọc các hàng có dữ liệu
  const validRows = values.filter(row => 
    row.some(cell => cell && cell.toString().trim() !== '')
  );
  
  if (validRows.length === 0) {
    return null;
  }
  
  // Lấy 1 hàng ngẫu nhiên
  const randomIndex = Math.floor(Math.random() * validRows.length);
  const selectedRow = validRows[randomIndex];
  
  return {
    nhinThay: selectedRow[0] || '',
    nhanRa: selectedRow[1] || '',
    baiHoc: selectedRow[2] || ''
  };
}

/**
 * Lấy các phần tử ngẫu nhiên từ mảng
 */
function getRandomItems(array, count) {
  if (!array || array.length === 0) {
    return [];
  }
  
  const shuffled = array.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Tạo nội dung email HTML
 */
function createEmailContent(baiHocData, toDoData, ghiLaiData) {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .section {
          margin-bottom: 30px;
          padding: 20px;
          background-color: #ffffff;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #000;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .content-item {
          margin-bottom: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .content-item:last-child {
          border-bottom: none;
        }
        .ghi-lai-item {
          margin-bottom: 8px;
        }
        .ghi-lai-label {
          font-weight: 600;
          color: #666;
          display: inline-block;
          min-width: 120px;
        }
      </style>
    </head>
    <body>
  `;
  
  // Thêm bài học
  if (baiHocData && baiHocData.length > 0) {
    html += `
      <div class="section">
        <div class="section-title">Bài học mỗi ngày</div>
    `;
    
    baiHocData.forEach((baiHoc, index) => {
      html += `<div class="content-item">${index + 1}. ${baiHoc}</div>`;
    });
    
    html += `</div>`;
  }
  
  // Thêm to do
  if (toDoData && toDoData.length > 0) {
    html += `
      <div class="section">
        <div class="section-title">Việc cần làm</div>
    `;
    
    toDoData.forEach((toDo, index) => {
      html += `<div class="content-item">${index + 1}. ${toDo}</div>`;
    });
    
    html += `</div>`;
  }
  
  // Thêm ghi lại cuộc sống
  if (ghiLaiData) {
    html += `
      <div class="section">
        <div class="section-title">Ghi lại cuộc sống</div>
        <div class="content-item">
          <div class="ghi-lai-item">
            <span class="ghi-lai-label">Nhìn thấy:</span> ${ghiLaiData.nhinThay}
          </div>
          <div class="ghi-lai-item">
            <span class="ghi-lai-label">Nhận ra:</span> ${ghiLaiData.nhanRa}
          </div>
          <div class="ghi-lai-item">
            <span class="ghi-lai-label">Bài học:</span> ${ghiLaiData.baiHoc}
          </div>
        </div>
      </div>
    `;
  }
  
  html += `
    </body>
    </html>
  `;
  
  return html;
}

/**
 * Gửi email
 */
function sendEmail(htmlContent, emailSession = 1) {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('vi-VN');
  const subject = `TO DO ${dateString} [${emailSession}]`;
  
  MailApp.sendEmail({
    to: CONFIG.EMAIL_RECIPIENT,
    subject: subject,
    htmlBody: htmlContent
  });
}

/**
 * Lấy URL của spreadsheet (cần cập nhật)
 */
function getSpreadsheetUrl() {
  return 'https://docs.google.com/spreadsheets/d/1yTWfP2PwkBvJ8WYR-d0jeE-OZJaf7snZDdBLI09gXnA/edit';
}


/**
 * Tạo triggers tự động
 */
function createTriggers() {
  // Xóa tất cả triggers cũ
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Tạo trigger cho 6h sáng
  ScriptApp.newTrigger('sendDailyEmail')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();
  
  // Tạo trigger cho 12h trưa
  ScriptApp.newTrigger('sendDailyEmail')
    .timeBased()
    .everyDays(1)
    .atHour(12)
    .create();
  
  // Tạo trigger cho 8h tối
  ScriptApp.newTrigger('sendDailyEmail')
    .timeBased()
    .everyDays(1)
    .atHour(20)
    .create();
  
  console.log('Đã tạo triggers thành công!');
}

/**
 * Hàm test để kiểm tra
 */
function testScript() {
  console.log('Bắt đầu test...');
  
  try {
    const baiHoc = getRandomBaiHoc();
    console.log('Bài học:', baiHoc);
    
    const toDo = getRandomToDo();
    console.log('To do:', toDo);
    
    const ghiLai = getRandomGhiLai();
    console.log('Ghi lại:', ghiLai);
    
    const emailContent = createEmailContent(baiHoc, toDo, ghiLai);
    console.log('Email content created successfully');
    
  } catch (error) {
    console.error('Lỗi trong test:', error);
  }
}