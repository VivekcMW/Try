"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  kind: string;
  pricePaise: number;
  quantity: number;
  unit?: string;
  subtotalPaise: number;
  totalPaise: number;
};

type StatusHistoryItem = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  reason?: string;
  createdAt: string;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  subtotalPaise: number;
  discountPaise: number;
  deliveryFeePaise: number;
  taxPaise: number;
  totalPaise: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryMode?: string;
  deliveryAddress?: string;
  customerNotes?: string;
  merchantNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  confirmedAt?: string;
  inProgressAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    avatarUrl?: string;
    kycTier: string;
  };
  orderItems: OrderItem[];
  statusHistory: StatusHistoryItem[];
  rating?: {
    rating: number;
    review?: string;
    merchantResponse?: string;
    respondedAt?: string;
  };
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [merchantNotes, setMerchantNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [editingResponse, setEditingResponse] = useState(false);
  const [sendingResponse, setSendingResponse] = useState(false);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/merchant/orders/${orderId}`);
      const data = await res.json();
      
      if (res.ok && data.order) {
        setOrder(data.order);
        setMerchantNotes(data.order.merchantNotes || "");
      } else {
        alert("Order not found");
        router.push("/merchant/orders");
      }
    } catch (error) {
      console.error("Failed to load order:", error);
      alert("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const updateStatus = async (action: string, reason?: string) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`/api/merchant/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      if (res.ok) {
        await loadOrder();
        setShowRejectModal(false);
        setRejectReason("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const saveMerchantNotes = async () => {
    if (!order) return;
    
    try {
      await fetch(`/api/merchant/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantNotes }),
      });
      alert("Notes saved");
    } catch (error) {
      console.error("Failed to save notes:", error);
      alert("Failed to save notes");
    }
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) return;
    setSendingResponse(true);
    try {
      const res = await fetch(`/api/merchant/orders/${orderId}/review-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: responseText.trim() }),
      });
      if (res.ok) {
        alert("Response sent successfully");
        setShowResponseInput(false);
        setEditingResponse(false);
        setResponseText("");
        await loadOrder();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send response");
      }
    } catch (error) {
      console.error("Failed to send response:", error);
      alert("Failed to send response");
    } finally {
      setSendingResponse(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800" },
      in_progress: { label: "In Progress", className: "bg-purple-100 text-purple-800" },
      completed: { label: "Completed", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
    };
    const badge = badges[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/merchant/orders"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {new Date(order.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Customer & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Customer Information</h2>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-medium text-gray-600">
                {order.customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{order.customer.name}</p>
                <p className="text-sm text-gray-600">{order.customer.phone}</p>
                <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  {order.customer.kycTier} KYC
                </span>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${order.customer.phone}`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 transition hover:bg-gray-50"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href={`https://wa.me/${order.customer.phone.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 transition hover:bg-gray-50"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Delivery Details */}
            {order.deliveryMode && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.deliveryMode === "home_delivery" ? "Home Delivery" : "Self Pickup"}
                    </p>
                    {order.deliveryAddress && (
                      <p className="mt-1 text-sm text-gray-600">{order.deliveryAddress}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Customer Notes */}
            {order.customerNotes && (
              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm font-medium text-yellow-900">Customer Notes:</p>
                <p className="mt-1 text-sm text-yellow-800">{order.customerNotes}</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Order Items</h2>
            <div className="space-y-3">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <Package className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        ₹{(item.pricePaise / 100).toFixed(2)}
                        {item.unit && ` per ${item.unit}`} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ₹{(item.totalPaise / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₹{(order.subtotalPaise / 100).toFixed(2)}</span>
              </div>
              {order.discountPaise > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-₹{(order.discountPaise / 100).toFixed(2)}</span>
                </div>
              )}
              {order.deliveryFeePaise > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-900">₹{(order.deliveryFeePaise / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">₹{(order.totalPaise / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Method:</span>
                <span className="text-sm font-medium text-gray-900">{order.paymentMethod.toUpperCase()}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Status:</span>
                <span className={`text-sm font-medium ${order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Merchant Notes */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Internal Notes</h2>
            <textarea
              value={merchantNotes}
              onChange={(e) => setMerchantNotes(e.target.value)}
              placeholder="Add notes about this order (visible only to you)"
              rows={4}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button
              onClick={saveMerchantNotes}
              className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Save Notes
            </button>
          </div>
        </div>

        {/* Right Column: Status Timeline & Actions */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Status Timeline</h2>
            <div className="space-y-4">
              {order.statusHistory.map((history, index) => (
                <div key={history.id} className="flex gap-3">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        history.toStatus === "completed"
                          ? "bg-green-100 text-green-600"
                          : history.toStatus === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {history.toStatus === "completed" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : history.toStatus === "cancelled" ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    {index < order.statusHistory.length - 1 && (
                      <div className="h-full w-0.5 bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {history.toStatus.replace("_", " ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(history.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {history.reason && (
                      <p className="mt-1 text-xs text-gray-600">{history.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Actions</h2>
            <div className="space-y-3">
              {order.status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus("confirm")}
                    disabled={updating}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Accept Order
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={updating}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-600 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Order
                  </button>
                </>
              )}

              {order.status === "confirmed" && (
                <button
                  onClick={() => updateStatus("start")}
                  disabled={updating}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                  Start Preparation
                </button>
              )}

              {order.status === "in_progress" && (
                <button
                  onClick={() => updateStatus("complete")}
                  disabled={updating}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Mark as Ready/Complete
                </button>
              )}

              {order.status !== "completed" && order.status !== "cancelled" && (
                <button
                  onClick={() => updateStatus("cancel", "Cancelled by merchant")}
                  disabled={updating}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Rating */}
          {order.rating && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Customer Rating</h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-yellow-500">
                  {"★".repeat(order.rating.rating)}{"☆".repeat(5 - order.rating.rating)}
                </span>
                <span className="text-sm text-gray-600">({order.rating.rating}/5)</span>
              </div>
              {order.rating.review && (
                <p className="mt-3 text-sm text-gray-600">{order.rating.review}</p>
              )}

              {/* Respond to Review */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                {order.rating.merchantResponse && !editingResponse ? (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Your Response
                    </p>
                    <blockquote className="rounded-lg border-l-4 border-blue-400 bg-blue-50 px-4 py-3 text-sm text-gray-700 italic">
                      {order.rating.merchantResponse}
                    </blockquote>
                    <button
                      onClick={() => {
                        setResponseText(order.rating!.merchantResponse ?? "");
                        setEditingResponse(true);
                        setShowResponseInput(true);
                      }}
                      className="mt-2 text-xs font-medium text-blue-600 underline hover:text-blue-800"
                    >
                      Edit
                    </button>
                  </div>
                ) : showResponseInput ? (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      {editingResponse ? "Edit your response" : "Reply to this review"}
                    </p>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value.slice(0, 500))}
                      placeholder="Write a professional, helpful response..."
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-400 text-right">
                      {responseText.length}/500
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => {
                          setShowResponseInput(false);
                          setEditingResponse(false);
                          setResponseText("");
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendResponse}
                        disabled={!responseText.trim() || sendingResponse}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        {sendingResponse && <Loader2 className="h-3 w-3 animate-spin" />}
                        Send Response
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResponseInput(true)}
                    className="text-sm font-medium text-blue-600 underline hover:text-blue-800"
                  >
                    Reply to this review
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Reject Order</h2>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              Please provide a reason for rejecting this order:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Out of stock, Too busy, Closing early..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus("reject", rejectReason)}
                disabled={!rejectReason.trim() || updating}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
