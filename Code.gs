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
    ENGLISH: 'english'
  },
  EMAIL_RECIPIENT: 'quoc.nguyen3@hoanmy.com', // Thay đổi email của bạn
  EMAIL_SUBJECT: 'Bài học và suy ngẫm hàng ngày',
  COUNTS: {
    BAI_HOC: 5,
    ENGLISH: 20
  }
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
    const englishData = getRandomEnglish();
    const totalCompleted = getTotalCompletedTodos();
    
    // Tạo nội dung email
    const emailContent = createEmailContent(baiHocData, toDoData, englishData, totalCompleted);
    
    // Gửi email với tiêu đề mới
    sendEmail(emailContent, emailSession);
    
    console.log('Email đã được gửi thành công!');
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
  }
}

/**
 * Lấy 5 bài học ngẫu nhiên từ sheet 'bai hoc moi ngay' (cột B)
 * và đánh dấu 'x' vào cột 'mail' cho các bài học đã gửi
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
  
  // Tìm cột 'mail' dựa trên tiêu đề
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  const headers = headerRange.getValues()[0];
  const mailColumnIndex = headers.findIndex(header => 
    header && header.toString().toLowerCase().trim() === 'mail'
  ) + 1;
  
  if (mailColumnIndex === 0) {
    throw new Error('Không tìm thấy cột "mail" trong sheet bài học');
  }
  
  // Lấy tất cả dữ liệu từ cột B (bài học) và cột mail
  const dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
  const values = dataRange.getValues();
  
  // Lọc các hàng chưa được đánh dấu 'x' trong cột mail và có dữ liệu bài học
  const availableRows = [];
  values.forEach((row, index) => {
    const baiHoc = row[1]; // Cột B - bài học
    const mailStatus = row[mailColumnIndex - 1]; // Cột mail
    
    if (baiHoc && baiHoc.toString().trim() !== '' && 
        mailStatus !== 'x') {
      availableRows.push({
        rowIndex: index + 2, // +2 vì index bắt đầu từ 0 và hàng đầu tiên là tiêu đề
        baiHoc: baiHoc.toString().trim()
      });
    }
  });
  
  // Nếu không còn bài học nào chưa gửi, reset tất cả (xóa 'x' khỏi cột mail)
  if (availableRows.length === 0) {
    console.log('Tất cả bài học đã được gửi, đang reset...');
    const mailColumn = sheet.getRange(2, mailColumnIndex, lastRow - 1, 1);
    mailColumn.clearContent();
    
    // Lặp lại để lấy dữ liệu sau khi reset
    values.forEach((row, index) => {
      const baiHoc = row[1];
      
      if (baiHoc && baiHoc.toString().trim() !== '') {
        availableRows.push({
          rowIndex: index + 2,
          baiHoc: baiHoc.toString().trim()
        });
      }
    });
  }
  
  if (availableRows.length === 0) {
    return [];
  }
  
  // Lấy ngẫu nhiên số bài học theo cấu hình
  const shuffled = availableRows.slice().sort(() => 0.5 - Math.random());
  const selectedLessons = shuffled.slice(0, Math.min(CONFIG.COUNTS.BAI_HOC, availableRows.length));
  
  // Đánh dấu 'x' vào cột mail cho các bài học đã chọn
  selectedLessons.forEach(lesson => {
    sheet.getRange(lesson.rowIndex, mailColumnIndex).setValue('x');
  });
  
  console.log(`Đã chọn ${selectedLessons.length} bài học và đánh dấu 'x'`);
  
  return selectedLessons.map(lesson => lesson.baiHoc);
}

/**
 * Lấy tất cả to do của ngày hiện tại từ sheet 'to do'
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
  
  // Lấy ngày hiện tại (chỉ ngày, không có giờ)
  const today = new Date();
  const todayString = today.toLocaleDateString('vi-VN');
  
  // Lấy tất cả dữ liệu từ cột A (ngày) và cột B (việc cần làm)
  const range = sheet.getRange(2, 1, lastRow - 1, 2);
  const values = range.getValues();
  
  // Lọc các hàng có ngày trùng với ngày hiện tại
  const todayTodos = [];
  
  values.forEach(row => {
    const dateCell = row[0];
    const todoCell = row[1];
    
    // Kiểm tra nếu có dữ liệu việc cần làm
    if (todoCell && todoCell.toString().trim() !== '') {
      let dateString = '';
      
      // Xử lý ngày từ cột A
      if (dateCell instanceof Date) {
        dateString = dateCell.toLocaleDateString('vi-VN');
      } else if (dateCell && dateCell.toString().trim() !== '') {
        dateString = dateCell.toString().trim();
      }
      
      // So sánh ngày
      if (dateString === todayString) {
        todayTodos.push(todoCell.toString().trim());
      }
    }
  });
  
  console.log('Today date:', todayString);
  console.log('Today To Do values found:', todayTodos);
  
  return todayTodos;
}

/**
 * Đếm tổng số việc đã làm trong sheet 'to do' (tất cả các hàng có dữ liệu)
 */
function getTotalCompletedTodos() {
  const spreadsheet = SpreadsheetApp.openByUrl(getSpreadsheetUrl());
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.TO_DO);
  
  if (!sheet) {
    return 0;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return 0;
  }
  
  // Lấy tất cả dữ liệu từ cột A (việc cần làm)
  const range = sheet.getRange(2, 1, lastRow - 1, 1);
  const values = range.getValues().flat();
  
  // Đếm số hàng có dữ liệu
  const completedCount = values.filter(value => value && value.toString().trim() !== '').length;
  
  console.log(`Tổng số việc đã làm: ${completedCount}`);
  
  return completedCount;
}

/**
 * Lấy 20 từ vựng tiếng Anh ngẫu nhiên từ sheet 'english' (cột A, B, D)
 * và đánh dấu 'x' vào cột F (mail) cho các từ đã gửi
 */
function getRandomEnglish() {
  const spreadsheet = SpreadsheetApp.openByUrl(getSpreadsheetUrl());
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.ENGLISH);
  
  if (!sheet) {
    throw new Error(`Không tìm thấy sheet: ${CONFIG.SHEETS.ENGLISH}`);
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  
  // Lấy tất cả dữ liệu từ cột A, B, C, D, E, F
  const range = sheet.getRange(2, 1, lastRow - 1, 6);
  const values = range.getValues();
  
  // Lọc các hàng chưa được đánh dấu 'x' trong cột F (mail) và có dữ liệu hợp lệ
  const availableRows = [];
  values.forEach((row, index) => {
    const tuVung = row[0]; // Cột A - từ vựng
    const chuThich = row[1]; // Cột B - chú thích  
    const phienAm = row[3]; // Cột D - phiên âm
    const mailStatus = row[5]; // Cột F - mail
    
    if (tuVung && tuVung.toString().trim() !== '' && 
        mailStatus !== 'x') {
      availableRows.push({
        rowIndex: index + 2, // +2 vì index bắt đầu từ 0 và hàng đầu tiên là tiêu đề
        tuVung: tuVung.toString().trim(),
        chuThich: chuThich ? chuThich.toString().trim() : '',
        phienAm: phienAm ? phienAm.toString().trim() : ''
      });
    }
  });
  
  // Nếu không còn từ nào chưa gửi, reset tất cả (xóa 'x' khỏi cột F)
  if (availableRows.length === 0) {
    console.log('Tất cả từ vựng đã được gửi, đang reset...');
    const mailColumn = sheet.getRange(2, 6, lastRow - 1, 1);
    mailColumn.clearContent();
    
    // Lặp lại để lấy dữ liệu sau khi reset
    values.forEach((row, index) => {
      const tuVung = row[0];
      const chuThich = row[1];
      const phienAm = row[3];
      
      if (tuVung && tuVung.toString().trim() !== '') {
        availableRows.push({
          rowIndex: index + 2,
          tuVung: tuVung.toString().trim(),
          chuThich: chuThich ? chuThich.toString().trim() : '',
          phienAm: phienAm ? phienAm.toString().trim() : ''
        });
      }
    });
  }
  
  if (availableRows.length === 0) {
    return [];
  }
  
  // Lấy ngẫu nhiên số từ vựng theo cấu hình
  const shuffled = availableRows.slice().sort(() => 0.5 - Math.random());
  const selectedWords = shuffled.slice(0, Math.min(CONFIG.COUNTS.ENGLISH, availableRows.length));
  
  // Đánh dấu 'x' vào cột F cho các từ đã chọn
  selectedWords.forEach(word => {
    sheet.getRange(word.rowIndex, 6).setValue('x');
  });
  
  console.log(`Đã chọn ${selectedWords.length} từ vựng và đánh dấu 'x'`);
  
  return selectedWords;
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
function createEmailContent(baiHocData, toDoData, englishData, totalCompleted = 0) {
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
  html += `
    <div class="section">
      <div class="section-title">Đã làm</div>
  `;
  
  if (toDoData && toDoData.length > 0) {
    toDoData.forEach((toDo, index) => {
      html += `<div class="content-item">${index + 1}. ${toDo}</div>`;
    });
  } else {
    html += `<div class="content-item">-</div>`;
  }
  
  // Thêm dấu chấm động lực
  if (totalCompleted > 0) {
    const dots = '.'.repeat(totalCompleted);
    html += `
      <div class="content-item" style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
        <div style="font-weight: 600; margin-bottom: 10px; color: #333;">Done [${totalCompleted}]:</div>
        <div style="font-family: monospace; font-size: 16px; line-height: 1.4; word-break: break-all; color: #666;">${dots}</div>
      </div>
    `;
  }
  
  html += `</div>`; 
  
  // Thêm từ vựng tiếng Anh
  if (englishData && englishData.length > 0) {
    html += `
      <div class="section">
        <div class="section-title">English Vocabulary</div>
    `;
    
    englishData.forEach((word, index) => {
      html += `
        <div class="content-item">
          <div style="font-weight: 600; margin-bottom: 5px;">${index + 1}. ${word.tuVung}</div>
          <div style="font-style: italic; color: #666; margin-bottom: 3px;">${word.phienAm}</div>
          <div style="color: #333;">${word.chuThich}</div>
        </div>
      `;
    });
    
    html += `</div>`;
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
  const subject = `${dateString} [${emailSession}]`;
  
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
    
    const english = getRandomEnglish();
    console.log('English vocabulary:', english);
    
    const totalCompleted = getTotalCompletedTodos();
    console.log('Tổng việc đã làm:', totalCompleted);
    
    const emailContent = createEmailContent(baiHoc, toDo, english, totalCompleted);
    console.log('Email content created successfully');
    
  } catch (error) {
    console.error('Lỗi trong test:', error);
  }
}