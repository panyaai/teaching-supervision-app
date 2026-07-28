"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Save, Database, Bell, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
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
              <CardDescription>ตั้งค่า Web App URL ที่ได้จาก Google Apps Script เพื่อให้ระบบส่งข้อมูลไปบันทึกได้</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gas-url">Google Apps Script Web App URL</Label>
                <Input 
                  id="gas-url" 
                  defaultValue={process.env.NEXT_PUBLIC_GAS_URL}
                  placeholder="https://script.google.com/macros/s/.../exec" 
                />
                <p className="text-xs text-gray-500 mt-1">URL ปัจจุบันถูกดึงมาจาก .env.local โดยอัตโนมัติ</p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกการตั้งค่า
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่าปีการศึกษาปัจจุบัน</CardTitle>
              <CardDescription>ข้อมูลนี้จะแสดงที่แถบด้านบนของทุกหน้า และใช้สำหรับบันทึกการประเมิน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">ปีการศึกษา</Label>
                  <Input id="year" defaultValue="2567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">ภาคเรียนที่</Label>
                  <Input id="term" defaultValue="1" />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
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
