import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Brand } from "../../components/Brand";
import { LogoutButton } from "../../components/NavButtons";

const COLORS = ["#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed"];

interface CentreRow {
  id: string; name: string; queueLength: number; capacityUsedPct: number; avgProcessingTimeMin: number; isNearCapacity: boolean;
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [utilisation, setUtilisation] = useState<any[]>([]);
  const [rejections, setRejections] = useState<any[]>([]);
  const [centres, setCentres] = useState<CentreRow[]>([]);
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    const [o, f, u, r, c] = await Promise.all([
      api.get("/admin/overview"),
      api.get("/admin/forecast?days=7"),
      api.get("/admin/utilisation?days=14"),
      api.get("/admin/rejections?days=14"),
      api.get("/admin/centres")
    ]);
    setOverview(o.data);
    setForecast(f.data.forecast);
    setUtilisation(u.data.utilisation);
    setRejections(r.data.rejections);
    setCentres(c.data.centres);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const centreNames = Array.from(new Set(centres.map((c) => c.name)));

  const forecastPivot = pivot(forecast, "date", "centreName", "expectedArrivals");
  const utilPivot = pivot(utilisation, "date", "centreName", "utilisationPct");

  async function demoAction(action: "reset" | "advance" | "rush", centreId?: string) {
    setBusy(true);
    try {
      if (action === "reset") await api.post("/demo/reset");
      if (action === "advance" && centreId) await api.post(`/demo/advance/${centreId}`);
      if (action === "rush" && centreId) await api.post(`/demo/rush/${centreId}`);
      await loadAll();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Brand size="sm" />
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Government Analytics</h1>
        </div>
        <LogoutButton onClick={logout} />
      </div>

      {overview && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Kpi label="Today's bookings" value={overview.todayBookings} />
          <Kpi label="Arrivals so far" value={overview.arrivalsSoFar} />
          <Kpi label="Avg wait" value={`${overview.avgWaitMin} min`} />
          <Kpi label="Rejection rate" value={`${overview.rejectionRatePct}%`} />
          <Kpi label="Payment SLA" value={`${overview.paymentSlaPct}%`} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        <ChartCard title="Arrivals forecast — next 7 days (predicted)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={forecastPivot}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Legend />
              {centreNames.map((name, i) => (
                <Line key={name} type="monotone" dataKey={name} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Centre utilisation — last 14 days (%)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={utilPivot}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={10} interval={2} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Legend />
              {centreNames.map((name, i) => (
                <Bar key={name} dataKey={name} stackId="a" fill={COLORS[i % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <ChartCard title="Rejection rate by crop (%)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={rejections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crop" fontSize={12} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="rejectionRatePct" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Live centre status">
          <table className="w-full text-sm">
            <thead className="text-gray-400 text-left">
              <tr><th className="py-1">Centre</th><th>Queue</th><th>Capacity used</th><th>Avg proc.</th></tr>
            </thead>
            <tbody>
              {centres.map((c) => (
                <tr key={c.id} className={`border-t ${c.isNearCapacity ? "bg-red-50" : ""}`}>
                  <td className="py-2 font-medium">{c.name}{c.isNearCapacity && <span className="ml-2 text-xs text-red-600 font-semibold">NEAR CAPACITY</span>}</td>
                  <td>{c.queueLength}</td>
                  <td>
                    <div className="w-24 bg-gray-100 rounded-full h-2 inline-block align-middle mr-2">
                      <div className={`h-2 rounded-full ${c.capacityUsedPct > 85 ? "bg-red-500" : c.capacityUsedPct > 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, c.capacityUsedPct)}%` }} />
                    </div>
                    {c.capacityUsedPct}%
                  </td>
                  <td>{c.avgProcessingTimeMin} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-gray-600 mb-3">Demo controls</p>
        <div className="flex flex-wrap gap-3 items-center">
          <button disabled={busy} className="btn-pill text-white bg-red-600 hover:bg-red-700 disabled:opacity-50" onClick={() => demoAction("reset")}>
            Reset demo
          </button>
          {centres.map((c) => (
            <div key={c.id} className="flex gap-1">
              <button disabled={busy} className="btn-pill text-white bg-accent-500 hover:bg-accent-600 !text-xs disabled:opacity-50" onClick={() => demoAction("rush", c.id)}>
                Rush @ {c.name.split(" ")[0]}
              </button>
              <button disabled={busy} className="btn-pill text-white bg-blue-600 hover:bg-blue-700 !text-xs disabled:opacity-50" onClick={() => demoAction("advance", c.id)}>
                Advance @ {c.name.split(" ")[0]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-2xl font-display font-bold text-brand-700">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-gray-600 mb-3">{title}</p>
      {children}
    </div>
  );
}

function pivot(rows: any[], dateKey: string, seriesKey: string, valueKey: string) {
  const byDate = new Map<string, any>();
  for (const row of rows) {
    const entry = byDate.get(row[dateKey]) ?? { [dateKey]: row[dateKey] };
    entry[row[seriesKey]] = row[valueKey];
    byDate.set(row[dateKey], entry);
  }
  return Array.from(byDate.values()).sort((a, b) => String(a[dateKey]).localeCompare(String(b[dateKey])));
}
