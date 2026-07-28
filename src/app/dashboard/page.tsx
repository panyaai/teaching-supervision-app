"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, AlertTriangle, FileCheck2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'วิทย์ฯ', score: 85 },
  { name: 'คณิตฯ', score: 88 },
  { name: 'ภาษาไทย', score: 92 },
  { name: 'อังกฤษ', score: 75 },
  { name: 'สังคมฯ', score: 80 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-500 mt-1">ภาพรวมการนิเทศการสอน ปีการศึกษา 2567</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              การนิเทศทั้งหมด
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">124</div>
            <p className="text-xs text-gray-500 mt-1">แผนที่ส่งทั้งหมด</p>
          </CardContent>
        </Card>

        <Card className="border-green-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              เสร็จสิ้นแล้ว
            </CardTitle>
            <FileCheck2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">85</div>
            <p className="text-xs text-green-600 mt-1">+12 จากสัปดาห์ที่แล้ว</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              รอนิเทศ
            </CardTitle>
            <ClipboardCheck className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">35</div>
            <p className="text-xs text-gray-500 mt-1">รอดำเนินการ</p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              ต้องปรับปรุง
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">4</div>
            <p className="text-xs text-red-600 mt-1">ต้องการติดตามผล</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">ผลประเมินเฉลี่ยตามกลุ่มสาระฯ</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">รายการนิเทศล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'ครูสมปอง ทองคำ', subject: 'คณิตศาสตร์พื้นฐาน', status: 'เสร็จสิ้น', date: 'วันนี้' },
                { name: 'ครูใจดี มีสุข', subject: 'ฟิสิกส์ 1', status: 'เสร็จสิ้น', date: 'วันนี้' },
                { name: 'ครูสุดา พาสุข', subject: 'ภาษาอังกฤษรอบรู้', status: 'รอนิเทศ', date: 'เมื่อวาน' },
                { name: 'ครูกล้าหาญ ชาญชัย', subject: 'ประวัติศาสตร์ไทย', status: 'รอนิเทศ', date: 'เมื่อวาน' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.subject}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {item.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
