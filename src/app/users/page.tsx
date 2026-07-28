"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users as UsersIcon, UserPlus, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  const users = [
    { id: 1, name: "ดร. สมเกียรติ ยอดเยี่ยม", role: "ผู้ดูแลระบบ (Admin)", email: "admin@school.ac.th" },
    { id: 2, name: "สมหญิง รักเรียน", role: "ผู้นิเทศ", email: "supervisor1@school.ac.th" },
    { id: 3, name: "ครูสมปอง ทองคำ", role: "ครูผู้สอน", email: "sompong@school.ac.th" },
    { id: 4, name: "ครูใจดี มีสุข", role: "ครูผู้สอน", email: "jaidee@school.ac.th" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            จัดการบุคลากร (Users)
          </h1>
          <p className="text-gray-500 mt-1">เพิ่ม แก้ไข หรือลบข้อมูลบุคลากรในระบบ</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          เพิ่มบุคลากรใหม่
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-lg">รายชื่อบุคลากรทั้งหมด</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="ค้นหาชื่อ, อีเมล..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>ชื่อ - นามสกุล</TableHead>
                  <TableHead>สิทธิ์การใช้งาน (Role)</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-slate-800">{user.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role.includes('Admin') ? 'bg-purple-100 text-purple-700' :
                        user.role.includes('ผู้นิเทศ') ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500">{user.email}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
