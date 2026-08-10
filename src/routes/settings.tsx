import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlarmClock,
  Bell,
  Coins,
  LogOut,
  Moon,
  Settings as SettingsIcon,
  Sun,
  TableProperties,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, PageHeader } from "@/components/ui-kit";
import { ROLE_LABEL, can, useStore, type AlarmSettings, type Role } from "@/lib/store";
import { toFa } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "تنظیمات سامانه | مدیریت تعمیرگاه" },
      { name: "description", content: "تنظیم تم روز و شب، بازهٔ آلارم، واحد پول و خروجی حسابداری." },
      { property: "og:title", content: "تنظیمات سامانه تعمیرگاه دوچرخه" },
      { property: "og:description", content: "پیکربندی تم، آلارم‌ها، واحد پول و خروجی حسابداری." },
    ],
  }),
  component: () => (
    <AppShell>
      <SettingsPage />
    </AppShell>
  ),
});

function SettingsPage() {
  const { state, setState, user, logout, setTheme } = useStore();
  const navigate = useNavigate();
  const [push, setPush] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [mapping, setMapping] = useState({ date: "تاریخ", amount: "مبلغ", ref: "شماره سند" });

  if (!user) return null;

  const isAdmin = can(user.role, "settings");
  const alarms = state.alarms;
  const updateAlarms = (patch: Partial<AlarmSettings>) =>
    setState((s) => ({ ...s, alarms: { ...s.alarms, ...patch } }));


  return (
    <>
      <PageHeader title="تنظیمات" subtitle={`${user.fullName} · ${ROLE_LABEL[user.role]}`} />

      <section className="app-card mb-4 p-4 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-extrabold">
          <Moon className="size-5 text-primary" /> نمایش و تم
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["light", "حالت روز", Sun],
              ["dark", "حالت شب", Moon],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                toast.success(`${label} فعال شد`);
              }}
              aria-pressed={state.theme === value}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl font-bold ${
                state.theme === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>
      </section>

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
        <section className="app-card mb-4 p-4 sm:p-6">
          <h2 className="mb-1 flex items-center gap-2 font-extrabold">
            <AlarmClock className="size-5 text-primary" /> بازهٔ آلارم کاربران
          </h2>
          <p className="mb-4 text-xs leading-6 text-muted-foreground">
            اعلان‌های ثبت‌شده خارج از این بازه جمع می‌شوند و در ابتدای بازه یکجا با صدا و ویبره برای
            کاربران هدف ارسال می‌شوند. اعلان‌های فوری بلافاصله ارسال می‌شوند.
          </p>
          <label className="flex items-center justify-between gap-3 py-3">
            <span className="text-sm font-bold">فعال بودن بازهٔ آلارم</span>
            <Switch
              checked={alarms.enabled}
              onCheckedChange={(v) => updateAlarms({ enabled: v })}
            />
          </label>
          <div className="grid grid-cols-2 gap-3 border-t py-3">
            <div className="space-y-2">
              <label htmlFor="alarm-start" className="block text-sm font-bold">
                از ساعت
              </label>
              <select
                id="alarm-start"
                value={alarms.startHour}
                onChange={(e) => updateAlarms({ startHour: Number(e.target.value) })}
                className="h-12 w-full rounded-xl border bg-card px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-ring"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {toFa(String(h).padStart(2, "0"))}:۰۰
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="alarm-end" className="block text-sm font-bold">
                تا ساعت
              </label>
              <select
                id="alarm-end"
                value={alarms.endHour}
                onChange={(e) => updateAlarms({ endHour: Number(e.target.value) })}
                className="h-12 w-full rounded-xl border bg-card px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-ring"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {toFa(String(h).padStart(2, "0"))}:۰۰
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="border-t py-3">
            <span className="mb-2 block text-sm font-bold">نقش‌های مشمول بازهٔ آلارم</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => {
                const active = alarms.roles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      updateAlarms({
                        roles: active ? alarms.roles.filter((x) => x !== r) : [...alarms.roles, r],
                      })
                    }
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {ROLE_LABEL[r]}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex items-center justify-between gap-3 border-t py-3">
            <span className="text-sm font-bold">ویبره هنگام دریافت آلارم</span>
            <Switch checked={alarms.vibrate} onCheckedChange={(v) => updateAlarms({ vibrate: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 border-t py-3">
            <span className="text-sm font-bold">صدای آلارم</span>
            <Switch checked={alarms.sound} onCheckedChange={(v) => updateAlarms({ sound: v })} />
          </label>
        </section>
      ) : null}


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
