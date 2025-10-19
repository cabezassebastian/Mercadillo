import { useEffect, useState } from 'react';
// Server-side admin endpoints are used instead of importing supabaseAdmin in the browser
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

type SalesData = {
  date?: string;
  week_label?: string;
  month?: string;
  total: number;
  orders_count?: number;
};

type PeriodType = 'day' | 'week' | 'month';

export default function SalesChart() {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [sales, setSales] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true)
      setError(null)
      try {
  const res = await fetch(`/api/admin?action=sales&period=${period}`)
        const json = await res.json()
        if (!res.ok) {
          console.error('Error fetching sales (server):', json)
          setError('Error al cargar ventas')
          setSales([])
        } else {
          setSales(json.data || [])
        }
      } catch (err) {
        console.error('Exception fetching sales:', err)
        setError('Error al cargar ventas')
        setSales([])
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [period]);

  const formatCurrency = (value: number) => {
    return `S/ ${value.toFixed(2)}`;
  };

  const getChartTitle = () => {
    switch (period) {
      case 'day':
        return 'Ventas por Día (Últimos 7 días)';
      case 'week':
        return 'Ventas por Semana (Últimas 4 semanas)';
      case 'month':
        return 'Ventas por Mes (Últimos 12 meses)';
    }
  };

  const getXAxisKey = () => {
    switch (period) {
      case 'day':
        return 'date';
      case 'week':
        return 'week_label';
      case 'month':
        return 'month';
    }
  };

  const renderChart = () => {
    const xKey = getXAxisKey();
    
    switch (period) {
      case 'day':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey={xKey} 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `S/ ${value}`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#FFD700" 
                strokeWidth={3}
                name="Ventas"
                dot={{ fill: '#FFD700', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'week':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey={xKey} 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `S/ ${value}`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="total" 
                fill="#FFD700" 
                name="Ventas"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'month':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sales}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FFD700" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey={xKey} 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `S/ ${value}`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#FFD700" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorTotal)"
                name="Ventas"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-amarillo rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-gris-oscuro" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gris-oscuro">
              {getChartTitle()}
            </h3>
            <p className="text-sm text-gray-600">Análisis de ventas</p>
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPeriod('day')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              period === 'day'
                ? 'bg-amarillo text-gris-oscuro shadow-sm'
                : 'text-gray-600 hover:text-gris-oscuro'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Día
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              period === 'week'
                ? 'bg-amarillo text-gris-oscuro shadow-sm'
                : 'text-gray-600 hover:text-gris-oscuro'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              period === 'month'
                ? 'bg-amarillo text-gris-oscuro shadow-sm'
                : 'text-gray-600 hover:text-gris-oscuro'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Mes
          </button>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amarillo"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <p className="font-medium">{error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Verifica que las funciones SQL estén creadas en Supabase
          </p>
        </div>
      ) : sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <TrendingUp className="w-12 h-12 mb-2 opacity-50" />
          <p className="font-medium">No hay datos de ventas</p>
          <p className="text-sm">Los datos aparecerán cuando haya pedidos</p>
        </div>
      ) : (
        <div className="mt-4">
          {renderChart()}
        </div>
      )}
    </div>
  );
}
