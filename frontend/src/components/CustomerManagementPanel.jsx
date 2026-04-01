import React, { useEffect, useState } from 'react'
import { getCustomers, getCustomerPurchaseHistory } from '../services/api'

function CustomerManagementPanel({ isAdmin }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [historyCustomer, setHistoryCustomer] = useState(null)
  const [historyItems, setHistoryItems] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      setCustomers([])
      return
    }

    const loadCustomers = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await getCustomers()
        setCustomers(response.data || [])
      } catch (err) {
        setError('No se pudo cargar la lista de clientes.')
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [isAdmin])

  const openHistory = async (customer) => {
    setHistoryCustomer(customer)
    setHistoryItems([])
    setHistoryError('')
    setHistoryLoading(true)

    try {
      const response = await getCustomerPurchaseHistory(customer.id)
      setHistoryItems(response.data || [])
    } catch (err) {
      setHistoryError('No se pudo cargar el historial de compras.')
    } finally {
      setHistoryLoading(false)
    }
  }

  const closeHistory = () => {
    setHistoryCustomer(null)
    setHistoryItems([])
    setHistoryError('')
  }

  const formatDate = (value) => {
    if (!value) return 'Sin fecha'
    return new Date(value).toLocaleString()
  }

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 p-8">
        <p className="text-sm font-bold text-gray-500">No tienes permisos para ver la gestión de clientes.</p>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b bg-blue-50/50">
          <h2 className="text-sm font-black text-blue-700 uppercase tracking-widest">Gestión de Clientes</h2>
        </div>
        <div className="custom-scroll">
          {loading ? (
            <div className="p-8 text-sm font-bold text-gray-500">Cargando clientes...</div>
          ) : error ? (
            <div className="p-8 text-sm font-bold text-red-700">{error}</div>
          ) : (
            <table className="min-w-[1300px] w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Nombre</th>
                  <th className="px-6 py-4 whitespace-nowrap">Teléfono</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Compras Acumuladas</th>
                  <th className="px-6 py-4 whitespace-nowrap">Estatus ClienteAmigo</th>
                  <th className="px-6 py-4 whitespace-nowrap">Código ClienteAmigo</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{customer.name || 'Sin nombre'}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{customer.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black">
                        {customer.purchaseCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {customer.friend ? (
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                          ✓ ClienteAmigo
                        </span>
                      ) : customer.purchaseCount >= 5 ? (
                        <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                          ⚠ Elegible (5+ compras)
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                          — No elegible ({customer.purchaseCount || 0}/5)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-black text-gray-700">
                      {customer.clienteAmigoNumber || 'Pendiente'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openHistory(customer)}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-blue-700 hover:text-white transition-all"
                      >
                        Ver Historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {historyCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b bg-purple-50 p-6">
              <h3 className="text-lg font-black uppercase text-purple-900">Historial de compras</h3>
              <p className="mt-1 text-xs font-bold text-purple-700">{historyCustomer.name || 'Sin nombre'}</p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6">
              {historyLoading ? (
                <p className="text-sm font-bold text-gray-500">Cargando historial...</p>
              ) : historyError ? (
                <p className="text-sm font-bold text-red-700">{historyError}</p>
              ) : historyItems.length === 0 ? (
                <p className="text-sm font-bold text-gray-500">Este cliente todavía no tiene compras registradas.</p>
              ) : (
                <div className="space-y-3">
                  {historyItems.map((sale) => (
                    <div key={sale.id} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-gray-900">Folio #VL-{sale.id}</p>
                          <p className="text-xs font-bold text-gray-500">{formatDate(sale.saleDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Total</p>
                          <p className="text-lg font-black text-blue-800">${Number(sale.totalAmount || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {sale.items?.map((item, index) => (
                          <span key={`${sale.id}-${index}`} className="rounded-lg bg-gray-100 px-3 py-1 text-[10px] font-black uppercase text-gray-700">
                            {item.product?.name || 'Producto'} x{item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t p-6">
              <button
                type="button"
                onClick={closeHistory}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-xs font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CustomerManagementPanel