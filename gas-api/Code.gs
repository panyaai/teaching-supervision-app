function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
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
