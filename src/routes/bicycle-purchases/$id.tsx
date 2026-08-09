import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, XCircle, FileCheck2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Chip, EmptyState, PageHeader } from "@/components/ui-kit";
import { InfoRow } from "@/components/forms/fields";
import { BIKE_TYPE_LABEL, can, useStore } from "@/lib/store";
import { faDateLong, money } from "@/lib/format";
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

export const Route = createFileRoute("/bicycle-purchases/$id")({
  head: () => ({
    meta: [
      { title: "جزئیات خرید دوچرخه | مدیریت تعمیرگاه" },
      { name: "description", content: "مشاهده جزئیات، تأیید، رد و ثبت حسابداری خرید دوچرخه." },
      { property: "og:title", content: "جزئیات خرید دوچرخه" },
      { property: "og:description", content: "وضعیت، ثبت‌کننده و اقدامات مدیریتی خرید دوچرخه." },
    ],
  }),
  component: () => (
    <AppShell>
      <PurchaseDetail />
    </AppShell>
  ),
});

function PurchaseDetail() {
  const { id } = useParams({ from: "/bicycle-purchases/$id" });
  const { state, setState, user, notify } = useStore();
  const navigate = useNavigate();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [accRef, setAccRef] = useState("");

  const item = state.purchases.find((p) => p.id === id);
  if (!item || !user)
    return (
      <EmptyState
        icon={<XCircle className="size-6" />}
        title="خرید یافت نشد"
        description="این رکورد حذف شده یا دسترسی به آن ندارید."
      />
    );

  const creator = state.users.find((u) => u.id === item.createdBy);

  function update(patch: Partial<typeof item>) {
    setState((s) => ({
      ...s,
      purchases: s.purchases.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }

  function approve() {
    update({ status: "APPROVED" });
    notify({
      userRole: ["EMPLOYEE", "STORE_MANAGER"],
      title: "خرید دوچرخه تأیید شد",
      body: `خرید ${item!.brand} تأیید شد.`,
      url: "/bicycle-purchases",
      type: "purchase",
      priority: "NORMAL",
    });
    toast.success("خرید تأیید شد");
  }

  function reject() {
    if (!reason.trim()) {
      toast.error("دلیل رد کردن اجباری است.");
      return;
    }
    update({ status: "REJECTED", reviewNote: reason });
    notify({
      userRole: ["EMPLOYEE"],
      title: "خرید دوچرخه رد شد",
      body: `دلیل: ${reason}`,
      url: "/bicycle-purchases",
      type: "purchase",
      priority: "NORMAL",
    });
    setRejectOpen(false);
    toast.success("خرید رد شد");
  }

  function sync() {
    if (!accRef.trim()) {
      toast.error("شماره سند حسابداری را وارد کنید.");
      return;
    }
    update({ status: "SYNCED_TO_ACCOUNTING", accountingRef: accRef });
    toast.success("به‌عنوان ثبت‌شده در حسابداری علامت‌گذاری شد");
  }

  const toneMap = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
    SYNCED_TO_ACCOUNTING: "info",
  } as const;
  const labelMap = {
    PENDING: "در انتظار تایید",
    APPROVED: "تایید شده",
    REJECTED: "رد شده",
    SYNCED_TO_ACCOUNTING: "ثبت‌شده در حسابداری",
  };

  return (
    <>
      <button
        onClick={() => navigate({ to: "/bicycle-purchases" })}
        className="mb-3 flex items-center gap-1 text-sm font-bold text-primary"
      >
        <ArrowRight className="size-4" /> بازگشت به لیست
      </button>

      <PageHeader
        title={item.brand}
        subtitle={`ثبت‌شده توسط ${creator?.fullName ?? "نامشخص"}`}
        action={<Chip tone={toneMap[item.status]}>{labelMap[item.status]}</Chip>}
      />

      <div className="app-card divide-y p-4 sm:p-6">
        <InfoRow label="سایز">{item.size}</InfoRow>
        <InfoRow label="رنگ">{item.color}</InfoRow>
        <InfoRow label="نوع دوچرخه">{BIKE_TYPE_LABEL[item.bikeType]}</InfoRow>
        <InfoRow label="قیمت خرید">
          <span className="num">{money(item.purchasePrice, state.currency)}</span>
        </InfoRow>
        <InfoRow label="تاریخ ثبت">{faDateLong(item.createdAt)}</InfoRow>
        <InfoRow label="توضیحات">{item.description || "—"}</InfoRow>
        {item.reviewNote ? <InfoRow label="دلیل رد">{item.reviewNote}</InfoRow> : null}
        {item.accountingRef ? <InfoRow label="شماره سند">{item.accountingRef}</InfoRow> : null}
      </div>

      {can(user.role, "approve") && item.status === "PENDING" ? (
        <div className="mt-4 flex gap-3">
          <button
            onClick={approve}
            className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-extrabold text-primary-foreground"
          >
            <CheckCircle2 className="size-5" /> تأیید خرید
          </button>
          <button
            onClick={() => setRejectOpen(true)}
            className="flex min-h-13 items-center justify-center gap-2 rounded-xl bg-destructive/10 px-4 py-3.5 font-bold text-destructive"
          >
            <XCircle className="size-5" /> رد کردن
          </button>
        </div>
      ) : null}

      {can(user.role, "syncAccounting") && item.status === "APPROVED" ? (
        <div className="app-card mt-4 space-y-3 p-4">
          <h3 className="flex items-center gap-2 font-bold">
            <FileCheck2 className="size-5 text-primary" /> ثبت در حسابداری
          </h3>
          <input
            value={accRef}
            onChange={(e) => setAccRef(e.target.value)}
            placeholder="شماره سند حسابداری، مثلاً ACC-1402-095"
            aria-label="شماره سند حسابداری"
            className="h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={sync}
            className="min-h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground"
          >
            علامت‌گذاری به‌عنوان منتقل‌شده
          </button>
        </div>
      ) : null}

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>رد کردن خرید دوچرخه</AlertDialogTitle>
            <AlertDialogDescription>
              دلیل رد کردن اجباری است و برای ثبت‌کننده ارسال می‌شود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="دلیل رد..."
            aria-label="دلیل رد"
            className="w-full rounded-xl border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={reject}>ثبت رد</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
