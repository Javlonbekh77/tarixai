"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MessagesSquare, Users, User, LayoutDashboard, BrainCircuit, Settings } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Bosh sahifa", icon: LayoutDashboard },
    { href: "/darsliklar", label: "Darsliklar", icon: BookOpen },
    { href: "/interviews", label: "Interviews", icon: Users },
    { href: "/questions", label: "Questions", icon: BrainCircuit },
    { href: "/threads", label: "Threads", icon: MessagesSquare },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                TA
              </div>
              <span className="font-bold text-xl text-slate-900">Tarixchi AI</span>
            </Link>
          </div>
          <div className="hidden sm:flex sm:space-x-8 items-center">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (pathname.startsWith("/darsliklar") && link.href === "/darsliklar");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 px-1 pt-1 text-sm font-medium border-b-2 h-full ${
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
