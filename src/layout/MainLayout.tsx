import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";

export const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-72 h-screen flex-shrink-0 z-20">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="absolute left-0 top-0 bottom-0 w-72 z-50 animate-slide-in">
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-10 flex-shrink-0">
          <span className="font-heading font-bold text-lg text-primary">
            PetCareX
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth bg-gray-50">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
