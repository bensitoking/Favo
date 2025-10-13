import React, { useEffect, useMemo, useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8000";

type Categoria = {
  id_categoria: number;
  nombre: string;
  count: number;
};

export default function CategoriesAll() {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"name_asc" | "name_desc" | "count_asc" | "count_desc">(
    "count_desc"
  );

  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/categorias`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setCategories(data || []);
      } catch (err: any) {
        setError(err.message || "Error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const getCategoryColor = (id: number) => {
    const colors = [
      "bg-blue-50 hover:bg-blue-100",
      "bg-orange-50 hover:bg-orange-100",
      "bg-purple-50 hover:bg-purple-100",
      "bg-green-50 hover:bg-green-100",
      "bg-red-50 hover:bg-red-100",
      "bg-yellow-50 hover:bg-yellow-100",
    ];
    return colors[id % colors.length];
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = categories.filter((c) => c.nombre.toLowerCase().includes(s));
    switch (sort) {
      case "name_asc":
        list = list.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case "name_desc":
        list = list.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case "count_asc":
        list = list.sort((a, b) => a.count - b.count);
        break;
      case "count_desc":
      default:
        list = list.sort((a, b) => b.count - a.count);
        break;
    }
    return list;
  }, [categories, q, sort]);

  if (loading)
    return (
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto text-center text-red-500">
          Error al cargar las categorías: {error}
        </div>
      </section>
    );

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Todas las categorías</h1>
            <p className="text-sm text-gray-500 mt-1">Explora todas las categorías disponibles en Favo.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Volver <ChevronRightIcon size={16} className="ml-1 rotate-180" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full sm:w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Ordenar:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="count_desc">Más pedidos</option>
              <option value="count_asc">Menos pedidos</option>
              <option value="name_asc">Nombre A → Z</option>
              <option value="name_desc">Nombre Z → A</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((cat) => (
            <Link key={cat.id_categoria} to={`/categorias/${cat.id_categoria}`} className="block">
              <div
                className={`${getCategoryColor(cat.id_categoria)} rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {cat.nombre}
                  </h3>
                  <span className="text-sm text-gray-500">{cat.count} pedidos</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-8 text-center text-gray-600">No se encontraron categorías.</div>
        )}
      </div>
    </section>
  );
}
