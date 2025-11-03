import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { TrendingUp, Eye, ShoppingCart, Percent } from 'lucide-react';

type ConversionData = {
  total_views: number;
  total_orders: number;
  conversion_rate: number;
};

export default function ConversionRate() {
  const [conversionData, setConversionData] = useState<ConversionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversionRate = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabaseAdmin.rpc('get_conversion_rate');
        
        if (error) {
          console.error('Error fetching conversion rate:', error);
          setError('Error al cargar tasa de conversión');
          setConversionData(null);
        } else {
          // La función retorna un array con un solo objeto
          setConversionData(data && data.length > 0 ? data[0] : null);
        }
      } catch (err) {
        console.error('Exception fetching conversion rate:', err);
        setError('Error al cargar tasa de conversión');
        setConversionData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversionRate();
  }, []);

  const getConversionColor = (rate: number) => {
    if (rate >= 5) return 'text-green-600';
    if (rate >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConversionMessage = (rate: number) => {
    if (rate >= 5) return '¡Excelente!';
    if (rate >= 2) return 'Bueno';
    return 'Mejorable';
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Percent className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gris-oscuro dark:text-gray-100">
            Tasa de Conversión
          </h3>
          <p className="text-sm text-gray-600">Visitas vs Pedidos</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48 text-red-500">
          <p className="font-medium">{error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Verifica que la función SQL y la tabla product_views estén creadas
          </p>
        </div>
      ) : !conversionData ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <Eye className="w-12 h-12 mb-2 opacity-50" />
          <p className="font-medium">No hay datos disponibles</p>
          <p className="text-sm">Comienza a trackear visitas de productos</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Conversion Rate */}
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className={`w-8 h-8 ${getConversionColor(conversionData.conversion_rate)}`} />
            </div>
            <div className={`text-5xl font-bold mb-2 ${getConversionColor(conversionData.conversion_rate)}`}>
              {conversionData.conversion_rate.toFixed(2)}%
            </div>
            <p className="text-sm text-gray-600 font-medium">
              {getConversionMessage(conversionData.conversion_rate)}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {conversionData.total_views.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">Visitas a productos</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {conversionData.total_orders.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">Pedidos realizados</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gris-oscuro mb-2 flex items-center">
              <Percent className="w-4 h-4 mr-2 text-purple-600" />
              ¿Qué es la tasa de conversión?
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Es el porcentaje de visitas que se convierten en pedidos. 
              Una tasa del <strong>2-5%</strong> es considerada buena para e-commerce. 
              Mejora tu tasa optimizando descripciones, imágenes y precios.
            </p>
          </div>

          {/* Benchmarks */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Benchmarks de la industria
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Excelente</span>
                <span className="text-green-600 font-semibold">&gt; 5%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Bueno</span>
                <span className="text-yellow-600 font-semibold">2% - 5%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Mejorable</span>
                <span className="text-red-600 font-semibold">&lt; 2%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
