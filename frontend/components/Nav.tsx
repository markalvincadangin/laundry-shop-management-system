"use client";

import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/orders", label: "Orders" },
  { href: "/orders/new", label: "New Order" },
  { href: "/track", label: "Track" },
  { href: "/reports", label: "Daily Report" },
];

export function Nav() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-4">
          <Link
            href="/"
            className="text-lg font-semibold text-slate-800 hover:text-slate-600"
          >
            Faith Laundry
          </Link>
          <div className="flex flex-1 gap-1">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
