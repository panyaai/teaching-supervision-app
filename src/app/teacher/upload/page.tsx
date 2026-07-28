"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, BookOpen, Loader2 } from 'lucide-react';
import { fetchGASData } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function TeacherUploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) {
      alert("กรุณากรอกรายวิชา");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        action: 'submit_plan',
        teacherName: user?.Name || '',
        subject: subject
      };

      let GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || ''; 
      if (typeof window !== "undefined") {
        const savedUrl = localStorage.getItem("gasUrl");
        if (savedUrl) GAS_URL = savedUrl;
      }
      
      if (!GAS_URL) {
        alert("เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า Google Apps Script URL");
        setIsSubmitting(false);
        return;
      }

      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });
      
      alert("ส่งคำขอรับการนิเทศเรียบร้อยแล้ว สถานะ: รอรับการนิเทศ");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          ส่งคำขอรับการนิเทศ
        </h1>
        <p className="text-gray-500 mt-1">แจ้งรายวิชาที่คุณสอน เพื่อให้กรรมการเข้ามาประเมิน</p>
      </div>

      <Card className="shadow-md border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle>ฟอร์มส่งคำขอ</CardTitle>
          <CardDescription>ระบุรายวิชาที่คุณต้องการให้กรรมการประเมิน</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้สอน</label>
              <input 
                type="text" 
                value={user.Name} 
                disabled 
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รายวิชา / กลุ่มสาระ</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="เช่น คณิตศาสตร์ ม.1"
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> กำลังส่งข้อมูล...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> ส่งแผนการสอน
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
