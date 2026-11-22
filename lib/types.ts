export type ProductSource = "imported" | "local";
export type ProductOrigin = "manual" | "alibaba";
export type Availability = "in_stock" | "preorder" | "out_of_stock";

export type Category = {
  slug: string;
  name: string;
  icon: string;
  description: string;
};

export type ProductOption = { name: string; values: string[] };

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  source: ProductSource;
  origin: ProductOrigin;
  status: "active" | "draft" | "archived";
  description: string;
  highlights: string[];
  specs: Record<string, string>;
  images: string[];
  /** Imported only: supplier price in RMB fen (admin-only, never sent to customers). */
  supplierPriceFen?: number;
  /** Local only: fixed selling price in kobo. */
  priceKobo?: number;
  /** Optional strike-through price in kobo. */
  compareAtKobo?: number;
  estWeightKg: number;
  /** Packed dimensions in cm, used for volumetric weight. */
  dimsCm: [number, number, number];
  moq: number;
  stock: number;
  availability: Availability;
  deliveryDays: [number, number];
  options: ProductOption[];
  rating: number;
  reviewCount: number;
  sold: number;
  createdAt: string;
  tags: string[];
};

/** A product as the storefront sees it: computed naira price, no supplier cost. */
export type PublicProduct = Omit<Product, "supplierPriceFen" | "priceKobo"> & {
  priceKobo: number;
  estShippingKobo: number;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verified: boolean;
};

export type OrderStage =
  | "pending_payment"
  | "paid"
  | "sourcing"
  | "purchased"
  | "china_warehouse"
  | "awaiting_balance"
  | "dispatched"
  | "arrived_ng"
  | "customs_cleared"
  | "ng_warehouse"
  | "out_for_delivery"
  | "ready_for_pickup"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentProvider = "paystack" | "flutterwave";

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  source: ProductSource;
  options: Record<string, string>;
  quantity: number;
  unitPriceKobo: number;
  estWeightKg: number;
  actualWeightKg?: number;
  supplierCostFen?: number;
};

export type OrderEvent = {
  stage: OrderStage;
  at: string;
  by: string;
  note?: string;
};

export type Order = {
  id: string;
  number: string;
  customerId: string | null;
  customerName: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    city: string;
    state: string;
  };
  fulfilment: "delivery" | "pickup";
  pickupPoint?: string;
  items: OrderItem[];
  stage: OrderStage;
  events: OrderEvent[];
  provider: PaymentProvider;
  totals: {
    itemsKobo: number;
    intlShippingKobo: number;
    clearanceKobo: number;
    localDeliveryKobo: number;
    discountKobo: number;
    vatKobo: number;
    totalKobo: number;
    paidKobo: number;
    balanceDueKobo: number;
    gatewayFeeKobo: number;
  };
  costs: {
    supplierKobo: number;
    intlShippingKobo: number;
    localDeliveryKobo: number;
  };
  fxRate: number;
  trackingNumbers: string[];
  assignedTo?: string;
  notes: string[];
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  joinedAt: string;
  marketingOptIn: boolean;
};

export type StaffRole =
  | "super_admin"
  | "order_manager"
  | "product_manager"
  | "warehouse"
  | "support"
  | "finance";

export type Staff = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  lastActiveAt: string;
};

export type Supplier = {
  id: string;
  name: string;
  city: string;
  contact: string;
  platform: string;
  onTimeRate: number;
  defectRate: number;
  ordersCount: number;
  spendFen: number;
};

export type Shipment = {
  id: string;
  code: string;
  agent: string;
  waybill: string;
  orderNumbers: string[];
  chargeableKg: number;
  costKobo: number;
  stage: "packing" | "dispatched" | "arrived_ng" | "customs_cleared" | "received";
  dispatchedAt?: string;
  etaAt?: string;
};

export type Discount = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSpendKobo: number;
  firstOrderOnly: boolean;
  usageLimit: number | null;
  used: number;
  expiresAt: string | null;
  active: boolean;
};

export type Ticket = {
  id: string;
  orderNumber: string | null;
  customerName: string;
  subject: string;
  status: "open" | "pending" | "resolved";
  updatedAt: string;
  lastMessage: string;
};

export type AuditEntry = {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
};
