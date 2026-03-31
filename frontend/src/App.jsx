import { useEffect, useState } from 'react'
import { getProducts, createProduct, deleteProduct } from './services/api'

function App() {
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    stock: '', 
    price: '' 
  });

  // 1. Cargar productos al iniciar
  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      const data = response.data.content || response.data;
      setProducts(data);
    } catch (error) {
      console.error("Error al conectar con el servidor de VitalLogix:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [])

  // 2. Función para guardar nuevo producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertimos los valores a números antes de enviar a la API
      const productToSend = {
        ...newProduct,
        stock: parseInt(newProduct.stock) || 0,
        price: parseFloat(newProduct.price) || 0
      };

      await createProduct(productToSend); 
      setIsModalOpen(false); 
      setNewProduct({ name: '', stock: '', price: '' }); 
      fetchProducts(); 
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("No se pudo guardar el producto.");
    }
  };

  // 3. Función para eliminar producto
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este medicamento?")) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">VitalLogix</h1>
        <p className="text-gray-600">Sistema de Gestión de Farmacia - Facultad de Matemáticas UADY</p>
      </header>

      <main className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Inventario de Productos</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            + Nuevo Producto
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Medicamento</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-400">#{product.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {product.stock} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:text-white hover:bg-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                    No hay productos en el inventario.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      
      {/* --- MODAL DE REGISTRO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/30">
              <h3 className="text-xl font-bold text-gray-800">Registrar Medicamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre del Producto</label>
                <input 
                  type="text" 
                  value={newProduct.name}
                  required
                  placeholder="Ej. Paracetamol 500mg"
                  className="w-full border border-gray-200 rounded-xl p-3.5 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Stock Inicial</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={newProduct.stock}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-xl p-3.5 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewProduct({...newProduct, stock: val === '' ? '' : val});
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Precio (MXN)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-400 font-bold">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      min="0"
                      value={newProduct.price}
                      placeholder="0.00"
                      className="w-full border border-gray-200 rounded-xl p-3.5 pl-8 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewProduct({...newProduct, price: val === '' ? '' : val});
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3.5 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App