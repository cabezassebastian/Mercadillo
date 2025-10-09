
import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
      const { data, error } = await supabaseAdmin.rpc('get_top_selling_products');
      if (error) {
        setError('Error al cargar productos más vendidos');
        setTopProducts([]);
      } else {
        setTopProducts(data || []);
      }
      setLoading(false);
    };
    fetchTopProducts();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <h3 className="font-bold mb-2">Top Selling Products</h3>
      {loading ? (
        <div className="py-6 text-center text-gray-500">Cargando...</div>
      ) : error ? (
        <div className="py-6 text-center text-red-500">{error}</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Product</th>
              <th>Sold</th>
              <th>Revenue</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="text-center">{p.sold}</td>
                <td className="text-center">S/ {p.revenue}</td>
                <td><a href={`/producto/${p.id}`} className="text-blue-600 underline">Ver</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
