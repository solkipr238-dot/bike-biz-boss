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
  role: Role;
  isActive: boolean;
  isWorker: boolean;
  title: string;
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
};

export type ExpenseCategory =
  | "SALARY"
  | "BONUS"
  | "PENALTY"
  | "PERSONAL_WITHDRAWAL"
  | "MISCELLANEOUS";

export const EXPENSE_LABEL: Record<ExpenseCategory, string> = {
  SALARY: "حقوق",
  BONUS: "پاداش",
  PENALTY: "جریمه",
  PERSONAL_WITHDRAWAL: "برداشت شخصی",
  MISCELLANEOUS: "هزینه متفرقه",
};

export type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  relatedUserId?: string;
  createdBy: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SYNCED_TO_ACCOUNTING";
  reviewNote?: string;
  accountingRef?: string;
};

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
  title: string;
  description: string;
  priority: Priority;
  dueDate?: string;
  wage: number;
  finalWage?: number;
  status: TaskStatus;
  createdBy: string;
  completedNote?: string;
  rejectReason?: string;
  accountingRef?: string;
  createdAt: string;
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
  title: string;
  body: string;
  url: string;
  type: "purchase" | "expense" | "task" | "invoice" | "accounting";
  priority: "NORMAL" | "URGENT";
  isRead: boolean;
  createdAt: string;
};

export type State = {
  currentUserId: string | null;
  currency: "TOMAN" | "RIAL";
  users: User[];
  purchases: BicyclePurchase[];
  expenses: Expense[];
  tasks: Task[];
  invoices: PurchaseInvoice[];
  notifications: AppNotification[];
};

const now = Date.now();
const ago = (h: number) => new Date(now - h * 3600_000).toISOString();

const users: User[] = [
  {
    id: "u1",
    fullName: "مدیر اصلی",
    username: "admin",
    phone: "09120000001",
    role: "ADMIN",
    isActive: true,
    isWorker: false,
    title: "مالک مجموعه",
  },
  {
    id: "u2",
    fullName: "علی احمدی",
    username: "ali",
    phone: "09120000002",
    role: "STORE_MANAGER",
    isActive: true,
    isWorker: false,
    title: "مدیر فروشگاه",
  },
  {
    id: "u3",
    fullName: "رضا کریمی",
    username: "reza",
    phone: "09120000003",
    role: "EMPLOYEE",
    isActive: true,
    isWorker: false,
    title: "فروشنده",
  },
  {
    id: "u4",
    fullName: "حسن محمدی",
    username: "hasan",
    phone: "09120000004",
    role: "MECHANIC",
    isActive: true,
    isWorker: true,
    title: "مکانیک ارشد",
  },
  {
    id: "u5",
    fullName: "سارا رضایی",
    username: "sara",
    phone: "09120000005",
    role: "MECHANIC",
    isActive: true,
    isWorker: true,
    title: "مکانیک",
  },
];

const initialState: State = {
  currentUserId: null,
  currency: "TOMAN",
  users,
  purchases: [
    {
      id: "b1",
      size: "L (بزرگ)",
      brand: "Specialized Rockhopper",
      color: "سبز نظامی",
      bikeType: "SPORT",
      purchasePrice: 32_000_000,
      description: "کوهستان ۲۹ اینچ، دنده شیمانو",
      createdBy: "u3",
      status: "APPROVED",
      createdAt: ago(30),
    },
    {
      id: "b2",
      size: "M (متوسط)",
      brand: "Giant Talon 2",
      color: "آبی",
      bikeType: "SPORT",
      purchasePrice: 28_500_000,
      description: "",
      createdBy: "u3",
      status: "PENDING",
      createdAt: ago(6),
    },
    {
      id: "b3",
      size: "XL (بسیار بزرگ)",
      brand: "Scott Scale 965",
      color: "مشکی مات",
      bikeType: "BOY",
      purchasePrice: 55_000_000,
      description: "بدنه کربن",
      createdBy: "u2",
      status: "SYNCED_TO_ACCOUNTING",
      accountingRef: "ACC-1402-092",
      createdAt: ago(72),
    },
  ],
  expenses: [
    {
      id: "e1",
      category: "SALARY",
      amount: 5_000_000,
      date: ago(50),
      description: "حقوق پرسنل مهر ماه",
      relatedUserId: "u4",
      createdBy: "u2",
      status: "APPROVED",
    },
    {
      id: "e2",
      category: "BONUS",
      amount: 1_200_000,
      date: ago(80),
      description: "پاداش حسن بابت انجام کار",
      relatedUserId: "u4",
      createdBy: "u5",
      status: "PENDING",
    },
    {
      id: "e3",
      category: "MISCELLANEOUS",
      amount: 150_000,
      date: ago(100),
      description: "تنقلات کارگاه",
      createdBy: "u1",
      status: "APPROVED",
    },
    {
      id: "e4",
      category: "PERSONAL_WITHDRAWAL",
      amount: 3_500_000,
      date: ago(150),
      description: "خرید ابزار جدید",
      createdBy: "u1",
      status: "PENDING",
    },
  ],
  tasks: [
    {
      id: "t1",
      workerId: "u4",
      title: "سرویس کامل کوهستان جاینت",
      description: "تنظیم دنده، روغن‌کاری زنجیر و بالانس چرخ",
      priority: "HIGH",
      dueDate: ago(-24),
      wage: 350_000,
      status: "IN_PROGRESS",
      createdBy: "u2",
      createdAt: ago(10),
    },
    {
      id: "t2",
      workerId: "u4",
      title: "تعویض لنت ترمز دیسکی",
      description: "لنت رزینی شیمانو",
      priority: "MEDIUM",
      dueDate: ago(-48),
      wage: 120_000,
      status: "PENDING",
      createdBy: "u2",
      createdAt: ago(8),
    },
    {
      id: "t3",
      workerId: "u4",
      title: "هواگیری ترمز هیدرولیک",
      description: "",
      priority: "LOW",
      dueDate: ago(24),
      wage: 180_000,
      status: "SUBMITTED",
      createdBy: "u2",
      completedNote: "هواگیری انجام شد و تست گرفته شد.",
      createdAt: ago(40),
    },
    {
      id: "t4",
      workerId: "u5",
      title: "تعویض طوقه چرخ جلو",
      description: "",
      priority: "MEDIUM",
      wage: 250_000,
      finalWage: 250_000,
      status: "APPROVED",
      createdBy: "u2",
      createdAt: ago(90),
    },
  ],
  invoices: [
    {
      id: "i1",
      invoiceNumber: "INV-2023-085",
      supplier: "شرکت قطعات شیمانو ایران",
      date: ago(30),
      status: "PURCHASED",
      notes: "",
      createdBy: "u2",
      items: [
        {
          id: "i1a",
          productName: "لاستیک کوهستان ۲۹ اینچ",
          probableQty: 20,
          probableUnitPrice: 1_200_000,
        },
        { id: "i1b", productName: "زنجیر ۱۰ سرعته", probableQty: 15, probableUnitPrice: 850_000 },
      ],
    },
    {
      id: "i2",
      invoiceNumber: "INV-2023-086",
      supplier: "لوازم یدکی کوهستان",
      date: ago(20),
      status: "PRE_INVOICE",
      notes: "منتظر تأیید قیمت",
      createdBy: "u2",
      items: [
        { id: "i2a", productName: "ترمز دیسکی هیدرولیک", probableQty: 8, probableUnitPrice: 1_600_000 },
      ],
    },
    {
      id: "i3",
      invoiceNumber: "INV-2023-084",
      supplier: "واردات دوچرخه جاینت",
      date: ago(120),
      status: "FINALIZED",
      notes: "تحویل در انبار مرکزی",
      createdBy: "u2",
      items: [
        {
          id: "i3a",
          productName: "لاستیک کوهستان ۲۹ اینچ (۲۰ عدد)",
          probableQty: 20,
          probableUnitPrice: 1_200_000,
          finalQty: 20,
          finalUnitPrice: 1_250_000,
        },
        {
          id: "i3b",
          productName: "زنجیر ۱۰ سرعته شیمانو (۱۵ عدد)",
          probableQty: 15,
          probableUnitPrice: 850_000,
          finalQty: 15,
          finalUnitPrice: 800_000,
        },
      ],
    },
  ],
  notifications: [
    {
      id: "n1",
      userRole: ["ADMIN", "STORE_MANAGER"],
      title: "ثبت خرید جدید",
      body: "سفارش قطعات شیمانو با موفقیت ثبت شد و در حال پردازش است.",
      url: "/purchase-invoices",
      type: "invoice",
      priority: "NORMAL",
      isRead: false,
      createdAt: ago(2),
    },
    {
      id: "n2",
      userRole: ["ADMIN", "STORE_MANAGER", "MECHANIC"],
      title: "تعمیر دوچرخه کوهستان",
      body: "وظیفه سرویس دوره‌ای توسط علی محمدی انجام شد.",
      url: "/tasks",
      type: "task",
      priority: "NORMAL",
      isRead: false,
      createdAt: ago(5),
    },
    {
      id: "n3",
      userRole: ["ADMIN"],
      title: "دریافت هزینه فاکتور",
      body: "مبلغ ۲,۵۰۰,۰۰۰ تومان برای فاکتور #۱۰۴۲ واریز شد.",
      url: "/expenses",
      type: "expense",
      priority: "NORMAL",
      isRead: true,
      createdAt: ago(28),
    },
  ],
};

const KEY = "veloflow-state-v1";

type Ctx = {
  state: State;
  setState: (updater: (s: State) => State) => void;
  user: User | null;
  login: (username: string) => boolean;
  logout: () => void;
  notify: (n: Omit<AppNotification, "id" | "isRead" | "createdAt">) => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setRaw] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setRaw({ ...initialState, ...(JSON.parse(saved) as State) });
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value = useMemo<Ctx>(() => {
    const setState = (updater: (s: State) => State) => setRaw((s) => updater(s));
    return {
      state,
      setState,
      user: state.users.find((u) => u.id === state.currentUserId) ?? null,
      login: (username: string) => {
        const found = state.users.find((u) => u.username === username.trim() && u.isActive);
        if (!found) return false;
        setRaw((s) => ({ ...s, currentUserId: found.id }));
        return true;
      },
      logout: () => setRaw((s) => ({ ...s, currentUserId: null })),
      notify: (n) =>
        setRaw((s) => ({
          ...s,
          notifications: [
            { ...n, id: `n${Date.now()}`, isRead: false, createdAt: new Date().toISOString() },
            ...s.notifications,
          ],
        })),
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
  expenses: ["ADMIN", "STORE_MANAGER", "EMPLOYEE"],
  tasks: ["ADMIN", "STORE_MANAGER", "EMPLOYEE", "MECHANIC"],
  invoices: ["ADMIN", "STORE_MANAGER"],
  notifications: ["ADMIN", "STORE_MANAGER", "EMPLOYEE", "MECHANIC"],
  users: ["ADMIN"],
  settings: ["ADMIN"],
  exports: ["ADMIN", "STORE_MANAGER"],
  approve: ["ADMIN", "STORE_MANAGER"],
  syncAccounting: ["ADMIN"],
  personalWithdrawal: ["ADMIN", "STORE_MANAGER"],
};

export function can(role: Role | undefined, key: keyof typeof CAN | string) {
  if (!role) return false;
  return (CAN[key] ?? []).includes(role);
}
