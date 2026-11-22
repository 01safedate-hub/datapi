import "server-only";
import { demoCustomer, orders } from "./data/ops";
import type { Order } from "./types";

export function getOrderByNumber(number: string) {
  return orders.find((o) => o.number.toLowerCase() === number.trim().toLowerCase()) ?? null;
}

const digits = (s: string) => s.replace(/\D/g, "").slice(-10);

/** Guest tracking: the order number plus the email or phone used at checkout. */
export function findOrderForGuest(number: string, contact: string): Order | null {
  const o = getOrderByNumber(number);
  if (!o) return null;
  const c = contact.trim().toLowerCase();
  const match = c.includes("@") ? o.email.toLowerCase() === c : digits(o.phone) === digits(c) && digits(c).length === 10;
  return match ? o : null;
}

export function getMyOrders() {
  return orders.filter((o) => o.customerId === demoCustomer.id);
}

export function getMyOrder(number: string) {
  return getMyOrders().find((o) => o.number === number) ?? null;
}

export const hasImported = (o: Order) => o.items.some((i) => i.source === "imported");
