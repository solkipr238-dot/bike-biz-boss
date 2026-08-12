import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, RotateCcw, Trash2, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Chip, EmptyState, PageHeader } from "@/components/ui-kit";
import { Field, SelectField } from "@/components/forms/fields";
import { ROLE_LABEL, can, uid, useStore, type Role } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "مدیریت کاربران | مدیریت تعمیرگاه" },
      { name: "description", content: "مدیریت دسترسی‌ها و نقش‌های پرسنل فروشگاه و تعمیرگاه." },
      { property: "og:title", content: "مدیریت کاربران تعمیرگاه دوچرخه" },
      { property: "og:description", content: "افزودن، ویرایش و غیرفعال‌سازی کاربران سامانه." },
    ],
  }),
  component: () => (
    <AppShell>
      <UsersPage />
    </AppShell>
  ),
});

function UsersPage() {
  const { state, setState, user } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    phone: "",
    password: "",
    role: "EMPLOYEE" as Role,
    title: "",
  });

  if (!can(user, "users"))
    return (
      <EmptyState
        icon={<Users className="size-6" />}
        title="دسترسی ندارید"
        description="این بخش فقط برای مدیر اصلی در دسترس است."
      />
    );

  function openNew() {
    setEditId(null);
    setForm({ fullName: "", username: "", phone: "", password: "", role: "EMPLOYEE", title: "" });
    setOpen(true);
  }

  function openEdit(id: string) {
    const u = state.users.find((x) => x.id === id)!;
    setEditId(id);
    setForm({
      fullName: u.fullName,
      username: u.username,
      phone: u.phone,
      password: "",
      role: u.role,
      title: u.title,
    });
    setOpen(true);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim() || !form.username.trim()) {
      toast.error("نام و نام کاربری اجباری هستند.");
      return;
    }
    const username = form.username.trim();
    const duplicate = state.users.some(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.id !== editId,
    );
    if (duplicate) {
      toast.error("این نام کاربری قبلاً استفاده شده است.");
      return;
    }
    if (!editId && form.password.trim().length < 4) {
      toast.error("رمز عبور باید حداقل ۴ کاراکتر باشد.");
      return;
    }
    if (editId && form.password.trim() && form.password.trim().length < 4) {
      toast.error("رمز عبور جدید باید حداقل ۴ کاراکتر باشد.");
      return;
    }
    setState((s) => ({
      ...s,
      users: editId
        ? s.users.map((u) =>
            u.id === editId
              ? {
                  ...u,
                  fullName: form.fullName.trim(),
                  username,
                  phone: form.phone.trim(),
                  title: form.title.trim(),
                  role: form.role,
                  isWorker: form.role === "MECHANIC",
                  ...(form.password.trim() ? { password: form.password.trim() } : {}),
                }
              : u,
          )
        : [
            ...s.users,
            {
              id: uid("u"),
              fullName: form.fullName.trim(),
              username,
              phone: form.phone.trim(),
              password: form.password.trim(),
              title: form.title.trim(),
              role: form.role,
              isActive: true,
              isWorker: form.role === "MECHANIC",
            },
          ],
    }));
    setOpen(false);
    toast.success(editId ? "کاربر ویرایش شد" : "کاربر جدید افزوده شد");
  }


  return (
    <>
      <PageHeader
        title="مدیریت کاربران"
        subtitle="مدیریت دسترسی‌ها و نقش‌های پرسنل تعمیرگاه"
        action={
          <button
            onClick={openNew}
            className="flex items-center gap-1 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
          >
            <Plus className="size-4" /> افزودن کاربر
          </button>
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2">
        {state.users.map((u) => (
          <li
            key={u.id}
            className={`app-card overflow-hidden border-e-4 p-4 ${
              u.isActive ? "border-e-primary" : "border-e-destructive"
            }`}
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback className="bg-accent font-bold text-accent-foreground">
                  {u.fullName.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-extrabold ${!u.isActive ? "line-through opacity-70" : ""}`}>
                  {u.fullName}
                </p>
                <p className="truncate text-sm text-muted-foreground">{u.title}</p>
              </div>
              <Chip tone={u.role === "ADMIN" ? "success" : "neutral"}>{ROLE_LABEL[u.role]}</Chip>
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <span
                className={`flex items-center gap-1.5 text-sm font-bold ${
                  u.isActive ? "text-primary" : "text-destructive"
                }`}
              >
                <span className={`size-2 rounded-full ${u.isActive ? "bg-primary" : "bg-destructive"}`} />
                {u.isActive ? "فعال" : "غیرفعال"}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(u.id)}
                  aria-label={`ویرایش ${u.fullName}`}
                  className="grid size-10 place-items-center rounded-lg hover:bg-accent"
                >
                  <Pencil className="size-5" />
                </button>
                {u.isActive ? (
                  <button
                    onClick={() => setDeleteId(u.id)}
                    disabled={u.id === user?.id}
                    aria-label={`غیرفعال‌سازی ${u.fullName}`}
                    className="grid size-10 place-items-center rounded-lg text-destructive hover:bg-destructive/10 disabled:opacity-40"
                  >
                    <Trash2 className="size-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setState((s) => ({
                        ...s,
                        users: s.users.map((x) => (x.id === u.id ? { ...x, isActive: true } : x)),
                      }));
                      toast.success("کاربر فعال شد");
                    }}
                    aria-label={`فعال‌سازی ${u.fullName}`}
                    className="grid size-10 place-items-center rounded-lg text-primary hover:bg-accent"
                  >
                    <RotateCcw className="size-5" />
                  </button>
                )}
              </div>

            </div>
          </li>
        ))}
      </ul>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="safe-bottom max-h-[92vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader className="text-start">
            <SheetTitle>{editId ? "ویرایش کاربر" : "افزودن کاربر جدید"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={save} className="space-y-4 p-4" noValidate>
            <Field
              id="fullName"
              label="نام و نام خانوادگی"
              required
              value={form.fullName}
              onChange={(v) => setForm({ ...form, fullName: v })}
            />
            <Field
              id="username"
              label="نام کاربری"
              required
              value={form.username}
              onChange={(v) => setForm({ ...form, username: v })}
            />
            <Field
              id="phone"
              label="شماره موبایل"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="09XXXXXXXXX"
            />
            <Field
              id="title"
              label="سمت"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              placeholder="مثلاً مکانیک ارشد"
            />
            <SelectField
              id="role"
              label="نقش"
              required
              value={form.role}
              onChange={(v) => setForm({ ...form, role: v as Role })}
              options={(Object.keys(ROLE_LABEL) as Role[]).map((r) => ({
                value: r,
                label: ROLE_LABEL[r],
              }))}
            />
            <Field
              id="password"
              label={editId ? "رمز عبور جدید (اختیاری)" : "رمز عبور"}
              required={!editId}
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder={editId ? "برای تغییر رمز، وارد کنید" : "حداقل ۴ کاراکتر"}
            />

            <div className="rounded-2xl border p-4">
              <p className="text-sm font-extrabold">دسترسی‌های دستی</p>
              <p className="mt-1 text-xs text-muted-foreground">
                به‌صورت پیش‌فرض دسترسی‌ها از روی نقش تعیین می‌شود. با این کلیدها می‌توانید برای این
                کاربر دسترسی خاصی را آزاد یا محدود کنید.
              </p>
              <ul className="mt-3 space-y-2">
                {PERMISSION_KEYS.map((key) => {
                  const override = form.permissions[key];
                  const allowed =
                    typeof override === "boolean" ? override : CAN[key]?.includes(form.role) ?? false;
                  return (
                    <li key={key} className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold">{PERMISSION_LABEL[key]}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        {typeof override === "boolean" ? (
                          <button
                            type="button"
                            onClick={() => {
                              const next = { ...form.permissions };
                              delete next[key];
                              setForm({ ...form, permissions: next });
                            }}
                            className="text-xs font-bold text-muted-foreground underline"
                          >
                            پیش‌فرض نقش
                          </button>
                        ) : null}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={allowed}
                          aria-label={PERMISSION_LABEL[key]}
                          onClick={() =>
                            setForm({
                              ...form,
                              permissions: { ...form.permissions, [key]: !allowed },
                            })
                          }
                          className={`h-7 w-12 rounded-full p-1 transition-colors ${
                            allowed ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`block size-5 rounded-full bg-card transition-transform ${
                              allowed ? "-translate-x-5" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>


            <button
              type="submit"
              className="min-h-13 w-full rounded-xl bg-primary py-3.5 font-extrabold text-primary-foreground"
            >
              ذخیره
            </button>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>غیرفعال‌سازی کاربر</AlertDialogTitle>
            <AlertDialogDescription>
              کاربر غیرفعال می‌شود و امکان ورود نخواهد داشت. این کار قابل بازگشت است.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setState((s) => ({
                  ...s,
                  users: s.users.map((u) => (u.id === deleteId ? { ...u, isActive: false } : u)),
                }));
                setDeleteId(null);
                toast.success("کاربر غیرفعال شد");
              }}
            >
              غیرفعال کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
