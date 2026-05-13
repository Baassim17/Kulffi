"use client";

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { CartItem } from "@/types/cart";

const CART_KEY = "kulffi-cart-v2";
const ORDERS_KEY = "kulffi-orders";

export interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
}

export type PaymentMethod = "card" | "upi" | "netbanking" | "cod" | "wallet";

export type OrderStatus = "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

export interface PaymentInfo {
  method: PaymentMethod;
  cardNumber: string;
  expiry: string;
  cvc: string;
  nameOnCard: string;
  upiId: string;
  bankName: string;
  walletProvider: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: string;
  message: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  shipping: ShippingInfo;
  payment: PaymentInfo;
  total: number;
  date: string;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  estimatedDelivery: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;

  // Checkout
  checkoutStep: "cart" | "shipping" | "payment" | "review" | "success";
  setCheckoutStep: (step: "cart" | "shipping" | "payment" | "review" | "success") => void;
  shippingInfo: ShippingInfo;
  setShippingInfo: (info: ShippingInfo) => void;
  paymentInfo: PaymentInfo;
  setPaymentInfo: (info: PaymentInfo) => void;
  completeCheckout: () => Order;
  resetCheckout: () => void;
  lastOrder: Order | null;

  // Orders
  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
}

const CartContext = createContext<CartContextValue | null>(null);

function isCartItemArray(val: unknown): val is CartItem[] {
  if (!Array.isArray(val)) return false;
  return val.every(
    (item) =>
      typeof item === "object" && item !== null &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.price === "number" &&
      typeof item.quantity === "number" &&
      typeof item.weight === "string" &&
      typeof item.image === "string"
  );
}

function isOrderArray(val: unknown): val is Order[] {
  if (!Array.isArray(val)) return false;
  return val.every(
    (item) =>
      typeof item === "object" && item !== null &&
      typeof item.id === "string" &&
      typeof item.total === "number" &&
      typeof item.date === "string"
  );
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return isCartItemArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!isOrderArray(parsed)) return [];
    return parsed.map((order) => {
      if (!order.status) {
        return {
          ...order,
          status: "confirmed" as const,
          statusHistory: [
            {
              status: "confirmed" as const,
              timestamp: order.date,
              message: "Your order has been confirmed and is being prepared.",
            },
          ],
          estimatedDelivery: new Date(new Date(order.date).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        };
      }
      return order;
    });
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

const defaultShipping: ShippingInfo = {
  fullName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  phone: "",
  email: "",
};

const defaultPayment: PaymentInfo = {
  method: "card",
  cardNumber: "",
  expiry: "",
  cvc: "",
  nameOnCard: "",
  upiId: "",
  bankName: "",
  walletProvider: "",
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "shipping" | "payment" | "review" | "success">("cart");
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(defaultShipping);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(defaultPayment);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Refs for stable completeCheckout callback (avoids context invalidation on every keystroke)
  const itemsRef = useRef(items);
  const shippingInfoRef = useRef(shippingInfo);
  const paymentInfoRef = useRef(paymentInfo);

  useEffect(() => {
    itemsRef.current = items;
    shippingInfoRef.current = shippingInfo;
    paymentInfoRef.current = paymentInfo;
  }, [items, shippingInfo, paymentInfo]);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Hydrate from localStorage on mount only
  useEffect(() => {
    setItems(loadCart());
    setOrders(loadOrders());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    saveCart(items);
  }, [items]);

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const completeCheckout = useCallback((): Order => {
    const currentItems = itemsRef.current;
    const currentShipping = shippingInfoRef.current;
    const currentPayment = paymentInfoRef.current;
    const now = new Date();
    const estimatedDelivery = new Date(now);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    // Strip sensitive card data before persisting
    const safePayment: PaymentInfo = {
      ...currentPayment,
      cardNumber: currentPayment.cardNumber ? `**** ${currentPayment.cardNumber.slice(-4)}` : "",
      cvc: "",
    };

    const order: Order = {
      id: `KLF-${Date.now().toString(36).toUpperCase()}`,
      items: [...currentItems],
      shipping: { ...currentShipping },
      payment: safePayment,
      total: currentItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      date: now.toISOString(),
      status: "confirmed",
      statusHistory: [
        {
          status: "confirmed",
          timestamp: now.toISOString(),
          message: "Your order has been confirmed and is being prepared.",
        },
      ],
      estimatedDelivery: estimatedDelivery.toISOString(),
    };
    setOrders((prev) => [order, ...prev]);
    setLastOrder(order);
    setItems([]);
    return order;
  }, []);

  const getOrderById = useCallback((id: string) => {
    return orders.find((o) => o.id === id);
  }, [orders]);

  const resetCheckout = useCallback(() => {
    setCheckoutStep("cart");
    setShippingInfo(defaultShipping);
    setPaymentInfo(defaultPayment);
    setLastOrder(null);
  }, []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalCount,
      totalPrice,
      isOpen,
      setIsOpen,
      checkoutStep,
      setCheckoutStep,
      shippingInfo,
      setShippingInfo,
      paymentInfo,
      setPaymentInfo,
      completeCheckout,
      resetCheckout,
      lastOrder,
      orders,
      getOrderById,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalCount,
      totalPrice,
      isOpen,
      checkoutStep,
      shippingInfo,
      paymentInfo,
      completeCheckout,
      resetCheckout,
      lastOrder,
      orders,
      getOrderById,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
