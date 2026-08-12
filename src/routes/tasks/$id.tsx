import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, PlayCircle, Send, XCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Chip, EmptyState, PageHeader } from "@/components/ui-kit";
import { AmountField, InfoRow, TextArea } from "@/components/forms/fields";
import { PRIORITY_LABEL, TASK_STATUS_LABEL, can, useStore } from "@/lib/store";
import { faDateTimeLong, money } from "@/lib/format";

export const Route = createFileRoute("/tasks/$id")({
  head: () => ({
    meta: [
      { title: "جزئیات وظیفه | مدیریت تعمیرگاه" },
      { name: "description", content: "تغییر وضعیت وظیفه، ثبت انجام کار، تأیید یا رد توسط مدیر." },
      { property: "og:title", content: "جزئیات وظیفه تعمیرکار" },
      { property: "og:description", content: "پیگیری کامل یک وظیفه تعمیرگاه دوچرخه." },
    ],
  }),
  component: () => (
    <AppShell>
      <TaskDetail />
    </AppShell>
  ),
});

function TaskDetail() {
  const { id } = useParams({ from: "/tasks/$id" });
  const { state, setState, user, notify } = useStore();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [finalWage, setFinalWage] = useState(0);

  const task = state.tasks.find((t) => t.id === id);
  if (!task || !user)
    return (
      <EmptyState
        icon={<XCircle className="size-6" />}
        title="وظیفه یافت نشد"
        description="این وظیفه حذف شده یا دسترسی ندارید."
      />
    );

  const worker = state.users.find((u) => u.id === task.workerId);
  const isOwner = task.workerId === user.id;
  const isManager = can(user, "approve");

  function patch(p: Partial<typeof task>) {
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...p } : t)) }));
  }

  function submitWork() {
    if (!note.trim()) {
      toast.error("توضیح انجام کار را وارد کنید.");
      return;
    }
    patch({ status: "SUBMITTED", completedNote: note });
    notify({
      userRole: ["ADMIN", "STORE_MANAGER"],
      title: "وظیفه انجام شد",
      body: "وظیفه انجام شده و نیاز به تأیید دارد.",
      url: "/tasks",
      type: "task",
      priority: "NORMAL",
    });
    toast.success("انجام وظیفه ثبت شد");
  }

  function approve() {
    patch({ status: "APPROVED", finalWage: finalWage || task!.wage });
    notify({
      userRole: ["MECHANIC"],
      title: "وظیفه تأیید شد",
      body: "وظیفه شما تأیید شد.",
      url: "/tasks",
      type: "task",
      priority: "NORMAL",
    });
    toast.success("وظیفه تأیید شد");
  }

  function reject() {
    if (!reason.trim()) {
      toast.error("دلیل رد اجباری است.");
      return;
    }
    patch({ status: "REJECTED", rejectReason: reason });
    notify({
      userRole: ["MECHANIC"],
      title: "وظیفه نیاز به اصلاح دارد",
      body: `دلیل: ${reason}`,
      url: "/tasks",
      type: "task",
      priority: "NORMAL",
    });
    toast.success("وظیفه رد شد");
  }

  return (
    <>
      <button
        onClick={() => navigate({ to: "/tasks" })}
        className="mb-3 flex items-center gap-1 text-sm font-bold text-primary"
      >
        <ArrowRight className="size-4" /> بازگشت به وظایف
      </button>

      <PageHeader
        title={task.title}
        subtitle={`تعمیرکار: ${worker?.fullName ?? "—"}`}
        action={<Chip tone="info">{TASK_STATUS_LABEL[task.status]}</Chip>}
      />

      <div className="app-card divide-y p-4 sm:p-6">
        <InfoRow label="توضیحات">{task.description || "—"}</InfoRow>
        <InfoRow label="اولویت">{PRIORITY_LABEL[task.priority]}</InfoRow>
        <InfoRow label="تاریخ سررسید">{task.dueDate ? faDateTimeLong(task.dueDate) : "—"}</InfoRow>
        <InfoRow label="دستمزد">
          <span className="num">{money(task.wage, state.currency)}</span>
        </InfoRow>
        {task.finalWage ? (
          <InfoRow label="دستمزد نهایی">
            <span className="num">{money(task.finalWage, state.currency)}</span>
          </InfoRow>
        ) : null}
        {task.completedNote ? <InfoRow label="گزارش انجام کار">{task.completedNote}</InfoRow> : null}
        {task.rejectReason ? <InfoRow label="دلیل رد">{task.rejectReason}</InfoRow> : null}
      </div>

      {isOwner && (task.status === "PENDING" || task.status === "IN_PROGRESS") ? (
        <div className="app-card mt-4 space-y-3 p-4">
          {task.status === "PENDING" ? (
            <button
              onClick={() => {
                patch({ status: "IN_PROGRESS" });
                toast.success("وظیفه شروع شد");
              }}
              className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary font-extrabold text-primary-foreground"
            >
              <PlayCircle className="size-5" /> شروع وظیفه
            </button>
          ) : (
            <>
              <TextArea
                id="note"
                label="گزارش انجام کار"
                value={note}
                onChange={setNote}
                placeholder="شرح کارهای انجام‌شده..."
              />
              <button
                onClick={submitWork}
                className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary font-extrabold text-primary-foreground"
              >
                <Send className="size-5" /> ثبت انجام وظیفه
              </button>
            </>
          )}
        </div>
      ) : null}

      {isManager && task.status === "SUBMITTED" ? (
        <div className="app-card mt-4 space-y-4 p-4">
          <h3 className="font-bold">بررسی و تأیید</h3>
          <AmountField
            id="finalWage"
            label="دستمزد نهایی"
            value={finalWage || task.wage}
            onChange={setFinalWage}
            currency={state.currency}
          />
          <button
            onClick={approve}
            className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary font-extrabold text-primary-foreground"
          >
            <CheckCircle2 className="size-5" /> تأیید وظیفه
          </button>
          <TextArea id="reason" label="دلیل رد (در صورت نیاز)" value={reason} onChange={setReason} />
          <button
            onClick={reject}
            className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 font-bold text-destructive"
          >
            <XCircle className="size-5" /> رد و نیاز به اصلاح
          </button>
        </div>
      ) : null}
    </>
  );
}
