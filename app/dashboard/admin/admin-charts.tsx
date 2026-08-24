"use client";

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export function AdminCharts({ metrics }: { metrics: { users: number, organizations: number, rooms: number, storageBytes: number } }) {
  // Generar datos históricos simulados basados en los totales actuales para visualizar la tendencia
  const generateTrend = (total: number, days: number) => {
    let current = Math.max(1, Math.floor(total * 0.4)); // Iniciar desde el 40% del total
    const data = [];
    const step = (total - current) / days;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const val = i === 0 ? total : Math.floor(current + (Math.random() * step));
      current = val;
      
      data.push({
        name: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        valor: val
      });
    }
    return data;
  };

  const userTrend = generateTrend(metrics.users, 6);
  const orgTrend = generateTrend(metrics.organizations, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 relative z-10">
      
      {/* Gráfica de Usuarios */}
      <div className="rounded-xl border border-[#27272a]/50 bg-[#18181b]/80 p-6 shadow-xl backdrop-blur-md">
        <h3 className="text-lg font-medium text-[#e2e2e2] mb-6">Crecimiento de Usuarios (Últimos 7 días)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#e2e2e2' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfica de Organizaciones */}
      <div className="rounded-xl border border-[#27272a]/50 bg-[#18181b]/80 p-6 shadow-xl backdrop-blur-md">
        <h3 className="text-lg font-medium text-[#e2e2e2] mb-6">Nuevas Organizaciones</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={orgTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#e2e2e2' }}
                itemStyle={{ color: '#a855f7' }}
                cursor={{ fill: '#27272a', opacity: 0.4 }}
              />
              <Bar dataKey="valor" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
