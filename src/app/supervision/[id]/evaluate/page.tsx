"use client";

import React, { useState } from 'react';
import { Save, Send, User, BookOpen, Calendar, Link as LinkIcon, AlertCircle } from 'lucide-react';

export default function EvaluatePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [strengths, setStrengths] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [scores, setScores] = useState<Record<string, string>>({
    preparation: '',
    activity: '',
    media: '',
    assessment: ''
  });

  const handleScoreChange = (category: string, value: string) => {
    setScores(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    // Add validation
    if (Object.values(scores).some(v => !v)) {
      alert("กรุณาให้คะแนนให้ครบทุกหมวด");
      return;
    }

    setIsSubmitting(true);
    let totalScore = 0;
    Object.values(scores).forEach(s => totalScore += parseInt(s));

    const payload = {
      teacherName: 'ครูสมปอง ทองคำ',
      supervisorName: 'สมหญิง รักเรียน',
      subject: 'คณิตศาสตร์พื้นฐาน (ค31101)',
      totalScore,
      strengths,
      suggestions,
      planUrl: 'https://drive.google.com/file/d/mock123'
    };

    try {
      // TODO: Replace with actual Google Apps Script Web App URL after deployment
      const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || ''; 
      if (!GAS_URL) {
        alert("กรุณาตั้งค่า NEXT_PUBLIC_GAS_URL ก่อนส่งข้อมูล");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });
      
      alert("บันทึกข้อมูลผลการนิเทศเรียบร้อยแล้ว");
      
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scoreOptions = [
    { value: '5', label: 'ดีเยี่ยม', color: 'bg-green-100 text-green-700 border-green-300' },
    { value: '4', label: 'ดีมาก', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: '3', label: 'ดี', color: 'bg-teal-100 text-teal-700 border-teal-300' },
    { value: '2', label: 'พอใช้', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { value: '1', label: 'ปรับปรุง', color: 'bg-red-100 text-red-700 border-red-300' }
  ];

  const categories = [
    { id: 'preparation', title: '1. การเตรียมการสอน' },
    { id: 'activity', title: '2. การจัดกิจกรรมการเรียนรู้' },
    { id: 'media', title: '3. การใช้สื่อและนวัตกรรม' },
    { id: 'assessment', title: '4. การวัดและประเมินผล' }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-sans">
      
      {/* Header Section */}
      <div className="bg-blue-900 p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">แบบฟอร์มบันทึกผลการนิเทศการสอน</h1>
        <p className="text-blue-100 text-sm">ระบบนิเทศการสอนออนไลน์ (Instructional Supervision System)</p>
      </div>

      {/* Info Section */}
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center text-slate-700">
            <User className="w-5 h-5 mr-3 text-blue-600" />
            <div>
              <span className="block text-xs text-slate-500">ผู้รับการนิเทศ</span>
              <span className="font-semibold">ครูสมปอง ทองคำ</span>
            </div>
          </div>
          <div className="flex items-center text-slate-700">
            <BookOpen className="w-5 h-5 mr-3 text-blue-600" />
            <div>
              <span className="block text-xs text-slate-500">วิชาที่สอน</span>
              <span className="font-semibold">คณิตศาสตร์พื้นฐาน (ค31101) ม.4</span>
            </div>
          </div>
          <div className="flex items-center text-slate-700">
            <Calendar className="w-5 h-5 mr-3 text-blue-600" />
            <div>
              <span className="block text-xs text-slate-500">วันที่ประเมิน</span>
              <span className="font-semibold">15 มิถุนายน 2024</span>
            </div>
          </div>
          <div className="flex items-center text-slate-700">
            <LinkIcon className="w-5 h-5 mr-3 text-blue-600" />
            <div>
              <span className="block text-xs text-slate-500">เอกสารประกอบ</span>
              <a href="#" className="font-semibold text-blue-600 hover:underline">ดูแผนการสอน (PDF)</a>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation Section */}
      <div className="p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
          เกณฑ์การให้คะแนน
        </h2>
        
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-slate-800 mb-4">{cat.title}</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {scoreOptions.map((opt) => (
                  <label key={opt.value} className={`
                    cursor-pointer flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                    ${scores[cat.id] === opt.value ? opt.color : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'}
                  `}>
                    <input 
                      type="radio" 
                      name={cat.id} 
                      value={opt.value} 
                      className="sr-only"
                      onChange={(e) => handleScoreChange(cat.id, e.target.value)}
                    />
                    <span className="font-bold text-lg mb-1">{opt.value}</span>
                    <span className="text-xs">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Section */}
        <div className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">จุดเด่นของการสอน (Strengths)</label>
            <textarea 
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none bg-slate-50"
              rows={3}
              placeholder="ระบุจุดเด่นที่พบจากการสังเกตการสอน..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">ข้อเสนอแนะ / สิ่งที่ควรพัฒนา (Suggestions)</label>
            <textarea 
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none bg-slate-50"
              rows={3}
              placeholder="ระบุข้อเสนอแนะเพื่อการพัฒนา..."
            ></textarea>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-4">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งผลการประเมิน'}
        </button>
      </div>
    </div>
  );
}
