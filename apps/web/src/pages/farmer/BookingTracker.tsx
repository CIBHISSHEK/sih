import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { getSocket } from "../../api/socket";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { BackButton } from "../../components/NavButtons";

const TIMELINE = ["CONFIRMED", "IN_QUEUE", "ARRIVED", "PROCESSING", "COMPLETED", "PAID"];

interface NotificationItem {
  type: string;
  message: string;
  createdAt: string;
}

export default function BookingTracker() {
  const { id } = useParams();
  const { farmer } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [etaMin, setEtaMin] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  async function refresh() {
    const { data } = await api.get(`/bookings/${id}`);
    setBooking(data.booking);
    setQueuePosition(data.queuePosition);
    setEtaMin(data.etaMin);
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    if (!farmer) return;
    const socket = getSocket();
    socket.emit("join:farmer", farmer.id);

    const onStatus = (payload: { bookingId: string; status: string }) => {
      if (payload.bookingId !== id) return;
      refresh();
    };
    const onQueue = () => refresh();
    const onNotification = (payload: NotificationItem) => setNotifications((n) => [payload, ...n]);

    socket.on("booking:status", onStatus);
    socket.on("queue:update", onQueue);
    socket.on("notification:new", onNotification);
    return () => {
      socket.off("booking:status", onStatus);
      socket.off("queue:update", onQueue);
      socket.off("notification:new", onNotification);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmer, id]);

  if (!booking) return <div className="p-6 text-gray-400">{t.common.loading}</div>;

  const isTerminalBad = ["CANCELLED", "NO_SHOW"].includes(booking.status);
  const activeIdx = TIMELINE.indexOf(booking.status);

  async function cancelBooking() {
    if (!confirm("Cancel this booking?")) return;
    await api.delete(`/bookings/${id}`);
    refresh();
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6">
      <BackButton onClick={() => navigate("/farmer")} label={t.common.back} />

      <div className="card bg-brand-gradient text-white p-6 text-center mb-4 border-0">
        <p className="text-sm text-brand-50/80">{t.bookingTracker.token}</p>
        <p className="text-4xl font-display font-extrabold tracking-wide">{booking.tokenNumber}</p>
        <div className="flex justify-center gap-8 mt-4">
          <div>
            <p className="text-xs text-brand-50/70">{t.bookingTracker.arrivalOtp}</p>
            <p className="text-2xl font-bold">{booking.arrivalOtp}</p>
          </div>
          <div>
            <p className="text-xs text-brand-50/70">{t.bookingTracker.slot}</p>
            <p className="text-2xl font-bold">{booking.slot.startTime}</p>
          </div>
        </div>
        <p className="text-sm text-brand-50/80 mt-3">{booking.centre.name} · {booking.slot.date}</p>
      </div>

      {!isTerminalBad && !["COMPLETED", "PAID"].includes(booking.status) && (
        <div className="card p-5 mb-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400">{t.bookingTracker.queuePosition}</p>
            <p className="text-2xl font-bold">{queuePosition ?? "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{t.bookingTracker.estimatedWait}</p>
            <p className="text-2xl font-bold">{etaMin != null ? `${etaMin} min` : "—"}</p>
          </div>
        </div>
      )}

      {isTerminalBad ? (
        <div className="bg-red-50 text-red-700 rounded-2xl p-5 mb-4 font-semibold text-center">
          {booking.status === "CANCELLED" ? t.bookingTracker.cancelledMsg : t.bookingTracker.noShowMsg}
        </div>
      ) : (
        <div className="card p-5 mb-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">{t.bookingTracker.status}</p>
          <div className="flex items-center">
            {TIMELINE.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`w-4 h-4 rounded-full ${i <= activeIdx ? "bg-brand-600" : "bg-gray-200"}`} />
                {i < TIMELINE.length - 1 && <div className={`h-1 flex-1 ${i < activeIdx ? "bg-brand-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            {TIMELINE.map((s) => <span key={s}>{s.replace("_", " ")}</span>)}
          </div>
        </div>
      )}

      {booking.status === "CONFIRMED" && (
        <button className="btn-secondary w-full py-3 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 mb-4" onClick={cancelBooking}>
          {t.bookingTracker.cancelBooking}
        </button>
      )}

      {booking.riskLevel && (
        <div className="card p-5 mb-4">
          <p className="text-sm font-semibold text-gray-600">{t.bookingTracker.qualityRisk}</p>
          <p className="text-lg font-bold">{booking.riskLevel}</p>
        </div>
      )}

      {["COMPLETED", "PAID"].includes(booking.status) && (
        <div className="card p-5 mb-4">
          <p className="text-sm font-semibold text-gray-600 mb-1">{t.bookingTracker.procurementResult}</p>
          <p>{t.bookingTracker.accepted}: <b>{booking.finalQuantityQtl} qtl</b> · {t.bookingTracker.rejected}: {booking.rejectedQtl} qtl</p>
          <p className="mt-2">{t.bookingTracker.payment}: <b>{booking.paymentStatus}</b>{booking.paymentAmount ? ` · ₹${booking.paymentAmount}` : ""}</p>
        </div>
      )}

      <div className="card p-5">
        <p className="text-sm font-semibold text-gray-600 mb-2">{t.bookingTracker.notifications}</p>
        {notifications.length === 0 && <p className="text-xs text-gray-400">{t.bookingTracker.noNotifications}</p>}
        <ul className="space-y-2">
          {notifications.map((n, i) => (
            <li key={i} className="text-sm border-l-2 border-brand-500 pl-2">
              <p>{n.message}</p>
              <p className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleTimeString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
