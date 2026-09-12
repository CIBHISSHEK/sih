import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { getSocket } from "../../api/socket";
import { Brand } from "../../components/Brand";
import { LogoutButton } from "../../components/NavButtons";

interface CentreOption { id: string; name: string; queueLength: number; avgProcessingTimeMin: number; }
interface Row {
  id: string;
  tokenNumber: string;
  status: string;
  crop: string;
  quantityQtl: number;
  riskLevel: string | null;
  farmer: { name: string; phone: string };
  slot: { startTime: string; endTime: string };
}

const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_QUEUE: "bg-indigo-100 text-indigo-700",
  ARRIVED: "bg-purple-100 text-purple-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PAID: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-200 text-gray-600",
  NO_SHOW: "bg-red-100 text-red-700"
};

const RISK_COLOR: Record<string, string> = { LOW: "bg-emerald-100 text-emerald-700", MEDIUM: "bg-amber-100 text-amber-700", HIGH: "bg-red-100 text-red-700" };

export default function StaffDashboard() {
  const { logout } = useAuth();
  const [centres, setCentres] = useState<CentreOption[]>([]);
  const [centreId, setCentreId] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [otpModal, setOtpModal] = useState<{ id: string } | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [completeModal, setCompleteModal] = useState<{ id: string; quantityQtl: number } | null>(null);
  const [finalQty, setFinalQty] = useState("");
  const [rejectedQty, setRejectedQty] = useState("0");

  useEffect(() => {
    api.get("/admin/centres").then(({ data }) => {
      setCentres(data.centres);
      if (data.centres[0]) setCentreId(data.centres[0].id);
    });
  }, []);

  async function loadToday(id: string) {
    const { data } = await api.get(`/staff/centres/${id}/today`);
    setRows(data.bookings);
  }

  useEffect(() => {
    if (centreId) loadToday(centreId);
  }, [centreId]);

  useEffect(() => {
    if (!centreId) return;
    const socket = getSocket();
    socket.emit("join:centre", centreId);
    const refresh = () => loadToday(centreId);
    socket.on("queue:update", refresh);
    socket.on("booking:status", refresh);
    return () => {
      socket.off("queue:update", refresh);
      socket.off("booking:status", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centreId]);

  async function verifyArrival() {
    if (!otpModal) return;
    try {
      await api.post(`/staff/bookings/${otpModal.id}/verify-arrival`, { otp: otpValue });
      setOtpModal(null);
      setOtpValue("");
      loadToday(centreId);
    } catch {
      alert("Incorrect OTP");
    }
  }

  async function startProcessing(id: string) {
    await api.post(`/staff/bookings/${id}/start-processing`);
    loadToday(centreId);
  }

  async function complete() {
    if (!completeModal) return;
    await api.post(`/staff/bookings/${completeModal.id}/complete`, {
      finalQuantityQtl: Number(finalQty),
      rejectedQtl: Number(rejectedQty)
    });
    setCompleteModal(null);
    setFinalQty("");
    setRejectedQty("0");
    loadToday(centreId);
  }

  async function noShow(id: string) {
    if (!confirm("Mark as no-show?")) return;
    await api.post(`/staff/bookings/${id}/no-show`);
    loadToday(centreId);
  }

  const inQueue = rows.filter((r) => ["CONFIRMED", "IN_QUEUE", "ARRIVED", "PROCESSING"].includes(r.status)).length;
  const processed = rows.filter((r) => ["COMPLETED", "PAID"].includes(r.status)).length;
  const currentCentre = centres.find((c) => c.id === centreId);

  return (
    <div className="min-h-screen px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Brand size="sm" />
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Staff Console</h1>
        </div>
        <div className="flex items-center gap-4">
          <select className="input-field w-auto py-2" value={centreId} onChange={(e) => setCentreId(e.target.value)}>
            {centres.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <LogoutButton onClick={logout} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4"><p className="text-xs text-gray-400">In queue</p><p className="text-3xl font-display font-bold text-brand-700">{inQueue}</p></div>
        <div className="card p-4"><p className="text-xs text-gray-400">Processed today</p><p className="text-3xl font-display font-bold text-brand-700">{processed}</p></div>
        <div className="card p-4"><p className="text-xs text-gray-400">Avg processing time</p><p className="text-3xl font-display font-bold text-brand-700">{currentCentre ? Math.round(currentCentre.avgProcessingTimeMin) : "—"} min</p></div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Token</th>
              <th className="px-4 py-3">Farmer</th>
              <th className="px-4 py-3">Crop / Qty</th>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-bold">{r.tokenNumber}</td>
                <td className="px-4 py-3">{r.farmer.name}<br /><span className="text-xs text-gray-400">{r.farmer.phone}</span></td>
                <td className="px-4 py-3">{r.crop} · {r.quantityQtl} qtl</td>
                <td className="px-4 py-3">{r.slot.startTime}-{r.slot.endTime}</td>
                <td className="px-4 py-3">
                  {r.riskLevel && <span className={`text-xs font-semibold px-2 py-1 rounded-full ${RISK_COLOR[r.riskLevel]}`}>{r.riskLevel}</span>}
                </td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[r.status]}`}>{r.status.replace("_", " ")}</span></td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  {r.status === "CONFIRMED" || r.status === "IN_QUEUE" ? (
                    <>
                      <button className="btn-pill text-brand-700 bg-brand-50 hover:bg-brand-100 !py-1.5" onClick={() => setOtpModal({ id: r.id })}>Verify Arrival</button>
                      <button className="btn-pill text-gray-500 bg-gray-100 hover:bg-gray-200 !py-1.5" onClick={() => noShow(r.id)}>No-show</button>
                    </>
                  ) : r.status === "ARRIVED" ? (
                    <button className="btn-pill text-brand-700 bg-brand-50 hover:bg-brand-100 !py-1.5" onClick={() => startProcessing(r.id)}>Start Processing</button>
                  ) : r.status === "PROCESSING" ? (
                    <button className="btn-pill text-white bg-brand-600 hover:bg-brand-700 !py-1.5" onClick={() => setCompleteModal({ id: r.id, quantityQtl: r.quantityQtl })}>Complete</button>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {otpModal && (
        <Modal onClose={() => setOtpModal(null)} title="Verify arrival OTP">
          <input autoFocus className="input-field text-xl tracking-widest text-center" maxLength={6} value={otpValue} onChange={(e) => setOtpValue(e.target.value)} />
          <button className="btn-primary w-full py-3 mt-4" onClick={verifyArrival}>Verify</button>
        </Modal>
      )}

      {completeModal && (
        <Modal onClose={() => setCompleteModal(null)} title="Complete procurement">
          <label className="block mb-3">
            <span className="text-sm text-gray-600">Final accepted quantity (qtl)</span>
            <input type="number" className="input-field mt-1" placeholder={String(completeModal.quantityQtl)} value={finalQty} onChange={(e) => setFinalQty(e.target.value)} />
          </label>
          <label className="block mb-3">
            <span className="text-sm text-gray-600">Rejected quantity (qtl)</span>
            <input type="number" className="input-field mt-1" value={rejectedQty} onChange={(e) => setRejectedQty(e.target.value)} />
          </label>
          <button className="btn-primary w-full py-3" onClick={complete}>Complete</button>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-bold text-lg mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
