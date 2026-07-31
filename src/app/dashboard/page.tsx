"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, FileText, CheckCircle, TrendingUp, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchGASData, SupervisionRecord, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<SupervisionRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const { user } = useAuth();
  
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchGASData();
        let fetchedRecords = response.data.supervisionRecords || [];
        
        // Filter records for Teacher role
        const isTeacher = user?.Role.toLowerCase().includes('teacher') || user?.Role.includes('ครู');
        if (isTeacher && user) {
          fetchedRecords = fetchedRecords.filter((r: SupervisionRecord) => r.Teacher_Name === user.Name);
        }
        
        setRecords(fetchedRecords);
        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [user]);

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
    { title: "รายการขอรับการนิเทศ", value: totalSupervisions.toString(), icon: FileText, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "นิเทศเสร็จสิ้น", value: completed.toString(), icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { title: "คะแนนเฉลี่ย", value: avgScore.toFixed(2), icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  // Group chart data by Teacher
  const teacherScores: Record<string, { teacher: string; sum: number; count: number; prep: number; act: number; media: number; assess: number }> = {};
  records.forEach(r => {
    if (r.Status !== 'เสร็จสิ้น') return;
    
    const t = r.Teacher_Name || 'ไม่ระบุ';
    if (!teacherScores[t]) {
      teacherScores[t] = { teacher: t, sum: 0, count: 0, prep: 0, act: 0, media: 0, assess: 0 };
    }
    teacherScores[t].sum += (Number(r.Total_Score) || 0);
    teacherScores[t].prep += (Number(r.Score_Prep) || 0);
    teacherScores[t].act += (Number(r.Score_Activity) || 0);
    teacherScores[t].media += (Number(r.Score_Media) || 0);
    teacherScores[t].assess += (Number(r.Score_Assessment) || 0);
    teacherScores[t].count += 1;
  });

  const teacherData = Object.values(teacherScores).map(item => ({
    teacher: item.teacher,
    score: Number((item.sum / item.count).toFixed(2)),
    evaluators: item.count,
    prepAvg: Number((item.prep / item.count).toFixed(2)),
    actAvg: Number((item.act / item.count).toFixed(2)),
    mediaAvg: Number((item.media / item.count).toFixed(2)),
    assessAvg: Number((item.assess / item.count).toFixed(2)),
  }));

  const displayChartData = teacherData.length > 0 ? teacherData : [
    { teacher: "ยังไม่มีข้อมูล", score: 0 }
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
        <Card className="lg:col-span-3 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">สรุปคะแนนประเมินแยกตามรายบุคคล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">ชื่อครูผู้สอน</th>
                    <th className="py-3 px-4 text-center">จำนวนผู้ประเมิน</th>
                    <th className="py-3 px-4 text-center">คะแนนเฉลี่ยรวม</th>
                    <th className="py-3 px-4 text-center">เตรียมการสอน (เต็ม 4)</th>
                    <th className="py-3 px-4 text-center">จัดกิจกรรม (เต็ม 4)</th>
                    <th className="py-3 px-4 text-center">สื่อ/นวัตกรรม (เต็ม 7)</th>
                    <th className="py-3 px-4 text-center">วัด/ประเมินผล (เต็ม 5)</th>
                    <th className="py-3 px-4 text-center">รายงาน PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teacherData.length > 0 ? teacherData.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">{t.teacher}</td>
                      <td className="py-3 px-4 text-center">{t.evaluators} คน</td>
                      <td className="py-3 px-4 text-center font-bold text-blue-600">{t.score}</td>
                      <td className="py-3 px-4 text-center text-slate-600">{t.prepAvg}</td>
                      <td className="py-3 px-4 text-center text-slate-600">{t.actAvg}</td>
                      <td className="py-3 px-4 text-center text-slate-600">{t.mediaAvg}</td>
                      <td className="py-3 px-4 text-center text-slate-600">{t.assessAvg}</td>
                      <td className="py-3 px-4 text-center">
                        <Link 
                          href={`/report?teacher=${encodeURIComponent(t.teacher)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="พิมพ์รายงาน PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">ยังไม่มีข้อมูลการประเมินที่เสร็จสิ้น</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">แผนภูมิเปรียบเทียบคะแนนเฉลี่ยรายบุคคล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="teacher" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" name="คะแนนรวมเฉลี่ย" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
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
              {records.filter(r => r.Status === 'เสร็จสิ้น').slice(-4).reverse().map((r, i) => (
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
              {records.filter(r => r.Status === 'เสร็จสิ้น').length === 0 && (
                <div className="text-center py-8 text-gray-500">ยังไม่มีข้อมูลการประเมินที่เสร็จสิ้น</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
