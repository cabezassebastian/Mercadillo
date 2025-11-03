import { useEffect, useState } from 'react';
// Use server-side admin endpoints to avoid creating an admin Supabase client in the browser
import { Trophy, TrendingUp, DollarSign, ExternalLink, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAdmin } from '../../lib/adminApi';

type TopProduct = {
  id: string;
  name: string;
  sold: number;
  revenue: number;
};

export default function TopProducts() {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const json = await fetchAdmin('top-products&limit=5')

        setTopProducts(json.data || [])
      } catch (err) {
        console.error('Exception fetching top products:', err)
        setError('Error al cargar productos más vendidos')
        setTopProducts([])
      } finally {
        setLoading(false)
      }
    };
    
    fetchTopProducts();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-100 text-yellow-600 border-yellow-300';
      case 1:
        return 'bg-gray-100 text-gray-600 border-gray-300';
      case 2:
        return 'bg-orange-100 text-orange-600 border-orange-300';
      default:
        return 'bg-blue-100 text-blue-600 border-blue-300';
    }
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-amarillo rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-gris-oscuro" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gris-oscuro dark:text-gray-100">
              Top 5 Productos Más Vendidos
            </h3>
            <p className="text-sm text-gray-600">Productos con mejor rendimiento</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amarillo"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <p className="font-medium">{error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Verifica que la función SQL esté creada en Supabase
          </p>
        </div>
      ) : topProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Package className="w-12 h-12 mb-2 opacity-50" />
          <p className="font-medium">No hay productos vendidos aún</p>
          <p className="text-sm">Los datos aparecerán cuando haya ventas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              {/* Ranking Badge */}
              <div className="flex items-center space-x-4 flex-1">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${getMedalColor(index)}`}>
                  {index === 0 && <Trophy className="w-5 h-5" />}
                  {index > 0 && <span>#{index + 1}</span>}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gris-oscuro dark:text-gray-100 truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                      <span className="font-medium">{product.sold}</span>
                      <span className="ml-1">vendidos</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1 text-amarillo" />
                      <span className="font-medium text-dorado">
                        {formatCurrency(product.revenue)}
                      </span>
                      <span className="ml-1">ingresos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to={`/producto/${product.id}`}
                target="_blank"
                className="ml-4 px-4 py-2 bg-amarillo hover:bg-yellow-500 text-gris-oscuro rounded-lg transition-colors flex items-center space-x-2 font-medium text-sm"
              >
                <span>Ver</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          ))}

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Vendidos</p>
                <p className="text-2xl font-bold text-green-600">
                  {topProducts.reduce((sum, p) => sum + p.sold, 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
                <p className="text-2xl font-bold text-dorado">
                  {formatCurrency(topProducts.reduce((sum, p) => sum + p.revenue, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
