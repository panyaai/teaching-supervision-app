"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users as UsersIcon, UserPlus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { fetchGASData, User } from "@/lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchGASData();
        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      (user.Name && user.Name.toLowerCase().includes(term)) ||
      (user.Email && user.Email.toLowerCase().includes(term)) ||
      (user.User_ID && user.User_ID.toLowerCase().includes(term)) ||
      (user.Subject_Group && user.Subject_Group.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            จัดการบุคลากร (Users)
          </h1>
          <p className="text-gray-500 mt-1">เพิ่ม แก้ไข หรือลบข้อมูลบุคลากร (ซิงก์จาก Google Sheets)</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          อัปเดตข้อมูลจากชีต
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-lg">รายชื่อบุคลากรทั้งหมด ({users.length} คน)</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="ค้นหาชื่อ, อีเมล..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">กำลังโหลดรายชื่อ...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>รหัส</TableHead>
                    <TableHead>ชื่อ - นามสกุล</TableHead>
                    <TableHead>ตำแหน่ง</TableHead>
                    <TableHead>กลุ่มสาระฯ</TableHead>
                    <TableHead>อีเมล</TableHead>
                    <TableHead>สิทธิ์ (Role)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? filteredUsers.map((user, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-slate-500">{user.User_ID}</TableCell>
                      <TableCell className="font-bold text-slate-800">{user.Name}</TableCell>
                      <TableCell>{user.Position}</TableCell>
                      <TableCell>{user.Subject_Group}</TableCell>
                      <TableCell className="text-blue-600">{user.Email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          String(user.Role).toLowerCase().includes('admin') ? 'bg-purple-100 text-purple-700' :
                          String(user.Role).toLowerCase().includes('supervisor') ? 'bg-blue-100 text-blue-700' : 
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.Role}
                        </span>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        ไม่พบข้อมูลบุคลากรที่ค้นหา
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
