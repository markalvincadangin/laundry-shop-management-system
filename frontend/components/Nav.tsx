"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const STAFF_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/orders", label: "Orders" },
  { href: "/orders/new", label: "New Order" },
  { href: "/customers", label: "Customers" },
  { href: "/notifications", label: "Notifications" },
  { href: "/track", label: "Track" },
];

function NavLink({
  href,
  label,
  isActive,
  className = "",
}: {
  href: string;
  label: string;
  isActive: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-sm font-medium min-h-[44px] flex items-center sm:min-h-0 ${
        isActive
          ? "bg-primary-100 text-primary-700 border-l-4 border-primary-500 sm:border-l-0 sm:bg-primary-50"
          : "text-neutral-text-secondary hover:bg-slate-100 hover:text-neutral-text-primary"
      } ${className}`}
    >
      {label}
    </Link>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-6 flex-col justify-center" aria-hidden>
      <span
        className={`block h-0.5 w-full rounded-full bg-current transition-all duration-200 ${
          open ? "translate-y-[5px] rotate-45" : ""
        }`}
      />
      <span
        className={`mt-1 block h-0.5 w-full rounded-full bg-current transition-all duration-200 ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`mt-1 block h-0.5 w-full rounded-full bg-current transition-all duration-200 ${
          open ? "-translate-y-[6px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

export function Nav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    ...STAFF_LINKS,
    ...(user?.role === "OWNER" ? [{ href: "/payments", label: "Payments" }] : []),
    ...(user?.role === "OWNER" ? [{ href: "/reports", label: "Reports" }] : []),
    ...(user?.role === "OWNER" ? [{ href: "/rates", label: "Rates" }] : []),
  ].filter(
    (v, i, a) => a.findIndex((x) => x.href === v.href) === i
  ) as { href: string; label: string }[];

  const isPublic = pathname === "/track" || pathname === "/login";

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-neutral-border bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            <Link
              href={user ? "/" : "/track"}
              className="text-lg font-semibold text-neutral-text-primary hover:text-primary-600 transition-colors"
            >
              Faith Laundry
            </Link>

            {!loading &&
              (user ? (
                <>
                  {/* Desktop nav */}
                  <div className="hidden flex-1 items-center gap-1 md:flex">
                    {navLinks.map((item) => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        isActive={
                          pathname === item.href ||
                          (item.href !== "/" && pathname?.startsWith(item.href))
                        }
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden text-sm text-neutral-text-secondary sm:inline">
                      {user.username}
                      <span className="ml-1 rounded bg-primary-50 px-1.5 py-0.5 text-xs font-medium text-primary-700">
                        {user.role}
                      </span>
                    </span>
                    <button
                      onClick={() => logout()}
                      className="hidden rounded-md px-3 py-2 text-sm font-medium text-neutral-text-secondary hover:bg-slate-100 hover:text-neutral-text-primary md:block"
                    >
                      Logout
                    </button>

                    {/* Mobile hamburger */}
                    <div className="flex items-center gap-2 md:hidden">
                      <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-text-primary hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                      >
                        <HamburgerIcon open={menuOpen} />
                      </button>

                      {/* Mobile menu: backdrop + slide panel */}
                      {menuOpen && (
                        <div
                          id="mobile-menu"
                          className="fixed inset-0 top-14 z-50 md:hidden"
                          role="dialog"
                          aria-modal="true"
                          aria-label="Navigation menu"
                        >
                          <div
                            className="absolute inset-0 bg-black/30"
                            aria-hidden
                            onClick={() => setMenuOpen(false)}
                          />
                          <div className="absolute right-0 top-0 bottom-0 w-72 max-w-[85vw] flex flex-col border-l border-neutral-border bg-white shadow-xl">
                            {navLinks.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className={`min-h-[48px] border-b border-neutral-border px-4 py-3 text-base font-medium ${
                                  pathname === item.href ||
                                  (item.href !== "/" && pathname?.startsWith(item.href))
                                    ? "bg-primary-50 text-primary-700 border-l-4 border-l-primary-500"
                                    : "text-neutral-text-primary hover:bg-slate-50"
                                }`}
                              >
                                {item.label}
                              </Link>
                            ))}
                            <button
                              onClick={() => {
                                setMenuOpen(false);
                                logout();
                              }}
                              className="mt-auto min-h-[48px] border-t border-neutral-border px-4 py-3 text-left text-base font-medium text-neutral-text-secondary hover:bg-slate-50"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 min-h-[44px] flex items-center sm:min-h-0 transition-colors"
                >
                  Sign In
                </Link>
              ))}
          </div>
        </div>
      </nav>
    </>
  );
}
