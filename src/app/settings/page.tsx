"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Save, Database, Bell, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [gasUrl, setGasUrl] = useState("");
  const [year, setYear] = useState("2569");
  const [term, setTerm] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Load saved settings from local storage
    const savedGasUrl = localStorage.getItem("gasUrl") || process.env.NEXT_PUBLIC_GAS_URL || "";
    const savedYear = localStorage.getItem("academicYear") || "2569";
    const savedTerm = localStorage.getItem("academicTerm") || "1";

    setGasUrl(savedGasUrl);
    setYear(savedYear);
    setTerm(savedTerm);
    setMounted(true);
  }, []);

  const handleSaveGAS = () => {
    setIsSaving(true);
    localStorage.setItem("gasUrl", gasUrl);
    setTimeout(() => {
      setIsSaving(false);
      alert("บันทึก Google Apps Script URL เรียบร้อยแล้ว (การตั้งค่านี้จะเก็บไว้ในเครื่องของคุณ)");
    }, 500);
  };

  const handleSaveAcademic = () => {
    setIsSaving(true);
    localStorage.setItem("academicYear", year);
    localStorage.setItem("academicTerm", term);
    
    // Dispatch a custom event to update header automatically if we want
    window.dispatchEvent(new Event('academicSettingsChanged'));
    
    setTimeout(() => {
      setIsSaving(false);
      alert("บันทึกปีการศึกษาเรียบร้อยแล้ว");
    }, 500);
  };

  if (!mounted) return null;

  const isAdmin = user?.Role.toLowerCase().includes('admin');

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-gray-500 font-medium">เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถตั้งค่าระบบได้</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          ตั้งค่าระบบ (Settings)
        </h1>
        <p className="text-gray-500 mt-1">กำหนดค่าเริ่มต้นและการเชื่อมต่อต่างๆ ของระบบนิเทศการสอน</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar Nav (Mock) */}
        <div className="flex flex-col gap-2">
          <Button variant="secondary" className="justify-start bg-blue-50 text-blue-700 hover:bg-blue-100">
            <Database className="w-4 h-4 mr-2" />
            เชื่อมต่อฐานข้อมูล (Database)
          </Button>
          <Button variant="ghost" className="justify-start text-slate-600 hover:text-slate-900">
            <Bell className="w-4 h-4 mr-2" />
            การแจ้งเตือน (Notifications)
          </Button>
          <Button variant="ghost" className="justify-start text-slate-600 hover:text-slate-900">
            <Shield className="w-4 h-4 mr-2" />
            ความปลอดภัย (Security)
          </Button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>เชื่อมต่อ Google Sheets API</CardTitle>
              <CardDescription>ตั้งค่า Web App URL ที่ได้จาก Google Apps Script (หากคุณสร้าง Deploy ใหม่แล้วได้ลิงก์ใหม่ ให้นำมาเปลี่ยนที่นี่)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gas-url">Google Apps Script Web App URL</Label>
                <Input 
                  id="gas-url" 
                  value={gasUrl}
                  onChange={(e) => setGasUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec" 
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleSaveGAS} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  บันทึก URL
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่าปีการศึกษาปัจจุบัน</CardTitle>
              <CardDescription>ข้อมูลนี้จะแสดงที่แถบด้านบนของทุกหน้า และใช้เป็นข้อมูลอ้างอิง</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">ปีการศึกษา</Label>
                  <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">ภาคเรียนที่</Label>
                  <Input id="term" value={term} onChange={(e) => setTerm(e.target.value)} />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={handleSaveAcademic} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  บันทึกปีการศึกษา
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
