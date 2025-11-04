import { useEffect, useState } from 'react';
// Server-side admin endpoints used via /api/admin/*
import { AlertTriangle, Package, Edit, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchAdmin } from '../../lib/adminApi';

type LowStockProduct = {
  id: string;
  nombre: string;
  stock: number;
  precio: number;
  categoria: string;
};

export default function LowStockAlert() {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLowStock = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Call server-side admin endpoint which runs the RPC with service role key
        const json = await fetchAdmin('metrics&sub=low_stock&threshold=5')
        setLowStockProducts(json.data || [])
      } catch (err) {
        console.error('Exception fetching low stock:', err);
        setError('Error al cargar productos con bajo stock');
        setLowStockProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLowStock();
  }, []);

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-700 bg-red-100 border-red-300';
    if (stock <= 2) return 'text-orange-700 bg-orange-100 border-orange-300';
    return 'text-yellow-700 bg-yellow-100 border-yellow-300';
  };

  const getStockIcon = (stock: number) => {
    if (stock === 0) return <AlertTriangle className="w-4 h-4" />;
    if (stock <= 2) return <AlertTriangle className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  return (
    <div className="card p-6 border-l-4 border-red-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gris-oscuro dark:text-gray-100">
              Alertas de Stock Bajo
            </h3>
            <p className="text-sm text-gray-600">
              Productos con stock ≤ 5 unidades
            </p>
          </div>
        </div>
        
        {/* Badge */}
        {!loading && lowStockProducts.length > 0 && (
          <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
            {lowStockProducts.length} {lowStockProducts.length === 1 ? 'alerta' : 'alertas'}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48 text-red-500">
          <AlertTriangle className="w-12 h-12 mb-2" />
          <p className="font-medium">{error}</p>
        </div>
      ) : lowStockProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <CheckCircle className="w-12 h-12 mb-2 text-green-500" />
          <p className="font-medium text-green-600">¡Todo bien!</p>
          <p className="text-sm">No hay productos con stock bajo</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {lowStockProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              {/* Product Info */}
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {/* Stock Badge */}
                <div className={`px-3 py-2 rounded-lg border-2 flex items-center space-x-2 font-bold ${getStockColor(product.stock)}`}>
                  {getStockIcon(product.stock)}
                  <span>{product.stock}</span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gris-oscuro dark:text-gray-100 truncate">
                    {product.nombre}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {product.categoria}
                    </span>
                    <span className="font-medium text-dorado">
                      {formatPrice(product.precio)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  // Navegar a la página de productos con el ID del producto para editar
                  navigate('/admin/productos', { 
                    state: { 
                      editProductId: product.id,
                      productData: product
                    } 
                  });
                }}
                className="ml-4 px-4 py-2 bg-amarillo hover:bg-yellow-500 text-gris-oscuro rounded-lg transition-colors flex items-center space-x-2 font-medium text-sm"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer Summary */}
      {!loading && !error && lowStockProducts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Sin stock</p>
              <p className="text-xl font-bold text-red-600">
                {lowStockProducts.filter(p => p.stock === 0).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stock crítico (≤2)</p>
              <p className="text-xl font-bold text-orange-600">
                {lowStockProducts.filter(p => p.stock > 0 && p.stock <= 2).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stock bajo (3-5)</p>
              <p className="text-xl font-bold text-yellow-600">
                {lowStockProducts.filter(p => p.stock >= 3 && p.stock <= 5).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
