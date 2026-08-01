"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search, Eye, Loader2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { fetchGASData, SupervisionRecord } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function PlansPage() {
  const [plans, setPlans] = useState<SupervisionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
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
        

        

      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-lg">รายการทั้งหมด</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="ระบุชื่อครู หรือ รายวิชา..." 
                className="pl-9 border-blue-200 focus:border-blue-500 focus:ring-blue-500" 
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
                    <TableHead className="text-right">รายละเอียด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const filteredPlans = plans.filter(plan => 
                      (plan.Teacher_Name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                      (plan.Subject_Name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                    );
                    
                    return filteredPlans.length > 0 ? filteredPlans.reverse().map((plan, i) => (
                    <React.Fragment key={plan.Supervision_ID || i}>
                      <TableRow className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === plan.Supervision_ID ? null : plan.Supervision_ID)}>
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
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                            <Eye className="w-4 h-4 mr-1" /> ดูความเห็น
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedRow === plan.Supervision_ID && (
                        <TableRow className="bg-blue-50/50">
                          <TableCell colSpan={7} className="p-0 border-b-2 border-blue-100">
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                                    <FileText className="w-4 h-4 mr-2" /> จุดเด่นของการสอน
                                  </h4>
                                  <p className="text-slate-600 text-sm whitespace-pre-wrap">{plan.Strengths || '-'}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                                  <h4 className="font-semibold text-amber-600 mb-2 flex items-center">
                                    <FileText className="w-4 h-4 mr-2" /> ข้อเสนอแนะเพื่อการพัฒนา
                                  </h4>
                                  <p className="text-slate-600 text-sm whitespace-pre-wrap">{plan.Suggestions || '-'}</p>
                                </div>
                              </div>
                              
                              {/* Attached File Section */}
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                  <h4 className="font-semibold text-slate-800 mb-1 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-blue-600" /> ไฟล์แผนการสอนที่แนบ
                                  </h4>
                                  <p className="text-slate-500 text-sm">ตรวจสอบไฟล์แผนการสอนที่ถูกแนบมาในคำขอนี้</p>
                                </div>
                                {plan.Plan_URL && plan.Plan_URL.startsWith('http') ? (
                                  <a href={plan.Plan_URL} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm whitespace-nowrap">
                                    <Eye className="w-4 h-4 mr-2" /> ตรวจสอบไฟล์ที่อัปโหลด
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm border border-slate-200">
                                    ไม่มีไฟล์แนบ
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchTerm ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีข้อมูลการนิเทศในระบบ"}
                      </TableCell>
                    </TableRow>
                  )
                  })()}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
