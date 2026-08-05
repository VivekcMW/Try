"use client";
import { useEffect, useState } from "react";
import {
  Megaphone,
  Send,
  Clock,
  Users,
  Loader2,
  CheckCircle,
  Smartphone,
  AlertTriangle,
  InboxIcon,
} from "lucide-react";

type Broadcast = {
  id: string;
  title: string;
  message: string;
  sentTo: number;
  createdAt: string;
};

export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Load past broadcasts
  useEffect(() => {
    fetch("/api/merchant/broadcasts")
      .then((r) => r.json())
      .then((data) => {
        if (data.broadcasts) setBroadcasts(data.broadcasts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSend() {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/merchant/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(
          `Sent to ${data.sentTo} customer${data.sentTo !== 1 ? "s" : ""}!`
        );
        setTitle("");
        setMessage("");
        setBroadcasts((prev) => [data.broadcast, ...prev]);
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        alert(data.error || "Failed to send");
      }
    } catch {
      alert("Failed to send broadcast");
    } finally {
      setSending(false);
    }
  }

  const lastReach =
    broadcasts.length > 0 ? broadcasts[0].sentTo : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-md">
            <Megaphone className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Broadcast to Customers</h1>
            <p className="text-sm text-gray-500">
              Send push notifications to all your past customers
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Compose */}
        <div className="space-y-4">
          {/* Compose card */}
          <div className="bg-white rounded-md border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Compose Announcement
            </h2>

            {/* Title */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder='e.g., "Diwali Sale This Weekend!"'
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {title.length}/100
              </p>
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder='e.g., "Get 20% off on all items from Friday to Sunday. Visit us in-store or order online!"'
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {message.length}/500
              </p>
            </div>

            {/* Preview */}
            {(title || message) && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  Notification preview
                </p>
                <div className="bg-gray-900 rounded-md px-4 py-3 text-white shadow-md">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded bg-violet-500 flex items-center justify-center">
                      <Megaphone className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-xs text-gray-300">Lokul</span>
                  </div>
                  <p className="text-sm font-semibold leading-tight">
                    {title || "Your title here"}
                  </p>
                  <p className="text-xs text-gray-300 mt-0.5 line-clamp-2">
                    {message || "Your message here"}
                  </p>
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-0.5">Use sparingly</p>
                  <p>
                    This will send a push notification to{" "}
                    {lastReach !== null
                      ? `~${lastReach} customer${lastReach !== 1 ? "s" : ""}`
                      : "all customers"}{" "}
                    who have ordered from you. Too many broadcasts may cause
                    customers to disable notifications.
                  </p>
                </div>
              </div>
            </div>

            {/* Success */}
            {successMsg && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-sm text-green-700 font-medium">{successMsg}</p>
              </div>
            )}

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim()}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-md transition-colors text-sm"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Broadcast
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: History */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Past Broadcasts
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="bg-white rounded-md border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center">
              <InboxIcon className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">
                No broadcasts yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Send your first announcement to let customers know about your
                latest offers!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-md border border-gray-200 shadow-sm p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {b.title}
                    </p>
                    <div className="flex items-center gap-1 shrink-0 bg-violet-50 text-violet-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      <Users className="w-3 h-3" />
                      {b.sentTo}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {b.message}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(b.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
