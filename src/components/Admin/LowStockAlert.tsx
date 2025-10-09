
import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type LowStockProduct = {
  id: string;
  nombre: string;
  stock: number;
};

export default function LowStockAlert() {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLowStock = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabaseAdmin
        .from('productos')
        .select('id, nombre, stock')
        .lt('stock', 4)
        .order('stock', { ascending: true });
      if (error) {
        setError('Error al cargar productos con bajo stock');
        setLowStockProducts([]);
      } else {
        setLowStockProducts(data || []);
      }
      setLoading(false);
    };
    fetchLowStock();
  }, []);

  return (
    <div className="bg-red-50 dark:bg-red-900 rounded-xl shadow p-4">
      <h3 className="font-bold mb-2 text-red-700 dark:text-red-300">Low Stock Alerts</h3>
      {loading ? (
        <div className="py-6 text-center text-gray-500">Cargando...</div>
      ) : error ? (
        <div className="py-6 text-center text-red-500">{error}</div>
      ) : (
        <ul>
          {lowStockProducts.length === 0 ? (
            <li className="text-gray-500">No hay productos con stock bajo.</li>
          ) : (
            lowStockProducts.map(p => (
              <li key={p.id} className="flex justify-between items-center py-1">
                <span>{p.nombre}</span>
                <span className="font-bold text-red-700 dark:text-red-300">{p.stock} restantes</span>
                <a href={`/admin/product/${p.id}`} className="ml-2 text-blue-600 underline">Editar</a>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
