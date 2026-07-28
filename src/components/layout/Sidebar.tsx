import Link from 'next/link';
import { LayoutDashboard, FileText, ClipboardCheck, Users, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: 'แดชบอร์ด', href: '/dashboard' },
    { icon: FileText, label: 'แผนการสอน', href: '/plans' },
    { icon: ClipboardCheck, label: 'ประเมินการสอน', href: '/supervision/1/evaluate' },
    { icon: Users, label: 'บุคลากร', href: '/users' },
    { icon: Settings, label: 'ตั้งค่าระบบ', href: '/settings' },
  ];

  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen flex flex-col hidden md:flex">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-blue-300" />
          ระบบนิเทศการสอน
        </h1>
      </div>
      <nav className="flex-1 mt-6">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link 
              key={index} 
              href={item.href}
              className="flex items-center gap-3 px-6 py-3 hover:bg-blue-800 transition-colors border-l-4 border-transparent hover:border-blue-300"
            >
              <Icon className="w-5 h-5 text-blue-300" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-blue-800">
        <button className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-300 hover:bg-blue-800 rounded transition-colors">
          <LogOut className="w-5 h-5" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
