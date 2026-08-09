import { createFileRoute, Link } from "@tanstack/react-router";
import { Banknote, Bell, CheckCheck, ShoppingCart, Wrench } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, PageHeader } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "مرکز اعلان‌ها | مدیریت تعمیرگاه دوچرخه" },
      {
        name: "description",
        content: "اعلان‌های خرید، هزینه، وظایف و فاکتورها با امکان خواندن و مراجعه به صفحه مرتبط.",
      },
      { property: "og:title", content: "مرکز اعلان‌های تعمیرگاه دوچرخه" },
      { property: "og:description", content: "پیگیری آنی رویدادهای فروشگاه و تعمیرگاه." },
    ],
  }),
  component: () => (
    <AppShell>
      <Notifications />
    </AppShell>
  ),
});

const ICONS = {
  purchase: ShoppingCart,
  invoice: ShoppingCart,
  expense: Banknote,
  task: Wrench,
  accounting: CheckCheck,
};

function Notifications() {
  const { state, setState, user } = useStore();
  if (!user) return null;

  const items = state.notifications.filter((n) => n.userRole.includes(user.role));
  const today = items.filter((n) => Date.now() - new Date(n.createdAt).getTime() < 86_400_000);
  const older = items.filter((n) => Date.now() - new Date(n.createdAt).getTime() >= 86_400_000);

  function markAll() {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.userRole.includes(user!.role) ? { ...n, isRead: true } : n,
      ),
    }));
    toast.success("همه اعلان‌ها خوانده شد");
  }

  function markOne(id: string) {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    }));
  }

  const group = (title: string, list: typeof items) =>
    list.length ? (
      <section className="mt-6">
        <h2 className="mb-3 border-b pb-2 text-base font-extrabold text-muted-foreground">
          {title}
        </h2>
        <ul className="space-y-3">
          {list.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <li key={n.id}>
                <Link
                  to={n.url}
                  onClick={() => markOne(n.id)}
                  className={cn(
                    "app-card flex items-start gap-3 p-4",
                    !n.isRead && "border-e-4 border-e-primary",
                  )}
                >
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                    <Icon className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-bold">{n.title}</h3>
                      {!n.isRead ? <span className="size-2 rounded-full bg-primary" /> : null}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{n.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {relativeTime(n.createdAt)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    ) : null;

  return (
    <>
      <PageHeader
        title="مرکز نوتیفیکیشن‌ها"
        subtitle="رویدادهای مرتبط با نقش شما"
        action={
          <button
            onClick={markAll}
            className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground"
          >
            <CheckCheck className="size-4" /> خواندن همه
          </button>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-6" />}
          title="اعلانی وجود ندارد"
          description="هر رویداد مرتبط با نقش شما اینجا نمایش داده می‌شود."
        />
      ) : (
        <>
          {group("امروز", today)}
          {group("قبل‌تر", older)}
        </>
      )}
    </>
  );
}
