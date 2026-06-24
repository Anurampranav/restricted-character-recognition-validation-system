import { NavLink } from "react-router-dom";
import { Database, FileSearch, History, LayoutDashboard } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/validator", label: "Validator", icon: FileSearch },
  { to: "/history", label: "History", icon: History },
  { to: "/allowed", label: "Allowed Dataset", icon: Database },
];

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-950">Restricted Character Recognition</h1>
          <p className="mt-1 text-sm text-slate-600">Validation system for predefined numeric and alphabetic characters.</p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  [
                    "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
                  ].join(" ")
                }
              >
                <Icon size={16} aria-hidden="true" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
