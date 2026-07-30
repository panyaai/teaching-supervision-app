function getSheetData(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    if (sheetName === 'Users') {
      sheet.appendRow(['U001', 'ดร. สมเกียรติ ยอดเยี่ยม', 'ผู้อำนวยการ', 'บริหาร', 'admin@school.ac.th', 'Admin']);
      sheet.appendRow(['U002', 'สมหญิง รักเรียน', 'รองผู้อำนวยการ', 'บริหาร', 'supervisor1@school.ac.th', 'Supervisor']);
      sheet.appendRow(['U003', 'ครูสมปอง ทองคำ', 'ครู', 'คณิตศาสตร์', 'sompong@school.ac.th', 'Teacher']);
    }
    if (sheetName === 'Categories') {
      sheet.appendRow(['preparation', '1. การเตรียมการสอน']);
      sheet.appendRow(['activity', '2. การจัดกิจกรรมการเรียนรู้']);
      sheet.appendRow(['media', '3. การใช้สื่อและนวัตกรรม']);
      sheet.appendRow(['assessment', '4. การวัดและประเมินผล']);
    }
  }

  // Ensure headers exist for existing sheets
  const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let headersUpdated = false;
  headers.forEach((h, index) => {
    if (existingHeaders[index] !== h) {
      sheet.getRange(1, index + 1).setValue(h);
      headersUpdated = true;
    }
  });

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  // Use our known headers rather than whatever might be in the sheet 
  // (in case we just added some and the data array doesn't reflect it if there are no rows)
  const keys = headers;
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    for (let j = 0; j < keys.length; j++) {
      obj[keys[j]] = row[j] !== undefined ? row[j] : '';
    }
    result.push(obj);
  }
  
  return result;
}

function doGet(e) {
  try {
    const usersHeaders = ['User_ID', 'Name', 'Position', 'Subject_Group', 'Email', 'Role'];
    const supervisionHeaders = ['Supervision_ID', 'Date_Time', 'Teacher_Name', 'Supervisor_Name', 'Subject_Name', 'Subject_Code', 'Grade_Level', 'Status', 'Total_Score', 'Rating_Level', 'Strengths', 'Suggestions', 'Plan_URL', 'Score_Prep', 'Score_Activity', 'Score_Media', 'Score_Assessment'];
    const categoriesHeaders = ['Category_ID', 'Title'];

    const users = getSheetData('Users', usersHeaders);
    const supervisionRecords = getSheetData('Supervision_Records', supervisionHeaders);
    const categories = getSheetData('Categories', categoriesHeaders);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      data: {
        users: users,
        supervisionRecords: supervisionRecords,
        categories: categories
      }
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Supervision_Records');
    
    const supervisionHeaders = ['Supervision_ID', 'Date_Time', 'Teacher_Name', 'Supervisor_Name', 'Subject_Name', 'Subject_Code', 'Grade_Level', 'Status', 'Total_Score', 'Rating_Level', 'Strengths', 'Suggestions', 'Plan_URL', 'Score_Prep', 'Score_Activity', 'Score_Media', 'Score_Assessment'];

    if (!sheet) {
      sheet = ss.insertSheet('Supervision_Records');
      sheet.appendRow(supervisionHeaders);
    } else {
      // Ensure headers exist
      const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      supervisionHeaders.forEach((h, index) => {
        if (existingHeaders[index] !== h) {
          sheet.getRange(1, index + 1).setValue(h);
        }
      });
    }

    const action = data.action;

    if (action === 'submit_plan') {
      let planUrl = '';
      if (data.fileBase64 && data.fileName) {
        try {
          const folderId = '1qbCKw09scehqCJlNhHLMs6XqCLl6p8IB';
          const folder = DriveApp.getFolderById(folderId);
          const contentType = data.mimeType || 'application/octet-stream';
          const decodedData = Utilities.base64Decode(data.fileBase64);
          const blob = Utilities.newBlob(decodedData, contentType, data.fileName);
          const file = folder.createFile(blob);
          
          planUrl = file.getUrl();
        } catch (e) {
          planUrl = 'Upload Failed: ' + e.toString();
        }
      }

      const row = [
        'SUP' + new Date().getTime().toString().substr(-6),
        new Date().toISOString(),
        data.teacherName || 'ไม่ระบุ',
        '', // Supervisor_Name
        data.subject || 'ไม่ระบุ',
        data.subjectCode || '', // เวลาประเมิน
        data.gradeLevel || '', // ห้องที่สอน
        'รอรับการนิเทศ', // Status
        0, // Total_Score
        '-', // Rating_Level
        '', // Strengths
        '', // Suggestions
        planUrl, // Plan_URL
        0, 0, 0, 0 // Scores
      ];
      sheet.appendRow(row);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'ส่งคำขอรับการนิเทศเรียบร้อยแล้ว' })).setMimeType(ContentService.MimeType.JSON);
      
    } else if (action === 'evaluate' || action === 'evaluate_new') {
      let rating = 'ปรับปรุง';
      const finalScore = data.percentageScore || data.totalScore || 0;
      
      if (finalScore >= 80) rating = 'ดีเยี่ยม';
      else if (finalScore >= 70) rating = 'ดีมาก';
      else if (finalScore >= 60) rating = 'ดี';
      else if (finalScore >= 50) rating = 'พอใช้';

      // Parse Category Scores
      const cats = data.categoryScores || {};
      const scorePrep = cats['preparation'] || 0;
      const scoreActivity = cats['activity'] || 0;
      const scoreMedia = cats['media'] || 0;
      const scoreAssessment = cats['assessment'] || 0;

      const row = [
        'SUP' + new Date().getTime().toString().substr(-6),
        new Date().toISOString(),
        data.teacherName || 'ไม่ระบุ',
        data.supervisorName || 'ไม่ระบุ',
        data.subject || 'ไม่ระบุ',
        data.subjectCode || '', // เวลาประเมิน (if provided in new evaluation)
        data.gradeLevel || '', // ห้อง (if provided in new evaluation)
        'เสร็จสิ้น',
        finalScore,
        rating,
        data.strengths || '',
        data.suggestions || '',
        '',
        scorePrep,
        scoreActivity,
        scoreMedia,
        scoreAssessment
      ];
      sheet.appendRow(row);

      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'ประเมินเรียบร้อยแล้ว' })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action' })).setMimeType(ContentService.MimeType.JSON);
    }
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
