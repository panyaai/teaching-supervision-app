"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PlansPage() {
  const plans = [
    { id: 1, title: "แผนการสอนคณิตศาสตร์ บทที่ 1", subject: "คณิตศาสตร์พื้นฐาน", teacher: "ครูสมปอง ทองคำ", status: "อนุมัติแล้ว", date: "10 มิ.ย. 2024" },
    { id: 2, title: "แผนการสอนวิทยาศาสตร์ ม.1", subject: "วิทยาศาสตร์พื้นฐาน", teacher: "ครูใจดี มีสุข", status: "รอตรวจสอบ", date: "12 มิ.ย. 2024" },
    { id: 3, title: "แผนการสอนประวัติศาสตร์", subject: "ประวัติศาสตร์", teacher: "ครูกล้าหาญ ชาญชัย", status: "อนุมัติแล้ว", date: "14 มิ.ย. 2024" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            แผนการสอน (Lesson Plans)
          </h1>
          <p className="text-gray-500 mt-1">จัดการและตรวจสอบแผนการจัดการเรียนรู้ของบุคลากร</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มแผนการสอนใหม่
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-lg">รายการแผนการสอนทั้งหมด</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="ค้นหาชื่อแผน, ชื่อครู..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>หัวข้อแผนการสอน</TableHead>
                  <TableHead>รายวิชา</TableHead>
                  <TableHead>ครูผู้สอน</TableHead>
                  <TableHead>วันที่ส่ง</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.title}</TableCell>
                    <TableCell>{plan.subject}</TableCell>
                    <TableCell>{plan.teacher}</TableCell>
                    <TableCell>{plan.date}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        plan.status === 'อนุมัติแล้ว' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {plan.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                        <Eye className="w-4 h-4 mr-1" />
                        ดูรายละเอียด
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
