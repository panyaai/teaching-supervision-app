"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search, Eye, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { fetchGASData, SupervisionRecord } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function PlansPage() {
  const [plans, setPlans] = useState<SupervisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchGASData();
        let fetchedRecords = response.data.supervisionRecords || [];
        
        const isTeacher = user?.Role.toLowerCase().includes('teacher') || user?.Role.includes('ครู');
        if (isTeacher && user) {
          fetchedRecords = fetchedRecords.filter((r: SupervisionRecord) => r.Teacher_Name === user.Name);
        }

        setPlans(fetchedRecords);
      } catch (error) {
        console.error("Failed to load plans", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            ประวัติการนิเทศ (Supervision Records)
          </h1>
          <p className="text-gray-500 mt-1">รายการผลการนิเทศการสอนทั้งหมด (ดึงข้อมูลจาก Google Sheets)</p>
        </div>
        
        {user && !(user?.Role.toLowerCase().includes('teacher') || user?.Role.includes('ครู')) && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            สร้างแบบประเมินใหม่
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-lg">รายการทั้งหมด ({plans.length} รายการ)</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="ค้นหาชื่อครู, รายวิชา..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex flex-col items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>รหัส</TableHead>
                    <TableHead>ครูผู้สอน</TableHead>
                    <TableHead>รายวิชา</TableHead>
                    <TableHead>วันที่นิเทศ</TableHead>
                    <TableHead>คะแนน</TableHead>
                    <TableHead>ระดับ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.length > 0 ? plans.reverse().map((plan, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-slate-500">{plan.Supervision_ID}</TableCell>
                      <TableCell className="font-bold text-slate-800">{plan.Teacher_Name}</TableCell>
                      <TableCell>{plan.Subject_Name}</TableCell>
                      <TableCell>{new Date(plan.Date_Time).toLocaleDateString('th-TH')}</TableCell>
                      <TableCell className="font-bold text-blue-600">{plan.Total_Score}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          plan.Rating_Level === 'ดีเยี่ยม' ? 'bg-green-100 text-green-700' :
                          plan.Rating_Level === 'ดีมาก' ? 'bg-blue-100 text-blue-700' :
                          plan.Rating_Level === 'ดี' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {plan.Rating_Level}
                        </span>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        ยังไม่มีข้อมูลการนิเทศในระบบ
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
