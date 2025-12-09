// types.ts

export enum InvoiceStatus {
    Paid = 'Paid',
    Due = 'Due',
    Overdue = 'Overdue',
}

export interface InvoiceItem {
    id: string | number;
    productId: string | null;
    description: string;
    sku: string;
    quantity: number;
    price: number;
}

export interface Invoice {
    id: string;
    customer: string;
    date: string;
    dueDate: string;
    items: InvoiceItem[];
    status: InvoiceStatus;
}

export enum BillStatus {
    Paid = 'Paid',
    Pending = 'Pending',
    Upcoming = 'Upcoming',
}

export interface Bill {
    id: string;
    vendor: string;
    date: string;
    dueDate: string;
    amount: number;
    status: BillStatus;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    stock: number;
    price: number;
}

export interface ChartData {
    name: string;
    income: number;
    expense: number;
}

export enum ContactType {
    Customer = 'Customer',
    Vendor = 'Vendor',
}

export interface Contact {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    type: ContactType;
}

export enum AccountType {
    Revenue = 'Revenue',
    Expense = 'Expense',
}

export interface LedgerEntry {
    id: string;
    date: string;
    account: string;
    type: AccountType;
    amount: number;
}

export enum DealStatus {
    Prospect = 'Prospect',
    Qualification = 'Qualification',
    Negotiation = 'Negotiation',
    Won = 'Won',
    Lost = 'Lost',
}

export interface Deal {
    id: string;
    name: string;
    company: string;
    value: number;
    status: DealStatus;
    leadScore?: number;
    nextAction?: string;
}

export interface CashFlowEntry {
    month: string;
    cashIn: number;
    cashOut: number;
}

export interface CashFlowForecast {
    forecast30: number;
    forecast60: number;
    forecast90: number;
    warning: string | null;
}

export interface ProactiveInsight {
    type: 'Anomaly' | 'Opportunity' | 'Efficiency';
    title: string;
    description: string;
}

export enum MessageAuthor {
    User = 'user',
    AI = 'ai',
}

export interface ChatMessage {
    author: MessageAuthor;
    text: string;
}

// New Types for HR and Projects
export interface Employee {
    id: string;
    name: string;
    role: string;
    department: string;
    avatarUrl: string;
    email: string;
}

export enum TaskStatus {
    ToDo = 'To Do',
    InProgress = 'In Progress',
    Done = 'Done',
}

export enum TaskPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
}

export interface Task {
    id: string;
    title: string;
    assigneeId: string;
    status: TaskStatus;
    priority: TaskPriority;
}

export interface Project {
    id: string;
    name: string;
    tasks: Task[];
}

// Types for Purchase Orders
export enum PurchaseOrderStatus {
    Draft = 'Draft',
    Sent = 'Sent',
    Fulfilled = 'Fulfilled',
    Cancelled = 'Cancelled',
}

export interface PurchaseOrderItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export interface PurchaseOrder {
    id: string;
    vendor: string;
    date: string;
    expectedDeliveryDate: string;
    items: PurchaseOrderItem[];
    totalAmount: number;
    status: PurchaseOrderStatus;
}