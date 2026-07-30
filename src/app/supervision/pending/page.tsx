"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchGASData, SupervisionRecord } from "@/lib/api";
import { ClipboardCheck, Loader2, Calendar, User, FileText, ArrowRight, Search } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Input } from "@/components/ui/input";

export default function PendingSupervisionPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<SupervisionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchGASData();
        const allRecords = response.data.supervisionRecords || [];
        
        // Filter only pending records
        let pending = allRecords.filter((r: SupervisionRecord) => r.Status === 'รอรับการนิเทศ');
        
        // Find all evaluations completed by the current user
        const myEvaluations = allRecords.filter(
          (r: SupervisionRecord) => r.Status === "เสร็จสิ้น" && r.Supervisor_Name === user?.Name
        );

        // Filter out pending items if the current user has already evaluated that specific teacher+subject
        if (user && !user.Role.includes('Teacher') && !user.Role.includes('ครู')) {
          pending = pending.filter((p: SupervisionRecord) => {
            const alreadyEvaluated = myEvaluations.some(
              (e: SupervisionRecord) => e.Teacher_Name === p.Teacher_Name && e.Subject_Name === p.Subject_Name
            );
            return !alreadyEvaluated;
          });
        }

        setRecords(pending.reverse()); // Show newest first
      } catch (error) {
        console.error("Failed to load pending plans", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">กำลังโหลดรายการรอประเมิน...</p>
      </div>
    );
  }

  // Double check role
  const isSupervisor = user?.Role.toLowerCase().includes('admin') || user?.Role.toLowerCase().includes('supervisor') || user?.Role.includes('ผู้นิเทศ') || user?.Role.includes('บริหาร');

  if (!isSupervisor) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-red-500 font-medium">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-blue-600" />
            นิเทศการสอน
          </h1>
          <p className="text-gray-500 mt-1">รายชื่อคำขอที่ส่งเข้ามาและกำลังรอการนิเทศจากกรรมการ</p>
        </div>
        
        {isSupervisor && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="ระบุชื่อครูเพื่อค้นหา..." 
              className="pl-9 border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {(() => {
          const filteredRecords = records.filter(record => 
            record.Teacher_Name?.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (filteredRecords.length === 0) {
            return (
              <Card className="border-dashed bg-slate-50 border-2">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ClipboardCheck className="w-16 h-16 text-slate-300 mb-4" />
                  <p className="text-lg font-medium text-slate-500">
                    {searchTerm ? "ไม่พบรายชื่อครูที่ค้นหา" : "ไม่มีคำขอที่รอการประเมินในขณะนี้"}
                  </p>
                </CardContent>
              </Card>
            );
          }

          return filteredRecords.map((record, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{record.Teacher_Name}</h3>
                      <p className="text-blue-600 font-medium text-sm flex items-center gap-1 mt-1">
                        <FileText className="w-4 h-4" /> {record.Subject_Name}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> ส่งเมื่อ: {new Date(record.Date_Time).toLocaleDateString('th-TH')}
                        </span>
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          {record.Status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:items-end">
                    {record.Plan_URL && !record.Plan_URL.includes("Upload Failed") && (
                      <a 
                        href={record.Plan_URL} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" /> ดูไฟล์ที่แนบมา
                      </a>
                    )}
                    <Link href={`/supervision/evaluate?id=${record.Supervision_ID}`}>
                      <Button className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
                        เริ่มประเมิน <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ));
        })()}
      </div>
    </div>
  );
}
