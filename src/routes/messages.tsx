import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Pencil,
  Send,
  Square,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, PageHeader } from "@/components/ui-kit";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { can, dmKey, uid, useStore, ROLE_LABEL, type Attachment, type ChatMessage, type User } from "@/lib/store";
import { faDateTimeLong, faTime, toFa } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "پیام‌رسان داخلی | مدیریت تعمیرگاه دوچرخه" },
      {
        name: "description",
        content: "گفت‌وگوی گروهی و خصوصی کارکنان فروشگاه و تعمیرگاه با ارسال عکس، ویدیو، فایل و ویس.",
      },
      { property: "og:title", content: "پیام‌رسان داخلی تعمیرگاه دوچرخه" },
      { property: "og:description", content: "ارتباط سریع تیم فروشگاه و تعمیرگاه در یک پیام‌رسان امن." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ c: typeof s['c'] === "string" ? (s['c'] as string) : undefined }),
  component: () => (
    <AppShell>
      <Messages />
    </AppShell>
  ),
});

const MAX_ATTACHMENT = 8 * 1024 * 1024;

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

function Messages() {
  const { state, user } = useStore();
  const { c } = Route.useSearch();
  const navigate = useNavigate();
  if (!user) return null;

  const others = state.users.filter((u) => u.id !== user.id && u.isActive);

  const channels = useMemo(() => {
    const list: { id: string; title: string; subtitle: string; group: boolean }[] = [
      { id: "public", title: "گروه عمومی", subtitle: "همه کاربران فعال", group: true },
    ];
    if (can(user, "partnersChat"))
      list.push({ id: "partners", title: "گروه شرکا", subtitle: "مدیران و شرکا", group: true });
    for (const u of others)
      list.push({
        id: dmKey(user.id, u.id),
        title: u.fullName,
        subtitle: u.title?.trim() || ROLE_LABEL[u.role],
        group: false,
      });
    return list;
  }, [others, user]);

  const active = channels.find((ch) => ch.id === c);

  if (!active)
    return (
      <>
        <PageHeader title="پیام‌رسان" subtitle="گفت‌وگوی گروهی و خصوصی با هم‌تیمی‌ها" />
        <div className="space-y-2">
          {channels.map((ch) => {
            const msgs = state.messages.filter((m) => m.channel === ch.id);
            const last = msgs[msgs.length - 1];
            const unread = msgs.filter(
              (m) => m.senderId !== user.id && !m.readBy.includes(user.id),
            ).length;
            return (
              <button
                key={ch.id}
                onClick={() => void navigate({ to: "/messages", search: { c: ch.id } })}
                className="flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-start transition-colors hover:bg-accent"
              >
                <Avatar className="size-11">
                  <AvatarFallback className="bg-primary-soft font-bold text-primary">
                    {ch.group ? <Users className="size-5" /> : ch.title.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{ch.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {last ? last.text || attachmentLabel(last.attachment) : ch.subtitle}
                  </p>
                </div>
                <div className="shrink-0 text-end">
                  {last ? (
                    <span className="block text-[11px] text-muted-foreground">
                      {faTime(last.createdAt)}
                    </span>
                  ) : null}
                  {unread > 0 ? (
                    <span className="mt-1 inline-block rounded-full bg-destructive px-2 text-xs font-bold text-destructive-foreground">
                      {toFa(unread)}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </>
    );

  return <Chat channelId={active.id} title={active.title} subtitle={active.subtitle} me={user} />;
}

function attachmentLabel(a?: Attachment) {
  if (!a) return "—";
  if (a.kind === "image") return "🖼 عکس";
  if (a.kind === "video") return "🎬 ویدیو";
  if (a.kind === "voice") return "🎤 پیام صوتی";
  return `📎 ${a.name}`;
}

function Chat({
  channelId,
  title,
  subtitle,
  me,
}: {
  channelId: string;
  title: string;
  subtitle: string;
  me: User;
}) {
  const { state, setState } = useStore();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<Attachment | null>(null);
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const mediaInput = useRef<HTMLInputElement>(null);

  const messages = state.messages.filter((m) => m.channel === channelId);

  // Mark everything in this channel as read for me (polling-friendly).
  useEffect(() => {
    const unread = state.messages.filter(
      (m) => m.channel === channelId && m.senderId !== me.id && !m.readBy.includes(me.id),
    );
    if (!unread.length) return;
    setState((s) => ({
      ...s,
      messages: s.messages.map((m) =>
        unread.some((u) => u.id === m.id) ? { ...m, readBy: [...m.readBy, me.id] } : m,
      ),
    }));
  }, [state.messages, channelId, me.id, setState]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function pick(kind: "media" | "file", file?: File | null) {
    if (!file) return;
    if (file.size > MAX_ATTACHMENT) {
      toast.error("حجم فایل باید کمتر از ۸ مگابایت باشد.");
      return;
    }
    try {
      const url = await readFile(file);
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      setDraft({
        kind: kind === "media" ? (isVideo ? "video" : isImage ? "image" : "file") : "file",
        url,
        name: file.name,
      });
    } catch {
      toast.error("خواندن فایل ممکن نشد.");
    }
  }

  async function toggleRecord() {
    if (recording) {
      recorder.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        if (blob.size > MAX_ATTACHMENT) {
          toast.error("پیام صوتی بیش از حد طولانی است.");
          return;
        }
        const url = await readFile(new File([blob], "voice.webm", { type: blob.type }));
        setDraft({ kind: "voice", url, name: "پیام صوتی" });
      };
      recorder.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      toast.error("دسترسی به میکروفون ممکن نشد.");
    }
  }

  function send() {
    const body = text.trim();
    if (!body && !draft) return;
    if (editing) {
      setState((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === editing.id ? { ...m, text: body, editedAt: new Date().toISOString() } : m,
        ),
      }));
      setEditing(null);
      setText("");
      return;
    }
    const msg: ChatMessage = {
      id: uid("m"),
      channel: channelId,
      senderId: me.id,
      text: body,
      ...(draft ? { attachment: draft } : {}),
      createdAt: new Date().toISOString(),
      readBy: [me.id],
    };
    setState((s) => ({ ...s, messages: [...s.messages, msg] }));
    setText("");
    setDraft(null);
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <header className="sticky top-[64px] z-10 -mx-4 mb-3 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <button
          onClick={() => void navigate({ to: "/messages", search: { c: undefined } })}
          aria-label="بازگشت به فهرست گفت‌وگوها"
          className="grid size-9 shrink-0 place-items-center rounded-full border"
        >
          <ArrowRight className="size-5" />
        </button>
        <div className="min-w-0">
          <p className="truncate font-extrabold">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </header>

      <div className="flex-1 space-y-3">
        {messages.length === 0 ? (
          <EmptyState icon={<Send className="size-6" />} title="هنوز پیامی نیست" description="اولین پیام را شما بفرستید." />
        ) : null}
        {messages.map((m) => {
          const mine = m.senderId === me.id;
          const sender = state.users.find((u) => u.id === m.senderId);
          const seen = m.readBy.filter((id) => id !== me.id).length > 0;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-start" : "justify-end")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl border px-3 py-2 text-sm shadow-sm",
                  mine ? "bg-primary-soft" : "bg-card",
                )}
              >
                {!mine ? (
                  <p className="mb-1 text-xs font-bold text-primary">{sender?.fullName ?? "کاربر"}</p>
                ) : null}
                {m.attachment ? <AttachmentView a={m.attachment} /> : null}
                {m.text ? <p className="whitespace-pre-wrap break-words">{m.text}</p> : null}
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span title={faDateTimeLong(m.createdAt)}>{faTime(m.createdAt)}</span>
                  {m.editedAt ? <span>ویرایش شده</span> : null}
                  {mine ? (
                    <>
                      {seen ? <CheckCheck className="size-3.5 text-primary" /> : <Check className="size-3.5" />}
                      {m.text ? (
                        <button
                          onClick={() => {
                            setEditing(m);
                            setText(m.text);
                          }}
                          className="ms-auto inline-flex items-center gap-1 font-bold text-primary"
                        >
                          <Pencil className="size-3.5" /> ویرایش
                        </button>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      <div className="sticky bottom-20 z-10 mt-4 space-y-2 rounded-2xl border bg-card p-2 lg:bottom-4">
        {editing ? (
          <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs">
            <Pencil className="size-3.5" /> در حال ویرایش پیام
            <button
              onClick={() => {
                setEditing(null);
                setText("");
              }}
              className="ms-auto"
              aria-label="لغو ویرایش"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}
        {draft ? (
          <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs">
            {attachmentLabel(draft)}
            <button onClick={() => setDraft(null)} className="ms-auto" aria-label="حذف پیوست">
              <X className="size-4" />
            </button>
          </div>
        ) : null}
        <div className="flex items-end gap-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={1}
            placeholder="پیام خود را بنویسید…"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            ref={mediaInput}
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={(e) => void pick("media", e.target.files?.[0])}
          />
          <input
            ref={fileInput}
            type="file"
            hidden
            onChange={(e) => void pick("file", e.target.files?.[0])}
          />
          <IconBtn label="عکس یا ویدیو" onClick={() => mediaInput.current?.click()}>
            <ImageIcon className="size-5" />
          </IconBtn>
          <IconBtn label="فایل" onClick={() => fileInput.current?.click()}>
            <Paperclip className="size-5" />
          </IconBtn>
          <IconBtn label={recording ? "پایان ضبط" : "ضبط ویس"} onClick={() => void toggleRecord()}>
            {recording ? <Square className="size-5 text-destructive" /> : <Mic className="size-5" />}
          </IconBtn>
          <button
            onClick={send}
            aria-label="ارسال پیام"
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"
          >
            <Send className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-11 shrink-0 place-items-center rounded-xl border"
    >
      {children}
    </button>
  );
}

function AttachmentView({ a }: { a: Attachment }) {
  if (a.kind === "image")
    return <img src={a.url} alt={a.name} className="mb-2 max-h-64 rounded-xl object-cover" />;
  if (a.kind === "video")
    return <video src={a.url} controls className="mb-2 max-h-64 w-full rounded-xl" />;
  if (a.kind === "voice") return <audio src={a.url} controls className="mb-2 w-56" />;
  return (
    <a
      href={a.url}
      download={a.name}
      className="mb-2 flex items-center gap-2 rounded-xl bg-muted px-3 py-2 font-bold"
    >
      <Video className="hidden" />
      <Paperclip className="size-4" /> {a.name}
    </a>
  );
}
