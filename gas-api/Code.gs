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

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const keys = data[0];
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    for (let j = 0; j < keys.length; j++) {
      obj[keys[j]] = row[j];
    }
    result.push(obj);
  }
  
  return result;
}

function doGet(e) {
  try {
    const usersHeaders = ['User_ID', 'Name', 'Position', 'Subject_Group', 'Email', 'Role'];
    const supervisionHeaders = ['Supervision_ID', 'Date_Time', 'Teacher_Name', 'Supervisor_Name', 'Subject_Name', 'Subject_Code', 'Grade_Level', 'Status', 'Total_Score', 'Rating_Level', 'Strengths', 'Suggestions', 'Plan_URL'];
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
    
    if (!sheet) {
      sheet = ss.insertSheet('Supervision_Records');
      sheet.appendRow(['Supervision_ID', 'Date_Time', 'Teacher_Name', 'Supervisor_Name', 'Subject_Name', 'Subject_Code', 'Grade_Level', 'Status', 'Total_Score', 'Rating_Level', 'Strengths', 'Suggestions', 'Plan_URL']);
    }

    const action = data.action;

    // File Upload handling
    let planUrl = data.planUrl || '';
    if (data.fileData && data.fileName && data.mimeType) {
      try {
        const decodedFile = Utilities.base64Decode(data.fileData);
        const blob = Utilities.newBlob(decodedFile, data.mimeType, data.fileName);
        const folder = DriveApp.getFolderById("1qbCKw09scehqCJlNhHLMs6XqCLl6p8IB");
        
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        planUrl = file.getUrl();
      } catch (err) {
        planUrl = "Upload Failed: " + err.toString();
      }
    }

    if (action === 'submit_plan') {
      // 1. ครูส่งแผนการสอน (สร้างเรคคอร์ดใหม่ สถานะ "รอรับการนิเทศ")
      const row = [
        'SUP' + new Date().getTime().toString().substr(-6),
        new Date().toISOString(),
        data.teacherName || 'ไม่ระบุ',
        '', // Supervisor_Name
        data.subject || 'ไม่ระบุ',
        '', // Subject_Code
        '', // Grade_Level
        'รอรับการนิเทศ', // Status
        0, // Total_Score
        '-', // Rating_Level
        '', // Strengths
        '', // Suggestions
        planUrl // Plan_URL
      ];
      sheet.appendRow(row);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'ส่งแผนการสอนเรียบร้อยแล้ว' })).setMimeType(ContentService.MimeType.JSON);
      
    } else if (action === 'evaluate') {
      // 2. กรรมการประเมินแผน (อัปเดตเรคคอร์ดเดิม สถานะ "เสร็จสิ้น")
      const targetId = data.supervisionId;
      if (!targetId) throw new Error("Missing supervisionId");

      // หาระยะบรรทัดที่มี Supervision_ID ตรงกัน
      const sheetData = sheet.getDataRange().getValues();
      let rowIndex = -1;
      for (let i = 1; i < sheetData.length; i++) {
        if (sheetData[i][0] === targetId) {
          rowIndex = i + 1; // getValues is 0-indexed, but getRange is 1-indexed
          break;
        }
      }

      if (rowIndex === -1) throw new Error("ไม่พบรหัสการนิเทศที่ต้องการประเมิน");

      // 100-point scale Rating Level
      let rating = 'ปรับปรุง';
      const finalScore = data.percentageScore || data.totalScore || 0;
      
      if (finalScore >= 80) rating = 'ดีเยี่ยม';
      else if (finalScore >= 70) rating = 'ดีมาก';
      else if (finalScore >= 60) rating = 'ดี';
      else if (finalScore >= 50) rating = 'พอใช้';

      // อัปเดตข้อมูล (คอลัมน์ D=Supervisor_Name, H=Status, I=Total_Score, J=Rating, K=Strengths, L=Suggestions)
      // Array index in setValues is [row][col]
      // Supervisor_Name (Col 4)
      sheet.getRange(rowIndex, 4).setValue(data.supervisorName || 'ไม่ระบุ');
      // Status (Col 8)
      sheet.getRange(rowIndex, 8).setValue('เสร็จสิ้น');
      // Total_Score (Col 9)
      sheet.getRange(rowIndex, 9).setValue(finalScore);
      // Rating_Level (Col 10)
      sheet.getRange(rowIndex, 10).setValue(rating);
      // Strengths (Col 11)
      sheet.getRange(rowIndex, 11).setValue(data.strengths || '');
      // Suggestions (Col 12)
      sheet.getRange(rowIndex, 12).setValue(data.suggestions || '');
      
      // ถ้ากรรมการมีการอัปโหลดไฟล์ใหม่มาทับ ให้เปลี่ยน URL ด้วย (Col 13)
      if (planUrl) {
        sheet.getRange(rowIndex, 13).setValue(planUrl);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'ประเมินเรียบร้อยแล้ว' })).setMimeType(ContentService.MimeType.JSON);
    } else {
      // Fallback for older versions
      let rating = 'ปรับปรุง';
      const finalScore = data.percentageScore || data.totalScore || 0;
      if (finalScore >= 80) rating = 'ดีเยี่ยม';
      else if (finalScore >= 70) rating = 'ดีมาก';
      else if (finalScore >= 60) rating = 'ดี';
      else if (finalScore >= 50) rating = 'พอใช้';
      
      const row = [
        'SUP' + new Date().getTime().toString().substr(-6),
        new Date().toISOString(),
        data.teacherName || 'ไม่ระบุ',
        data.supervisorName || 'ไม่ระบุ',
        data.subject || 'ไม่ระบุ',
        '',
        '',
        'เสร็จสิ้น',
        finalScore,
        rating,
        data.strengths || '',
        data.suggestions || '',
        planUrl
      ];
      sheet.appendRow(row);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'บันทึกข้อมูลเรียบร้อยแล้ว' })).setMimeType(ContentService.MimeType.JSON);
    }
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
