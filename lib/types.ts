export type ProductSource = "imported" | "local";
export type ProductOrigin = "manual" | "alibaba";
export type Availability = "in_stock" | "preorder" | "out_of_stock";

export type SellerType = "manufacturer" | "vendor";

export type Store = {
  id: string;
  slug: string;
  name: string;
  type: SellerType;
  /** Alaba's own store. */
  isPlatform: boolean;
  verified: boolean;
  tagline: string;
  description: string;
  city: string;
  state: string;
  joinedAt: string;
  plan: "free" | "pro";
  /** Free delivery when this store's part of an order is at least this amount (kobo). */
  freeDeliveryOverKobo: number | null;
  /** Computed from platform events, never entered by the seller. */
  metrics: {
    responseHours: number;
    fulfilmentRate: number;
    cancellationRate: number;
    onTimeRate: number;
    avgDispatchDays: number;
    rating: number;
    reviewCount: number;
    ordersCompleted: number;
  };
  manufacturing?: {
    moq: string;
    capacity: string;
    leadTime: string;
    customization: string[];
    certifications: string[];
  };
};

export type Brand = {
  slug: string;
  name: string;
  /** Registered by the brand owner through Alaba brand onboarding. */
  official: boolean;
  country: string;
  description: string;
};

export type Variant = {
  id: string;
  sku: string;
  options: Record<string, string>;
  /** Imported only: supplier price in RMB fen. */
  supplierPriceFen?: number;
  /** Local only: price in kobo. */
  priceKobo?: number;
  compareAtKobo?: number;
  stock: number;
};

export type WholesaleTier = { minQty: number; discount: number };

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
  /** Brand slug. Required for every product. */
  brand: string;
  storeId: string;
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
  variants: Variant[];
  /** Quantity discounts for wholesale buyers. */
  wholesale: WholesaleTier[];
  /** Delivery cost is already included in the price. */
  freeDelivery: boolean;
  /** TikTok or Instagram link only, validated on save. */
  videoUrl?: string;
  condition: "new" | "refurbished" | "used";
  warranty?: string;
  rating: number;
  reviewCount: number;
  sold: number;
  createdAt: string;
  tags: string[];
};

export type PublicVariant = {
  id: string;
  sku: string;
  options: Record<string, string>;
  priceKobo: number;
  compareAtKobo?: number;
  stock: number;
};

export type StoreSummary = Pick<Store, "id" | "slug" | "name" | "type" | "verified" | "isPlatform" | "city" | "state" | "joinedAt"> & {
  rating: number;
  responseHours: number;
};

/** A product as the storefront sees it: computed naira prices, no supplier cost. */
export type PublicProduct = Omit<Product, "supplierPriceFen" | "priceKobo" | "variants"> & {
  /** Lowest variant price. */
  priceKobo: number;
  estShippingKobo: number;
  variants: PublicVariant[];
  store: StoreSummary;
  brandName: string;
  brandOfficial: boolean;
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

export type PaymentProvider = "paystack";

export type CarrierId = "gig" | "jumia";
export type DeliveryMethod = "door" | "pickup";

export type PayoutStatus = "not_applicable" | "held" | "awaiting_approval" | "approved" | "paid" | "frozen";

/** One store's part of a customer order: shipped and tracked separately. */
export type StoreOrder = {
  storeId: string;
  storeName: string;
  itemIndexes: number[];
  carrier: CarrierId;
  method: DeliveryMethod;
  trackingNumber: string | null;
  deliveryKobo: number;
  freeDelivery: boolean;
  subtotalKobo: number;
  commissionKobo: number;
  payout: PayoutStatus;
};

export type OrderItem = {
  productId: string;
  variantId: string;
  storeId: string;
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
  carrier: CarrierId;
  storeOrders: StoreOrder[];
  deliveryConfirmedAt: string | null;
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
