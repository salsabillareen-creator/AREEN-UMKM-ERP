// constants.ts

import { Invoice, Bill, Product, ChartData, InvoiceStatus, BillStatus, Contact, ContactType, LedgerEntry, AccountType, Deal, DealStatus, CashFlowEntry, Employee, Project, Task, TaskStatus, TaskPriority, PurchaseOrder, PurchaseOrderStatus, SalesOrder, SalesOrderStatus } from './types';

// FIX: Renamed MOCK_INVOVICES to MOCK_INVOICES to fix typo.
export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-001', customer: 'Stark Industries', date: '2023-10-01', dueDate: '2023-10-31', status: InvoiceStatus.Paid, items: [
    { id: 1, productId: null, sku: 'N/A', description: 'Mark 42 Armor Plating', quantity: 50, price: 200000000 },
    { id: 2, productId: null, sku: 'N/A', description: 'Arc Reactor Core', quantity: 5, price: 500000000 },
  ]},
  { id: 'INV-002', customer: 'Wayne Enterprises', date: '2023-10-05', dueDate: '2023-11-04', status: InvoiceStatus.Due, items: [
    { id: 1, productId: 'PROD-05', sku: 'TE-5005', description: 'Turbo Encabulator', quantity: 2, price: 12500000 },
    { id: 2, productId: 'PROD-04', sku: 'FC-4004', description: 'Flux Capacitor Casing', quantity: 10, price: 2800000 },
  ]},
  { id: 'INV-003', customer: 'Cyberdyne Systems', date: '2023-09-15', dueDate: '2023-10-15', status: InvoiceStatus.Overdue, items: [
    { id: 1, productId: null, sku: 'N/A', description: 'T-800 Endoskeleton Chassis', quantity: 1, price: 200000000 },
    { id: 2, productId: null, sku: 'N/A', description: 'Neural Net Processor', quantity: 1, price: 50075000 },
  ]},
  { id: 'INV-004', customer: 'Ollivanders Wand Shop', date: '2023-10-10', dueDate: '2023-11-09', status: InvoiceStatus.Due, items: [
      { id: 1, productId: 'PROD-03', sku: 'NG-3003', description: 'Nano Gear', quantity: 100, price: 185000 },
      { id: 2, productId: null, sku: 'N/A', description: 'Wand Polishing Service', quantity: 5, price: 1500000 },
  ]},
  { id: 'INV-005', customer: 'Acme Corporation', date: '2023-10-12', dueDate: '2023-10-28', status: InvoiceStatus.Paid, items: [
      { id: 1, productId: 'PROD-01', sku: 'QW-1001', description: 'Quantum Widget', quantity: 10, price: 350000 },
      { id: 2, productId: 'PROD-02', sku: 'HS-2002', description: 'Hyper Sprocket', quantity: 5, price: 750000 },
  ]},
  { id: 'INV-006', customer: 'Gekko & Co', date: '2023-10-20', dueDate: '2023-11-19', status: InvoiceStatus.Due, items: [
      { id: 1, productId: null, sku: 'N/A', description: 'Suspender Sharpening Service', quantity: 5, price: 3500000 },
  ]},
];

export const MOCK_BILLS: Bill[] = [
    { id: 'BILL-101', vendor: 'Globex Corporation', date: '2023-10-02', dueDate: '2023-11-01', amount: 7500000, status: BillStatus.Pending },
    { id: 'BILL-102', vendor: 'Initech', date: '2023-09-28', dueDate: '2023-10-28', amount: 4500000, status: BillStatus.Paid },
    { id: 'BILL-103', vendor: 'Massive Dynamic', date: '2023-10-15', dueDate: '2023-11-14', amount: 12000000, status: BillStatus.Upcoming },
    { id: 'BILL-104', vendor: 'Stark Industries', date: '2023-10-18', dueDate: '2023-11-17', amount: 3000000, status: BillStatus.Upcoming },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'PROD-01', name: 'Quantum Widget', sku: 'QW-1001', category: 'Widgets', stock: 150, price: 350000 },
  { id: 'PROD-02', name: 'Hyper Sprocket', sku: 'HS-2002', category: 'Sprockets', stock: 80, price: 750000 },
  { id: 'PROD-03', name: 'Nano Gear', sku: 'NG-3003', category: 'Gears', stock: 7, price: 185000 },
  { id: 'PROD-04', name: 'Flux Capacitor Casing', sku: 'FC-4004', category: 'Components', stock: 25, price: 2800000 },
  { id: 'PROD-05', name: 'Turbo Encabulator', sku: 'TE-5005', category: 'Machinery', stock: 10, price: 12500000 },
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  { 
    id: 'PO-001', 
    vendor: 'Globex Corporation', 
    date: '2023-10-25', 
    expectedDeliveryDate: '2023-11-10', 
    items: [
        { productId: 'PROD-01', productName: 'Quantum Widget', quantity: 50, unitPrice: 325000 },
        { productId: 'PROD-02', productName: 'Hyper Sprocket', quantity: 20, unitPrice: 720000 },
    ],
    totalAmount: 30650000, 
    status: PurchaseOrderStatus.Sent 
  },
  { 
    id: 'PO-002', 
    vendor: 'Massive Dynamic', 
    date: '2023-10-28', 
    expectedDeliveryDate: '2023-11-15', 
    items: [
        { productId: 'PROD-04', productName: 'Flux Capacitor Casing', quantity: 10, unitPrice: 2750000 },
    ],
    totalAmount: 27500000, 
    status: PurchaseOrderStatus.Fulfilled 
  },
   { 
    id: 'PO-003', 
    vendor: 'Initech', 
    date: '2023-11-01', 
    expectedDeliveryDate: '2023-11-20', 
    items: [
        { productId: 'PROD-05', productName: 'Turbo Encabulator', quantity: 5, unitPrice: 12000000 },
    ],
    totalAmount: 60000000, 
    status: PurchaseOrderStatus.Draft 
  },
];

export const MOCK_SALES_ORDERS: SalesOrder[] = [
    {
        id: 'SO-1001',
        customer: 'Stark Industries',
        date: '2023-11-01',
        expectedDeliveryDate: '2023-11-10',
        totalAmount: 150000000,
        status: SalesOrderStatus.Confirmed,
        items: [
            { productId: 'PROD-01', productName: 'Quantum Widget', quantity: 100, unitPrice: 350000 },
            { productId: 'PROD-05', productName: 'Turbo Encabulator', quantity: 2, unitPrice: 12500000 }
        ]
    },
    {
        id: 'SO-1002',
        customer: 'Wayne Enterprises',
        date: '2023-11-03',
        expectedDeliveryDate: '2023-11-15',
        totalAmount: 7500000,
        status: SalesOrderStatus.Draft,
        items: [
            { productId: 'PROD-02', productName: 'Hyper Sprocket', quantity: 10, unitPrice: 750000 }
        ]
    },
    {
        id: 'SO-1003',
        customer: 'Cyberdyne Systems',
        date: '2023-11-05',
        expectedDeliveryDate: '2023-11-20',
        totalAmount: 56000000,
        status: SalesOrderStatus.Shipped,
        items: [
            { productId: 'PROD-04', productName: 'Flux Capacitor Casing', quantity: 20, unitPrice: 2800000 }
        ]
    }
];

export const MOCK_CHART_DATA: ChartData[] = [
    { name: 'Jan', income: 40000000, expense: 24000000 },
    { name: 'Feb', income: 30000000, expense: 13980000 },
    { name: 'Mar', income: 50000000, expense: 38000000 },
    { name: 'Apr', income: 47800000, expense: 39080000 },
    { name: 'May', income: 58900000, expense: 48000000 },
    { name: 'Jun', income: 63900000, expense: 58000000 },
    { name: 'Jul', income: 74900000, expense: 63000000 },
];

export const MOCK_CONTACTS: Contact[] = [
    { id: 'CUST-001', name: 'Tony Stark', company: 'Stark Industries', email: 'tony@starkind.com', phone: '555-123-4567', type: ContactType.Customer },
    { id: 'VEND-001', name: 'Hank Scorpio', company: 'Globex Corporation', email: 'h.scorpio@globex.com', phone: '555-987-6543', type: ContactType.Vendor },
    { id: 'CUST-002', name: 'Bruce Wayne', company: 'Wayne Enterprises', email: 'bruce@wayne.com', phone: '555-111-2222', type: ContactType.Customer },
    { id: 'VEND-002', name: 'Bill Lumbergh', company: 'Initech', email: 'bill.lumbergh@initech.com', phone: '555-888-9999', type: ContactType.Vendor },
    { id: 'CUST-003', name: 'Wile E. Coyote', company: 'Acme Corporation', email: 'wile@acme.com', phone: '555-222-3333', type: ContactType.Customer },
];

export const MOCK_LEDGER_DATA: LedgerEntry[] = [
    { id: 'LED-001', date: '2023-10-31', account: 'Product Sales', type: AccountType.Revenue, amount: 62000500 },
    { id: 'LED-002', date: '2023-10-25', account: 'Service Revenue', type: AccountType.Revenue, amount: 15000000 },
    { id: 'LED-003', date: '2023-10-28', account: 'Cost of Goods Sold', type: AccountType.Expense, amount: 25000000 },
    { id: 'LED-004', date: '2023-10-30', account: 'Salaries and Wages', type: AccountType.Expense, amount: 32000000 },
    { id: 'LED-005', date: '2023-10-15', account: 'Rent Expense', type: AccountType.Expense, amount: 12000000 },
    { id: 'LED-006', date: '2023-10-10', account: 'Marketing', type: AccountType.Expense, amount: 5500250 },
    { id: 'LED-007', date: '2023-10-05', account: 'Office Supplies', type: AccountType.Expense, amount: 2500000 },
];


export const MOCK_DEALS: Deal[] = [
    { id: 'DEAL-01', name: 'Project Titan Server Upgrade', company: 'Stark Industries', value: 750000000, status: DealStatus.Negotiation },
    { id: 'DEAL-02', name: 'Annual Batmobile Maintenance', company: 'Wayne Enterprises', value: 1200000000, status: DealStatus.Qualification },
    { id: 'DEAL-03', name: 'Skynet Defense Contract', company: 'Cyberdyne Systems', value: 2500000000, status: DealStatus.Prospect },
    { id: 'DEAL-04', name: 'Explosive Tennis Balls Supply', company: 'Acme Corporation', value: 50000000, status: DealStatus.Won },
];

export const MOCK_PIPELINE_STAGES = [DealStatus.Prospect, DealStatus.Qualification, DealStatus.Negotiation, DealStatus.Won, DealStatus.Lost];

export const MOCK_CASH_FLOW: CashFlowEntry[] = [
    { month: 'Apr', cashIn: 40000000, cashOut: 24000000 },
    { month: 'May', cashIn: 45000000, cashOut: 30000000 },
    { month: 'Jun', cashIn: 50000000, cashOut: 48000000 },
    { month: 'Jul', cashIn: 48000000, cashOut: 38000000 },
    { month: 'Aug', cashIn: 55000000, cashOut: 42000000 },
    { month: 'Sep', cashIn: 60000000, cashOut: 59000000 },
];

export const MOCK_EMPLOYEES: Employee[] = [
    { id: 'EMP-001', name: 'Diana Prince', role: 'Lead Developer', department: 'Engineering', avatarUrl: 'https://i.pravatar.cc/150?u=emp001', email: 'diana.prince@aurora.ai' },
    { id: 'EMP-002', name: 'Bruce Banner', role: 'Senior Backend Engineer', department: 'Engineering', avatarUrl: 'https://i.pravatar.cc/150?u=emp002', email: 'bruce.banner@aurora.ai' },
    { id: 'EMP-003', name: 'Clark Kent', role: 'Product Manager', department: 'Product', avatarUrl: 'https://i.pravatar.cc/150?u=emp003', email: 'clark.kent@aurora.ai' },
    { id: 'EMP-004', name: 'Peter Parker', role: 'Frontend Developer', department: 'Engineering', avatarUrl: 'https://i.pravatar.cc/150?u=emp004', email: 'peter.parker@aurora.ai' },
    { id: 'EMP-005', name: 'Wanda Maximoff', role: 'UI/UX Designer', department: 'Design', avatarUrl: 'https://i.pravatar.cc/150?u=emp005', email: 'wanda.maximoff@aurora.ai' },
];

export const MOCK_PROJECT_TASKS: Task[] = [
    { id: 'TSK-01', title: 'Design new dashboard layout', assigneeId: 'EMP-005', status: TaskStatus.Done, priority: TaskPriority.High },
    { id: 'TSK-02', title: 'Develop API endpoints for CRM', assigneeId: 'EMP-002', status: TaskStatus.Done, priority: TaskPriority.High },
    { id: 'TSK-03', title: 'Implement frontend for dashboard', assigneeId: 'EMP-001', status: TaskStatus.InProgress, priority: TaskPriority.High },
    { id: 'TSK-04', title: 'Integrate new chart library', assigneeId: 'EMP-004', status: TaskStatus.InProgress, priority: TaskPriority.Medium },
    { id: 'TSK-05', title: 'Test dashboard functionality', assigneeId: 'EMP-001', status: TaskStatus.ToDo, priority: TaskPriority.Medium },
    { id: 'TSK-06', title: 'Write user documentation', assigneeId: 'EMP-003', status: TaskStatus.ToDo, priority: TaskPriority.Low },
];

export const MOCK_PROJECT_STAGES = [TaskStatus.ToDo, TaskStatus.InProgress, TaskStatus.Done];


export const MOCK_PROJECT: Project = {
    id: 'PROJ-ALPHA',
    name: 'Q4 Product Launch - "Phoenix"',
    tasks: MOCK_PROJECT_TASKS,
};

// --- New/Updated Mock Data for Aurora Dashboard ---

export const MOCK_PERFORMANCE_SUMMARY = {
    totalSales: 125000000,
    criticalStock: 7,
    urgentTasks: 3,
};

export const MOCK_AI_RECOMMENDATION = {
    title: "AI Notifications & Recommendations",
    details: "Nano Gear stock is low. Create a PO immediately.",
    insight: "AI Insight: Stark Industries frequently buys components, consider offering a discount on Flux Capacitor Casing."
};

export const MOCK_TOP_PRODUCTS_CHART = [
    { name: "Quantum Widget", value: 320 },
    { name: "Hyper Sprocket", value: 250 },
    { name: "Flux Capacitor Casing", value: 180 },
];

export const MOCK_PROJECT_STATUS_CHART = [
    { name: 'Completed', value: 75 },
    { name: 'Remaining', value: 25 },
];

export const MOCK_INCOME_VS_EXPENSE_CHART = [
    { name: 'Quantum Widget', income: 4000, expense: 2400 },
    { name: 'Hyper Sprocket', income: 3000, expense: 1398 },
    { name: 'Nano Gear', income: 2000, expense: 9800 },
    { name: 'Flux Capacitor Casing', income: 2780, expense: 3908 },
];

export const MOCK_ACTIVITY_FEED = [
    { id: 1, text: "Sales Order S-123 created by User A" },
    { id: 2, text: "Quantum Widget stock updated." },
    { id: 3, text: "Invoice I-456 has been paid." },
];