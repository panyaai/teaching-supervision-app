"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!userId.trim()) {
      setError("กรุณากรอกรหัสประจำตัว (User_ID)");
      return;
    }

    setIsSubmitting(true);
    const result = await login(userId.trim());
    
    if (result?.error && result.error.includes("GAS_URL")) {
      setError("ยังไม่ได้ตั้งค่าฐานข้อมูล กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่า GAS_URL");
      setIsSubmitting(false);
    } else if (!result?.success) {
      setError("ไม่พบรหัสประจำตัวนี้ในระบบ หรือคุณไม่มีสิทธิ์เข้าถึง");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4 absolute inset-0 z-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mb-4 shadow-lg border border-white/30 overflow-hidden p-1">
            <img src="https://cdn.jsdelivr.net/gh/panyaai/ctt/ctt.png" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md">ระบบนิเทศการสอนออนไลน์</h1>
          <p className="text-blue-100 mt-2 font-medium">กรุณาเข้าสู่ระบบด้วยรหัสประจำตัวของคุณ</p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle>เข้าสู่ระบบ (Login)</CardTitle>
            <CardDescription>
              ใช้รหัสประจำตัว (User_ID) เช่น U001, U002
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="เช่น U001"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-slate-200 focus:bg-white uppercase"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex flex-col gap-2">
                  <span>{error}</span>
                  {error.includes("ฐานข้อมูล") && (
                    <a href="/settings" className="text-blue-600 font-semibold underline text-center block mt-1">
                      คลิกที่นี่เพื่อไปหน้าตั้งค่าระบบ
                    </a>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    กำลังตรวจสอบ...
                  </>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-blue-200/70 mt-8 font-medium tracking-wide">
          © 2024 Instructional Supervision System
        </p>
      </div>
    </div>
  );
}
