"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchGASData, SupervisionRecord, User } from '@/lib/api';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function ReportContent() {
  const searchParams = useSearchParams();
  const teacherName = searchParams.get('teacher');
  
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [teacherInfo, setTeacherInfo] = useState<User | null>(null);
  
  useEffect(() => {
    async function loadData() {
      if (!teacherName) return;
      
      try {
        const response = await fetchGASData();
        const records = response.data.supervisionRecords || [];
        const users = response.data.users || [];
        
        const info = users.find((u: User) => u.Name === teacherName) || null;
        setTeacherInfo(info);
        
        // Filter records for this teacher
        const teacherRecords = records.filter((r: SupervisionRecord) => r.Teacher_Name === teacherName && r.Status === 'เสร็จสิ้น');
        
        if (teacherRecords.length > 0) {
          let sum = 0, count = 0, prep = 0, act = 0, media = 0, assess = 0;
          
          teacherRecords.forEach((r: SupervisionRecord) => {
            sum += (Number(r.Total_Score) || 0);
            prep += (Number(r.Score_Prep) || 0);
            act += (Number(r.Score_Activity) || 0);
            media += (Number(r.Score_Media) || 0);
            assess += (Number(r.Score_Assessment) || 0);
            count += 1;
          });
          
          setTeacherData({
            teacher: teacherName,
            score: Number((sum / count).toFixed(2)),
            evaluators: count,
            prepAvg: Number((prep / count).toFixed(2)),
            actAvg: Number((act / count).toFixed(2)),
            mediaAvg: Number((media / count).toFixed(2)),
            assessAvg: Number((assess / count).toFixed(2)),
          });
        }
      } catch (error) {
        console.error("Failed to load data for report", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [teacherName]);
  
  const handlePrint = () => {
    window.print();
  };
  
  if (!teacherName) {
    return <div className="p-8 text-center text-red-500 font-bold">กรุณาระบุชื่อครูผู้สอน</div>;
  }
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">กำลังสร้างรายงาน...</p>
      </div>
    );
  }
  
  if (!teacherData) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm max-w-2xl mx-auto mt-12 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">ไม่พบข้อมูลการประเมิน</h2>
        <p className="text-slate-500 mb-6">ยังไม่มีกรรมการท่านใดประเมิน {teacherName} เสร็จสิ้น</p>
        <Link href="/dashboard" className="inline-flex items-center text-blue-600 font-medium hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปยังแดชบอร์ด
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0 print:m-0">
      
      {/* Controls (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden px-4">
        <Link href="/dashboard" className="inline-flex items-center px-4 py-2 bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> ย้อนกลับ
        </Link>
        <button 
          onClick={handlePrint}
          className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 font-bold transition-colors"
        >
          <Printer className="w-5 h-5 mr-2" /> บันทึกเป็น PDF / พิมพ์
        </button>
      </div>
      
      {/* A4 Report Container */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none print:w-full print:max-w-none rounded-xl overflow-hidden print:rounded-none">
        
        {/* Header */}
        <div className="p-8 print:p-6 border-b-4 border-blue-900 bg-slate-50 print:bg-white">
          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-900 mb-1">รายงานสรุปผลการนิเทศการสอน</h1>
            <p className="text-base text-slate-600 font-medium">ภาคเรียนที่ 1 ปีการศึกษา 2567</p>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8 print:p-6 space-y-6 print:space-y-4">
          
          {/* Teacher Profile */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">ข้อมูลผู้รับการนิเทศ</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500 mr-2">ชื่อ-นามสกุล:</span>
                <span className="font-bold text-slate-900">{teacherData.teacher}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-2">กลุ่มสาระการเรียนรู้:</span>
                <span className="font-bold text-slate-900">{teacherInfo?.Subject_Group || 'ไม่ระบุ'}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-2">จำนวนกรรมการประเมิน:</span>
                <span className="font-bold text-slate-900">{teacherData.evaluators} ท่าน</span>
              </div>
            </div>
          </div>
          
          {/* Main Score Overview */}
          <div className="text-center py-2">
            <h2 className="text-base font-bold text-slate-700 mb-3">คะแนนประเมินเฉลี่ยรวม (100 คะแนน)</h2>
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-blue-100 bg-white shadow-inner">
              <span className="text-4xl font-black text-blue-600">{teacherData.score}</span>
            </div>
          </div>
          
          {/* Detailed Scores */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">สรุปคะแนนแยกรายด้าน</h2>
            <div className="space-y-3">
              
              {/* Prep */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="font-semibold text-slate-700 text-base">1. ด้านการเตรียมการสอน</div>
                <div className="flex items-baseline">
                  <span className="text-xl font-black text-slate-900">{teacherData.prepAvg}</span>
                  <span className="text-slate-500 ml-1 text-sm font-medium">/ 4 คะแนน</span>
                </div>
              </div>
              
              {/* Activity */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="font-semibold text-slate-700 text-base">2. ด้านการจัดกิจกรรมการเรียนรู้</div>
                <div className="flex items-baseline">
                  <span className="text-xl font-black text-slate-900">{teacherData.actAvg}</span>
                  <span className="text-slate-500 ml-1 text-sm font-medium">/ 4 คะแนน</span>
                </div>
              </div>
              
              {/* Media */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="font-semibold text-slate-700 text-base">3. ด้านการใช้สื่อและนวัตกรรม</div>
                <div className="flex items-baseline">
                  <span className="text-xl font-black text-slate-900">{teacherData.mediaAvg}</span>
                  <span className="text-slate-500 ml-1 text-sm font-medium">/ 7 คะแนน</span>
                </div>
              </div>
              
              {/* Assessment */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="font-semibold text-slate-700 text-base">4. ด้านการวัดและประเมินผล</div>
                <div className="flex items-baseline">
                  <span className="text-xl font-black text-slate-900">{teacherData.assessAvg}</span>
                  <span className="text-slate-500 ml-1 text-sm font-medium">/ 5 คะแนน</span>
                </div>
              </div>
              
            </div>
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="p-6 text-center text-xs text-slate-400 border-t border-slate-100 bg-slate-50 print:bg-white print:border-none print:pt-4">
          <p>เอกสารสรุปผลการนิเทศการสอนออนไลน์</p>
          <p>สร้างเมื่อ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
      </div>
      
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">กำลังโหลดรายงาน...</div>}>
      <ReportContent />
    </Suspense>
  );
}