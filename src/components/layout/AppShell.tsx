import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Bell,
  Home,
  ShoppingCart,
  Banknote,
  ClipboardList,
  Boxes,
  Users,
  Settings,
  FileSpreadsheet,
  Receipt,
  Plus,
  LogOut,
  Bike,
} from "lucide-react";
import { can, isForUser, ROLE_LABEL, useStore, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavItem = { to: string; label: string; icon: typeof Home; key: string };

const ALL_NAV: NavItem[] = [
  { to: "/dashboard", label: "خانه", icon: Home, key: "dashboard" },
  { to: "/bicycle-purchases", label: "خریدها", icon: ShoppingCart, key: "purchases" },
  { to: "/inventory", label: "انبار", icon: Boxes, key: "inventory" },
  { to: "/expenses", label: "هزینه‌ها", icon: Banknote, key: "expenses" },
  { to: "/tasks", label: "وظایف", icon: ClipboardList, key: "tasks" },
  { to: "/notifications", label: "اعلان‌ها", icon: Bell, key: "notifications" },
];

const DESKTOP_EXTRA: NavItem[] = [
  { to: "/purchase-invoices", label: "فاکتورهای خرید", icon: Receipt, key: "invoices" },
  { to: "/exports", label: "خروجی حسابداری", icon: FileSpreadsheet, key: "exports" },
  { to: "/users", label: "مدیریت کاربران", icon: Users, key: "users" },
  { to: "/settings", label: "تنظیمات", icon: Settings, key: "settings" },
];

function navFor(role: Role) {
  if (role === "MECHANIC")
    return [
      { to: "/tasks", label: "وظایف من", icon: ClipboardList, key: "tasks" },
      { to: "/notifications", label: "اعلان‌ها", icon: Bell, key: "notifications" },
    ];
  return ALL_NAV.filter((n) => can(role, n.key));
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, state, logout } = useStore();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [fabOpen, setFabOpen] = useState(false);
  const [expenseMenu, setExpenseMenu] = useState(false);

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div className="space-y-4">
          <p className="text-muted-foreground">برای ادامه ابتدا وارد حساب خود شوید.</p>
          <Link
            to="/"
            className="inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground"
          >
            ورود به حساب
          </Link>
        </div>
      </div>
    );
  }

  const mobileNav = navFor(user.role);
  const sideNav = [...navFor(user.role), ...DESKTOP_EXTRA.filter((n) => can(user, n.key))];
  const unread = state.notifications.filter(
    (n) => !n.isRead && isForUser(n, user),
  ).length;

  const showFab = user.role !== "MECHANIC";

  const fabActions: { label: string; onClick: () => void }[] = [];
  if (user.role !== "MECHANIC")
    fabActions.push({ label: "ثبت خرید دوچرخه", onClick: () => go("/bicycle-purchases/new") });
  if (can(user, "invoices"))
    fabActions.push({ label: "ثبت پیش‌فاکتور خرید", onClick: () => go("/purchase-invoices/new") });
  if (can(user, "approve"))
    fabActions.push({ label: "ثبت وظیفه جدید", onClick: () => go("/tasks?new=1") });

  function go(to: string) {
    setFabOpen(false);
    setExpenseMenu(false);
    void navigate({ to });
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="no-print sticky top-0 hidden h-screen w-72 shrink-0 border-l bg-sidebar p-4 lg:flex lg:flex-col">
        <div className="flex items-center gap-2 px-2 py-3">
          <Bike className="size-7 text-primary" />
          <span className="text-lg font-extrabold text-primary">مدیریت تعمیرگاه</span>
        </div>
        <nav className="mt-4 flex-1 space-y-1">
          {sideNav.map((item) => {
            const active = path === item.to || path.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <item.icon className="size-5 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.key === "notifications" && unread > 0 ? (
                  <span className="ms-auto rounded-full bg-destructive px-2 text-xs font-bold text-destructive-foreground">
                    {unread}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => {
            logout();
            void navigate({ to: "/" });
          }}
          className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-destructive hover:bg-destructive/10"
        >
          <LogOut className="size-5" /> خروج از حساب
        </button>
      </aside>

      <div className="flex min-h-screen w-full min-w-0 flex-col">
        {/* Header */}
        <header className="no-print safe-top sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
            <Link to="/notifications" className="relative grid size-10 place-items-center rounded-full hover:bg-accent" aria-label="اعلان‌ها">
              <Bell className="size-5 text-primary" />
              {unread > 0 ? (
                <span className="absolute end-2 top-2 size-2 rounded-full bg-destructive" />
              ) : null}
            </Link>
            <div className="flex min-w-0 items-center justify-center gap-2">
              <Bike className="size-6 shrink-0 text-primary lg:hidden" />
              <span className="truncate text-base font-extrabold text-primary">
                مدیریت تعمیرگاه
              </span>
            </div>
            <Link to="/settings" aria-label="پروفایل" className="shrink-0">
              <Avatar className="size-10 border-2 border-primary/30">
                <AvatarFallback className="bg-accent text-sm font-bold text-accent-foreground">
                  {user.fullName.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-32 pt-5 lg:pb-12">{children}</main>

        {/* FAB */}
        {showFab ? (
          <button
            onClick={() => setFabOpen(true)}
            aria-label="ثبت مورد جدید"
            className="no-print fixed bottom-24 start-5 z-40 grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-float)] transition-transform active:scale-95 lg:bottom-8"
          >
            <Plus className="size-8" />
          </button>
        ) : null}

        <Sheet
          open={fabOpen}
          onOpenChange={(o) => {
            setFabOpen(o);
            if (!o) setExpenseMenu(false);
          }}
        >
          <SheetContent side="bottom" className="safe-bottom rounded-t-3xl">
            <SheetHeader className="text-start">
              <SheetTitle>{expenseMenu ? "دسته هزینه را انتخاب کنید" : "ثبت مورد جدید"}</SheetTitle>
            </SheetHeader>
            <div className="space-y-2 p-4">
              {expenseMenu ? (
                <>
                  {[
                    ["SALARY", "حقوق"],
                    ["BONUS", "پاداش"],
                    ["PENALTY", "جریمه"],
                    ...(can(user, "personalWithdrawal")
                      ? [["PERSONAL_WITHDRAWAL", "برداشت شخصی"]]
                      : []),
                    ["MISCELLANEOUS", "هزینه متفرقه"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => go(`/expenses/new?category=${value}`)}
                      className="w-full rounded-xl bg-secondary px-4 py-4 text-start text-sm font-bold hover:bg-accent"
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => setExpenseMenu(false)}
                    className="w-full rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground"
                  >
                    بازگشت
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setExpenseMenu(true)}
                    className="w-full rounded-xl bg-primary px-4 py-4 text-start text-sm font-bold text-primary-foreground"
                  >
                    ثبت هزینه
                  </button>
                  {fabActions.map((a) => (
                    <button
                      key={a.label}
                      onClick={a.onClick}
                      className="w-full rounded-xl bg-secondary px-4 py-4 text-start text-sm font-bold hover:bg-accent"
                    >
                      {a.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Bottom nav (mobile) */}
        <nav className="no-print safe-bottom fixed inset-x-0 bottom-0 z-30 border-t bg-card lg:hidden">
          <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
            {mobileNav.map((item) => {
              const active = path === item.to || path.startsWith(item.to + "/");
              return (
                <li key={item.to} className="flex-1">
                  <Link
                    to={item.to}
                    className={cn(
                      "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-bold",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <span className="relative">
                      <item.icon className="size-6" />
                      {item.key === "notifications" && unread > 0 ? (
                        <span className="absolute -end-1 -top-1 size-2 rounded-full bg-destructive" />
                      ) : null}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
      {ROLE_LABEL[role]}
    </span>
  );
}
