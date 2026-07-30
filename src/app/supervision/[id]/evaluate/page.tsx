"use client";

import React, { useState, useEffect } from 'react';
import { Save, Send, User, BookOpen, Calendar, Link as LinkIcon, AlertCircle, Loader2, FileText } from 'lucide-react';
import { fetchGASData, User as UserType, Category } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useParams } from 'next/navigation';

export default function EvaluatePage() {
  const params = useParams();
  const id = params.id as string;
  const isEvaluateMode = Boolean(id && id !== '1' && id !== 'new');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [strengths, setStrengths] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [scores, setScores] = useState<Record<string, string>>({});

  const [teachers, setTeachers] = useState<UserType[]>([]);
  const [supervisors, setSupervisors] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [file, setFile] = useState<File | null>(null);
  const [teacherName, setTeacherName] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [subject, setSubject] = useState("");
  const [planUrl, setPlanUrl] = useState("");

  const { user: currentUser } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchGASData();
        const users = response.data.users || [];
        const cats = response.data.categories || [];
        
        setTeachers(users.filter((u: UserType) => String(u.Role).toLowerCase().includes('teacher') || u.Role.includes('ครู')));
        
        const sups = users.filter((u: UserType) => String(u.Role).toLowerCase().includes('admin') || String(u.Role).toLowerCase().includes('supervisor') || u.Role.includes('บริหาร') || u.Role.includes('ผู้นิเทศ'));
        setSupervisors(sups);
        setCategories(cats);

        if (currentUser && sups.some(s => s.Name === currentUser.Name)) {
          setSupervisorName(currentUser.Name);
        }

        if (isEvaluateMode) {
          const records = response.data.supervisionRecords || [];
          const record = records.find((r: any) => r.Supervision_ID === id);
          if (record) {
            setTeacherName(record.Teacher_Name);
            setSubject(record.Subject_Name);
            setPlanUrl(record.Plan_URL || "");
          }
        }

        const initialScores: Record<string, string> = {};
        cats.forEach((c, idx) => {
          const safeId = c.Category_ID || `cat_${idx}`;
          initialScores[safeId] = '';
        });
        setScores(initialScores);

      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  const handleScoreChange = (categoryId: string, value: string) => {
    setScores(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleSubmit = async () => {
    if (!teacherName) {
      alert("กรุณาเลือกผู้รับการนิเทศ (ครูผู้สอน)");
      return;
    }
    if (!supervisorName) {
      alert("กรุณาเลือกผู้ประเมิน (ผู้นิเทศ)");
      return;
    }
    if (Object.values(scores).some(v => !v)) {
      alert("กรุณาให้คะแนนให้ครบทุกหมวด");
      return;
    }

    setIsSubmitting(true);
    let totalScore = 0;
    Object.values(scores).forEach(s => totalScore += parseInt(s));
    
    // Calculate 100-point scale percentage
    const maxPossibleScore = Object.keys(scores).length * 5;
    const percentageScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    const payload = {
      action: isEvaluateMode ? 'evaluate' : 'submit_plan',
      supervisionId: isEvaluateMode ? id : undefined,
      teacherName: teacherName,
      supervisorName: supervisorName,
      subject: subject,
      totalScore, // raw score (optional)
      percentageScore, // 100-point scale
      categoryScores: scores, // send individual scores
      strengths,
      suggestions
    };

    try {
      let GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || ''; 
      if (typeof window !== "undefined") {
        const savedUrl = localStorage.getItem("gasUrl");
        if (savedUrl) GAS_URL = savedUrl;
      }
      
      if (!GAS_URL) {
        alert("กรุณาตั้งค่า Google Apps Script URL ในหน้าตั้งค่าระบบก่อนส่งข้อมูล");
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
    { value: '5', label: 'ดีเยี่ยม', color: 'bg-green-500 text-white border-green-600 shadow-sm' },
    { value: '4', label: 'ดีมาก', color: 'bg-blue-500 text-white border-blue-600 shadow-sm' },
    { value: '3', label: 'ดี', color: 'bg-teal-500 text-white border-teal-600 shadow-sm' },
    { value: '2', label: 'พอใช้', color: 'bg-amber-500 text-white border-amber-600 shadow-sm' },
    { value: '1', label: 'ปรับปรุง', color: 'bg-red-500 text-white border-red-600 shadow-sm' }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-sans">
      
      <div className="bg-blue-900 p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">แบบฟอร์มบันทึกผลการนิเทศการสอน</h1>
        <p className="text-blue-100 text-sm">ระบบนิเทศการสอนออนไลน์ (Instructional Supervision System)</p>
      </div>

      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">ผู้ประเมิน (ผู้นิเทศ)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              {loading ? (
                <div className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-500 bg-white">
                  <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> กำลังโหลด...
                </div>
              ) : (
                <select 
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white font-semibold outline-none"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                >
                  <option value="">-- เลือกผู้ประเมิน --</option>
                  {supervisors.map((s, i) => (
                    <option key={i} value={s.Name}>{s.Name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">ผู้รับการนิเทศ (ครูผู้สอน)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              {loading ? (
                <div className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-500 bg-white">
                  <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> กำลังโหลด...
                </div>
              ) : (
                <select 
                  disabled={isEvaluateMode}
                  className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold outline-none ${isEvaluateMode ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                  value={teacherName}
                  onChange={(e) => {
                    setTeacherName(e.target.value);
                    const t = teachers.find(t => t.Name === e.target.value);
                    if (t) setSubject(t.Subject_Group);
                  }}
                >
                  <option value="">-- เลือกครูผู้สอน --</option>
                  {teachers.map((t, i) => (
                    <option key={i} value={t.Name}>{t.Name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">กลุ่มสาระการเรียนรู้ / รายวิชา</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <input 
                type="text" 
                value={subject}
                disabled={isEvaluateMode}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold outline-none ${isEvaluateMode ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                placeholder="อัปเดตอัตโนมัติตามชื่อครู"
              />
            </div>
          </div>
        </div>

        {planUrl && !planUrl.includes("Upload Failed") && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <a 
              href={planUrl} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <FileText className="w-4 h-4 mr-2" /> ดูไฟล์แผนการสอนที่แนบมา
            </a>
          </div>
        )}
      </div>

      <div className="p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
          เกณฑ์การให้คะแนน
        </h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">กำลังโหลดหัวข้อการประเมิน...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.filter(cat => cat.Category_ID || cat.Title).map((cat, idx) => {
              const safeId = cat.Category_ID || `cat_${idx}`;
              return (
              <div key={safeId} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-blue-300 transition-colors">
                <h3 className="font-medium text-slate-800 flex-1">{cat.Title}</h3>
                <div className="flex gap-2 flex-shrink-0">
                  {scoreOptions.map((opt) => (
                    <label key={opt.value} className={`
                      cursor-pointer flex items-center justify-center w-10 h-10 rounded-md border transition-all text-center
                      ${scores[safeId] === opt.value ? opt.color : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}
                    `} title={opt.label}>
                      <input 
                        type="radio" 
                        name={safeId} 
                        value={opt.value} 
                        className="sr-only"
                        onChange={(e) => handleScoreChange(safeId, e.target.value)}
                      />
                      <span className="font-bold">{opt.value}</span>
                    </label>
                  ))}
                </div>
              </div>
            )})}
          </div>
        )}

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

      <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-4">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-4 sm:py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center justify-center transition-colors disabled:opacity-50 text-lg sm:text-base"
        >
          <Send className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
          {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งผลการประเมิน'}
        </button>
      </div>
    </div>
  );
}
