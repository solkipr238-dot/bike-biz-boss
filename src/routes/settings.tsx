import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bell, Coins, LogOut, Settings as SettingsIcon, TableProperties } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, PageHeader } from "@/components/ui-kit";
import { ROLE_LABEL, can, useStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "تنظیمات سامانه | مدیریت تعمیرگاه" },
      { name: "description", content: "تنظیم واحد پول، اعلان‌ها و نگاشت ستون‌های خروجی حسابداری." },
      { property: "og:title", content: "تنظیمات سامانه تعمیرگاه دوچرخه" },
      { property: "og:description", content: "پیکربندی واحد پول، اعلان‌ها و خروجی حسابداری." },
    ],
  }),
  component: () => (
    <AppShell>
      <SettingsPage />
    </AppShell>
  ),
});

function SettingsPage() {
  const { state, setState, user, logout } = useStore();
  const navigate = useNavigate();
  const [push, setPush] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [mapping, setMapping] = useState({ date: "تاریخ", amount: "مبلغ", ref: "شماره سند" });

  if (!user) return null;

  const isAdmin = can(user.role, "settings");

  return (
    <>
      <PageHeader title="تنظیمات" subtitle={`${user.fullName} · ${ROLE_LABEL[user.role]}`} />

      <section className="app-card mb-4 p-4 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-extrabold">
          <Bell className="size-5 text-primary" /> اعلان‌ها
        </h2>
        <label className="flex items-center justify-between gap-3 py-3">
          <span className="text-sm font-bold">دریافت نوتیفیکیشن مرورگر (Push)</span>
          <Switch
            checked={push}
            onCheckedChange={async (v) => {
              if (v && typeof Notification !== "undefined") {
                const perm = await Notification.requestPermission();
                if (perm !== "granted") {
                  toast.error("اجازه نوتیفیکیشن داده نشد؛ فقط اعلان داخل برنامه فعال است.");
                  return;
                }
              }
              setPush(v);
              toast.success(v ? "نوتیفیکیشن مرورگر فعال شد" : "نوتیفیکیشن مرورگر غیرفعال شد");
            }}
          />
        </label>
        <label className="flex items-center justify-between gap-3 border-t py-3">
          <span className="text-sm font-bold">اعلان رویدادهای مهم داخل برنامه</span>
          <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
        </label>
      </section>

      {isAdmin ? (
        <>
          <section className="app-card mb-4 p-4 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-extrabold">
              <Coins className="size-5 text-primary" /> واحد پول
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {(["TOMAN", "RIAL"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setState((s) => ({ ...s, currency: c }));
                    toast.success(`واحد پول به ${c === "TOMAN" ? "تومان" : "ریال"} تغییر کرد`);
                  }}
                  aria-pressed={state.currency === c}
                  className={`min-h-12 rounded-xl font-bold ${
                    state.currency === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {c === "TOMAN" ? "تومان" : "ریال"}
                </button>
              ))}
            </div>
          </section>

          <section className="app-card mb-4 p-4 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-extrabold">
              <TableProperties className="size-5 text-primary" /> نگاشت ستون‌های خروجی حسابداری
            </h2>
            <div className="space-y-3">
              {(
                [
                  ["date", "نام ستون تاریخ"],
                  ["amount", "نام ستون مبلغ"],
                  ["ref", "نام ستون شماره سند"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <label htmlFor={key} className="block text-sm font-bold">
                    {label}
                  </label>
                  <input
                    id={key}
                    value={mapping[key]}
                    onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                    className="h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
              <button
                onClick={() => toast.success("نگاشت ستون‌ها ذخیره شد")}
                className="min-h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground"
              >
                ذخیره نگاشت
              </button>
            </div>
          </section>
        </>
      ) : (
        <EmptyState
          icon={<SettingsIcon className="size-6" />}
          title="تنظیمات سیستمی محدود است"
          description="تنظیمات واحد پول و حسابداری فقط برای مدیر اصلی در دسترس است."
        />
      )}

      <button
        onClick={() => {
          logout();
          void navigate({ to: "/" });
        }}
        className="mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 font-bold text-destructive"
      >
        <LogOut className="size-5" /> خروج از حساب
      </button>
    </>
  );
}
