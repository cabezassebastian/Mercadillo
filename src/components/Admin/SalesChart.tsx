
import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type MonthlySales = {
  month: string;
  total: number;
};

const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function SalesChart({ period = 'month' }: { period?: 'month' | 'week' | 'day' }) {
  const [sales, setSales] = useState<MonthlySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setError(null);
      // Elegir la RPC según el periodo (si no existe, fallback a mensual)
      const rpcName = period === 'month' ? 'get_monthly_sales' : 'get_monthly_sales';
      const { data, error } = await supabaseAdmin.rpc(rpcName as string);
      if (error) {
        setError('Error al cargar ventas');
        setSales([]);
      } else {
        setSales(data || []);
      }
      setLoading(false);
    };
    fetchSales();
  }, []);

  // Preparar datos para el gráfico (mapa label -> total)
  const totalsByLabel = monthLabels.map(label => {
    const found = sales.find((s) => s.month === label);
    return found ? Number(found.total) : 0;
  });

  const max = Math.max(...totalsByLabel, 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <h3 className="font-bold mb-2">Ventas por mes</h3>
      {loading ? (
        <div className="py-6 text-center text-gray-500">Cargando...</div>
      ) : error ? (
        <div className="py-6 text-center text-red-500">{error}</div>
      ) : (
        <div className="w-full">
          <div className="flex items-end space-x-2 h-40">
            {totalsByLabel.map((value, idx) => {
              const height = Math.round((value / max) * 100);
              return (
                <div key={monthLabels[idx]} className="flex-1 flex flex-col items-center">
                  <div
                    title={`${monthLabels[idx]}: S/ ${value}`}
                    className="w-full bg-amarillo rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs mt-2 text-center">{monthLabels[idx]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
