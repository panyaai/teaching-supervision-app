"use client";

import { Bell, UserCircle, Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center md:hidden">
        <button className="text-gray-500 hover:text-gray-700">
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-4 font-bold text-blue-900">ระบบนิเทศ</span>
      </div>
      
      <div className="hidden md:flex items-center text-sm text-gray-500">
        <span>ปีการศึกษา 2567 / ภาคเรียนที่ 1</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-gray-400 hover:text-gray-600">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
          <UserCircle className="w-8 h-8 text-blue-600" />
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-gray-700">{user?.Name || 'กำลังโหลด...'}</p>
            <div className="flex items-center justify-between gap-4 mt-0.5">
              <p className="text-xs text-gray-500">{user?.Role || '-'}</p>
              <button 
                onClick={logout}
                className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center"
              >
                <LogOut className="w-3 h-3 mr-1" />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
