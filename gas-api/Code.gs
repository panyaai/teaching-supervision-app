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

    let rating = 'ปรับปรุง';
    if (data.totalScore >= 18) rating = 'ดีเยี่ยม';
    else if (data.totalScore >= 14) rating = 'ดีมาก';
    else if (data.totalScore >= 10) rating = 'ดี';
    else if (data.totalScore >= 6) rating = 'พอใช้';

    const row = [
      'SUP' + new Date().getTime().toString().substr(-6),
      new Date().toISOString(),
      data.teacherName || 'ไม่ระบุ',
      data.supervisorName || 'ไม่ระบุ',
      data.subject || 'ไม่ระบุ',
      '',
      '',
      'เสร็จสิ้น',
      data.totalScore,
      rating,
      data.strengths || '',
      data.suggestions || '',
      data.planUrl || ''
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'บันทึกข้อมูลเรียบร้อยแล้ว' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
