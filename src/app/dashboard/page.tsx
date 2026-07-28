"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, FileText, CheckCircle, TrendingUp, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchGASData, SupervisionRecord, User } from "@/lib/api";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<SupervisionRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchGASData();
        setRecords(response.data.supervisionRecords || []);
        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
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
        <p className="text-gray-500 font-medium">กำลังโหลดข้อมูลจากฐานข้อมูล...</p>
      </div>
    );
  }

  // Calculate stats
  const totalSupervisions = records.length;
  const teachersCount = users.filter(u => u.Role.includes('Teacher') || u.Role.includes('ครู')).length;
  
  let avgScore = 0;
  if (totalSupervisions > 0) {
    const sum = records.reduce((acc, curr) => acc + (Number(curr.Total_Score) || 0), 0);
    avgScore = sum / totalSupervisions;
  }

  const completed = records.filter(r => r.Status === 'เสร็จสิ้น').length;

  const statCards = [
    { title: "ครูทั้งหมด", value: teachersCount.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "แผนการสอน", value: totalSupervisions.toString(), icon: FileText, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "นิเทศเสร็จสิ้น", value: completed.toString(), icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { title: "คะแนนเฉลี่ย", value: avgScore.toFixed(2), icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  // Group chart data by Subject
  const subjectScores: Record<string, { subject: string; sum: number; count: number }> = {};
  records.forEach(r => {
    const sub = r.Subject_Name || 'ไม่ระบุ';
    if (!subjectScores[sub]) subjectScores[sub] = { subject: sub, sum: 0, count: 0 };
    subjectScores[sub].sum += (Number(r.Total_Score) || 0);
    subjectScores[sub].count += 1;
  });

  const chartData = Object.values(subjectScores).map(item => ({
    subject: item.subject,
    score: Number((item.sum / item.count).toFixed(2))
  }));

  // Ensure there's some mock data if empty for visualization
  const displayChartData = chartData.length > 0 ? chartData : [
    { subject: "ยังไม่มีข้อมูล", score: 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ภาพรวมระบบนิเทศการสอน</h1>
          <p className="text-gray-500 mt-1">ปีการศึกษา 2567 ภาคเรียนที่ 1</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-full ${stat.bg}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">คะแนนประเมินเฉลี่ยแยกตามกลุ่มสาระวิชา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 20]} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">การประเมินล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {records.slice(-4).reverse().map((r, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {r.Teacher_Name.substring(0, 1)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-slate-800 truncate">{r.Teacher_Name}</p>
                    <p className="text-sm text-slate-500 truncate">{r.Subject_Name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{r.Total_Score} คะแนน</p>
                    <p className="text-xs text-slate-400">{new Date(r.Date_Time).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>
              ))}
              {records.length === 0 && (
                <div className="text-center py-8 text-gray-500">ยังไม่มีข้อมูลการประเมิน</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
