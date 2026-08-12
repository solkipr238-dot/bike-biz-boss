import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "ADMIN" | "STORE_MANAGER" | "EMPLOYEE" | "MECHANIC";

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "مدیر اصلی",
  STORE_MANAGER: "مدیر فروشگاه",
  EMPLOYEE: "فروشنده",
  MECHANIC: "تعمیرکار",
};

export type User = {
  id: string;
  fullName: string;
  username: string;
  phone: string;
  password: string;
  role: Role;
  isActive: boolean;
  isWorker: boolean;
  title: string;
  /** Manual per-user access overrides set by the main admin (key -> allowed). */
  permissions?: Record<string, boolean>;
};



export type Status =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SYNCED_TO_ACCOUNTING"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "CANCELLED";

export type BikeType = "GIRL" | "BOY" | "SPORT";

export const BIKE_TYPE_LABEL: Record<BikeType, string> = {
  GIRL: "دخترانه",
  BOY: "پسرانه",
  SPORT: "اسپرت",
};

/** Standard wheel sizes offered in the purchase form (inches). */
export const BIKE_SIZES = ["12", "16", "20", "24", "26", "27.5", "29"] as const;



export type BicyclePurchase = {
  id: string;
  size: string;
  brand: string;
  color: string;
  bikeType: BikeType;
  purchasePrice: number;
  description: string;
  createdBy: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SYNCED_TO_ACCOUNTING";
  reviewNote?: string;
  accountingRef?: string;
  createdAt: string;
  /** Set once the bike has been handed to a mechanic for repair. */
  repairTaskId?: string;
};

export type ExpenseCategory =
  | "MISCELLANEOUS"
  | "SALARY"
  | "BONUS"
  | "PENALTY"
  | "PERSONAL_WITHDRAWAL";

/** Order matters: it drives the order of the pickers across the app. */
export const EXPENSE_LABEL: Record<ExpenseCategory, string> = {
  MISCELLANEOUS: "هزینه",
  SALARY: "حقوق",
  BONUS: "پاداش",
  PENALTY: "جریمه",
  PERSONAL_WITHDRAWAL: "برداشت شخصی",
};

export const EXPENSE_ORDER: ExpenseCategory[] = [
  "MISCELLANEOUS",
  "SALARY",
  "BONUS",
  "PENALTY",
  "PERSONAL_WITHDRAWAL",
];

export type Expense = {
  id: string;
  category: ExpenseCategory;
  /** Free-text name, only for the generic "هزینه" category. */
  name?: string;
  amount: number;
  date: string;
  description: string;
  relatedUserId?: string;
  createdBy: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SYNCED_TO_ACCOUNTING";
  reviewNote?: string;
  accountingRef?: string;
};

export function expenseTitle(e: Expense) {
  return e.category === "MISCELLANEOUS"
    ? e.name?.trim() || EXPENSE_LABEL.MISCELLANEOUS
    : EXPENSE_LABEL[e.category];
}


export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "اولویت پایین",
  MEDIUM: "اولویت متوسط",
  HIGH: "اولویت بالا",
  URGENT: "فوری",
};

export type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "SYNCED_TO_ACCOUNTING";

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: "انجام‌نشده",
  IN_PROGRESS: "در حال انجام",
  SUBMITTED: "منتظر تأیید",
  APPROVED: "تأییدشده",
  REJECTED: "رد شده",
  CANCELLED: "لغو شده",
  SYNCED_TO_ACCOUNTING: "ثبت در حسابداری",
};

export type Task = {
  id: string;
  workerId: string;
  /** Bicycle (purchase) this repair task belongs to, when created from inventory. */
  bikeId?: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate?: string;
  wage: number;
  finalWage?: number;
  status: TaskStatus;
  createdBy: string;
  completedNote?: string;
  /** Optional photo of the finished work (data URL). Never required. */
  photo?: string;
  rejectReason?: string;
  accountingRef?: string;
  createdAt: string;
  /** Exact moment the mechanic submitted the work. */
  submittedAt?: string;
  /** Exact moment the manager approved the wage. */
  approvedAt?: string;
  /** Exact moment of the last edit. */
  updatedAt?: string;
};


export type InvoiceStatus =
  | "PRE_INVOICE"
  | "PURCHASED"
  | "PENDING_FINAL"
  | "FINALIZED"
  | "SYNCED_TO_ACCOUNTING";

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  PRE_INVOICE: "پیش‌فاکتور",
  PURCHASED: "خرید شده",
  PENDING_FINAL: "در انتظار نهایی‌سازی",
  FINALIZED: "نهایی شده",
  SYNCED_TO_ACCOUNTING: "ثبت در حسابداری",
};

export type InvoiceItem = {
  id: string;
  productName: string;
  probableQty: number;
  probableUnitPrice: number;
  finalQty?: number;
  finalUnitPrice?: number;
  notes?: string;
};

export type PurchaseInvoice = {
  id: string;
  invoiceNumber: string;
  supplier: string;
  date: string;
  status: InvoiceStatus;
  notes: string;
  createdBy: string;
  accountingRef?: string;
  items: InvoiceItem[];
};

export type AppNotification = {
  id: string;
  userRole: Role[];
  /** When set, only these users receive the notification. */
  userIds?: string[];
  title: string;
  body: string;
  url: string;
  type: "purchase" | "expense" | "task" | "invoice" | "accounting";
  priority: "NORMAL" | "URGENT";
  isRead: boolean;
  createdAt: string;
  /** Vibration pattern in ms (vibrate/pause pairs). Falls back to alarm settings. */
  vibratePattern?: number[];
  /** ISO time the alarm should actually reach the user's phone. */
  deliverAt: string;
  delivered: boolean;
};

/** Quiet-hours style alarm window managed by the main admin. */
export type AlarmSettings = {
  enabled: boolean;
  /** Alarms only ring between startHour:00 and endHour:00 (24h clock). */
  startHour: number;
  endHour: number;
  /** Roles the window applies to; other roles get alarms instantly. */
  roles: Role[];
  vibrate: boolean;
  sound: boolean;
  /** How many vibration pulses a normal alarm plays. */
  vibratePulses: number;
  /** Length of every pulse in milliseconds (heavier = longer). */
  vibrateDuration: number;
};

/** Builds a vibrate/pause pattern from a pulse count and pulse length. */
export function buildVibratePattern(pulses: number, duration: number): number[] {
  const p = Math.max(1, Math.min(10, Math.round(pulses)));
  const d = Math.max(100, Math.min(2000, Math.round(duration)));
  return Array.from({ length: p * 2 - 1 }, (_, i) => (i % 2 === 0 ? d : 150));
}

export type State = {
  currentUserId: string | null;
  currency: "TOMAN" | "RIAL";
  theme: "light" | "dark";
  alarms: AlarmSettings;
  users: User[];
  purchases: BicyclePurchase[];
  expenses: Expense[];
  tasks: Task[];
  invoices: PurchaseInvoice[];
  notifications: AppNotification[];
};

export const DEFAULT_ALARMS: AlarmSettings = {
  enabled: true,
  startHour: 16,
  endHour: 23,
  roles: ["MECHANIC"],
  vibrate: true,
  sound: true,
  vibratePulses: 3,
  vibrateDuration: 500,
};

/** The only account that ships with the app; every other user is created by the admin. */
const users: User[] = [
  {
    id: "u1",
    fullName: "مهدی",
    username: "mehdi",
    phone: "09120000001",
    password: "1400",
    role: "ADMIN",
    isActive: true,
    isWorker: false,
    title: "مدیر کل",
  },
];

const initialState: State = {
  currentUserId: null,
  currency: "TOMAN",
  theme: "light",
  alarms: DEFAULT_ALARMS,
  users,
  purchases: [],
  expenses: [],
  tasks: [],
  invoices: [],
  notifications: [],
};


const KEY = "dar-rekab-state-v2";

export type NotifyInput = Omit<
  AppNotification,
  "id" | "isRead" | "createdAt" | "deliverAt" | "delivered"
>;

/** Does this notification belong to the given user? */
export function isForUser(n: AppNotification, u: User) {
  return n.userIds?.length ? n.userIds.includes(u.id) : n.userRole.includes(u.role);
}

/** Next moment the alarm may ring, honouring the admin's alarm window. */
export function computeDeliverAt(alarms: AlarmSettings, roles: Role[], from = new Date()): Date {
  if (!alarms.enabled) return from;
  const affected = roles.some((r) => alarms.roles.includes(r));
  if (!affected) return from;
  const start = alarms.startHour;
  const end = alarms.endHour;
  const h = from.getHours();
  const inWindow = start <= end ? h >= start && h < end : h >= start || h < end;
  if (inWindow) return from;
  const next = new Date(from);
  next.setMinutes(0, 0, 0);
  if (h < start) next.setHours(start);
  else {
    next.setDate(next.getDate() + 1);
    next.setHours(start);
  }
  return next;
}

type Ctx = {
  state: State;
  setState: (updater: (s: State) => State) => void;
  user: User | null;
  login: (identifier: string, password: string) => boolean;
  logout: () => void;
  notify: (n: NotifyInput) => void;
  setTheme: (t: "light" | "dark") => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setRaw] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<State>;
        setRaw({
          ...initialState,
          ...parsed,
          alarms: { ...DEFAULT_ALARMS, ...(parsed.alarms ?? {}) },
          users: (parsed.users?.length ? parsed.users : initialState.users).map((u) =>
            u.role === "ADMIN" && u.username === "admin"
              ? { ...u, username: "mehdi", password: "1400", fullName: "مهدی" }
              : u,
          ),
        });
      }
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  // Theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.theme === "dark");
    root.style.colorScheme = state.theme;
  }, [state.theme]);

  // Alarm delivery loop: queued alarms fire once their window opens.
  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;
  useEffect(() => {
    if (!hydrated) return;
    const tick = () => {
      const due = state.notifications.filter(
        (n) => !n.delivered && new Date(n.deliverAt).getTime() <= Date.now(),
      );
      if (!due.length) return;
      setRaw((s) => ({
        ...s,
        notifications: s.notifications.map((n) =>
          due.some((d) => d.id === n.id) ? { ...n, delivered: true } : n,
        ),
      }));
      if (!currentUser) return;
      const mine = due.filter((n) => isForUser(n, currentUser));
      if (!mine.length) return;
      if (state.alarms.vibrate && typeof navigator !== "undefined" && "vibrate" in navigator) {
        const pattern =
          mine.find((n) => n.vibratePattern?.length)?.vibratePattern ??
          buildVibratePattern(state.alarms.vibratePulses, state.alarms.vibrateDuration);
        navigator.vibrate?.(pattern);
      }
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        for (const n of mine) {
          try {
            new Notification(n.title, {
              body: n.body,
              tag: n.id,
              ...(n.vibratePattern ? { vibrate: n.vibratePattern } : {}),
            } as NotificationOptions);
          } catch {
            /* notification not available */
          }
        }
      }
    };
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, [hydrated, state.notifications, state.alarms, currentUser]);

  const value = useMemo<Ctx>(() => {
    const setState = (updater: (s: State) => State) => setRaw((s) => updater(s));
    return {
      state,
      setState,
      user: state.users.find((u) => u.id === state.currentUserId) ?? null,
      login: (identifier: string, password: string) => {
        const id = identifier.trim().toLowerCase();
        const pass = password.trim();
        const digits = (v: string) => v.replace(/[^\d]/g, "");
        const found = state.users.find(
          (u) =>
            u.isActive &&
            (u.username.trim().toLowerCase() === id ||
              (!!u.phone && digits(u.phone) === digits(identifier))) &&
            u.password.trim() === pass,
        );
        if (!found) return false;
        setRaw((s) => ({ ...s, currentUserId: found.id }));
        return true;
      },

      logout: () => setRaw((s) => ({ ...s, currentUserId: null })),
      setTheme: (t) => setRaw((s) => ({ ...s, theme: t })),
      notify: (n) =>
        setRaw((s) => {
          const roles = n.userIds?.length
            ? s.users.filter((u) => n.userIds!.includes(u.id)).map((u) => u.role)
            : n.userRole;
          const deliverAt =
            n.priority === "URGENT" ? new Date() : computeDeliverAt(s.alarms, roles, new Date());
          return {
            ...s,
            notifications: [
              {
                ...n,
                id: uid("n"),
                isRead: false,
                createdAt: new Date().toISOString(),
                deliverAt: deliverAt.toISOString(),
                delivered: deliverAt.getTime() <= Date.now(),
              },
              ...s.notifications,
            ],
          };
        }),
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}


export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function uid(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}`;
}

/** Server-side permission-style matrix, also used to build navigation. */
export const CAN: Record<string, Role[]> = {
  dashboard: ["ADMIN", "STORE_MANAGER", "EMPLOYEE"],
  purchases: ["ADMIN", "STORE_MANAGER", "EMPLOYEE"],
  inventory: ["ADMIN", "STORE_MANAGER", "EMPLOYEE"],
  expenses: ["ADMIN", "STORE_MANAGER", "EMPLOYEE"],
  tasks: ["ADMIN", "STORE_MANAGER", "EMPLOYEE", "MECHANIC"],
  invoices: ["ADMIN", "STORE_MANAGER"],
  notifications: ["ADMIN", "STORE_MANAGER", "EMPLOYEE", "MECHANIC"],
  earnings: ["ADMIN", "STORE_MANAGER", "MECHANIC"],
  reports: ["ADMIN", "STORE_MANAGER"],
  users: ["ADMIN"],
  settings: ["ADMIN"],
  exports: ["ADMIN", "STORE_MANAGER"],
  approve: ["ADMIN", "STORE_MANAGER"],
  syncAccounting: ["ADMIN"],
  personalWithdrawal: ["ADMIN", "STORE_MANAGER"],
};

/** Human labels for the manual access panel in user management. */
export const PERMISSION_LABEL: Record<string, string> = {
  dashboard: "خانه و داشبورد",
  purchases: "خرید دوچرخه",
  inventory: "انبار دوچرخه‌ها",
  expenses: "هزینه‌ها",
  tasks: "وظایف",
  invoices: "فاکتورهای خرید",
  notifications: "اعلان‌ها",
  earnings: "دستمزد و پاداش",
  reports: "گزارش و تحلیل",
  users: "مدیریت کاربران",
  settings: "تنظیمات سامانه",
  exports: "خروجی حسابداری",
  approve: "تأیید و بررسی موارد",
  syncAccounting: "ثبت در حسابداری",
  personalWithdrawal: "برداشت شخصی",
};

export const PERMISSION_KEYS = Object.keys(PERMISSION_LABEL);

/**
 * Access check. Accepts a role or a full user; per-user overrides set by the
 * main admin always win over the role matrix.
 */
export function can(
  subject: Role | User | undefined | null,
  key: keyof typeof CAN | string,
): boolean {
  if (!subject) return false;
  if (typeof subject === "string") return (CAN[key] ?? []).includes(subject);
  if (!subject.isActive) return false;
  const override = subject.permissions?.[key];
  if (typeof override === "boolean") return override;
  return (CAN[key] ?? []).includes(subject.role);
}

/** Effective access map for a user (used by the admin access panel). */
export function effectivePermissions(u: User): Record<string, boolean> {
  return Object.fromEntries(PERMISSION_KEYS.map((k) => [k, can(u, k)]));
}

