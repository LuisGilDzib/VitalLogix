import React, { useEffect, useState } from 'react'
import { createAdminUser, createCustomer, deleteCustomer, deleteSystemUser, getCustomers, getCustomerPurchaseHistory, getSystemUsers, promoteUserToAdmin, updateCustomer } from '../services/api'

function CustomerManagementPanel({ isAdmin }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [historyCustomer, setHistoryCustomer] = useState(null)
  const [historyItems, setHistoryItems] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [customerForm, setCustomerForm] = useState({
    name: '',
    address: '',
    phone: ''
  })
  const [editingCustomerId, setEditingCustomerId] = useState(null)
  const [customerSaving, setCustomerSaving] = useState(false)
  const [customerMessage, setCustomerMessage] = useState('')
  const [systemUsers, setSystemUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [newAdminUsername, setNewAdminUsername] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [newAdminLoading, setNewAdminLoading] = useState(false)
  const [newAdminMessage, setNewAdminMessage] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      setCustomers([])
      return
    }

    fetchCustomers()
  }, [isAdmin])

  const fetchCustomers = async () => {
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

  useEffect(() => {
    if (!isAdmin) {
      setSystemUsers([])
      return
    }

    fetchSystemUsers()
  }, [isAdmin])

  const fetchSystemUsers = async () => {
    setUsersLoading(true)
    setUsersError('')
    try {
      const response = await getSystemUsers()
      setSystemUsers(response.data || [])
    } catch (err) {
      if (err?.response?.status === 404) {
        setUsersError('El endpoint de admin no esta disponible en el backend activo. Reinicia backend con: docker compose up -d --build vitallogix-app')
      } else {
        setUsersError('No se pudo cargar la lista de usuarios del sistema.')
      }
    } finally {
      setUsersLoading(false)
    }
  }

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

  const resetCustomerForm = () => {
    setCustomerForm({
      name: '',
      address: '',
      phone: ''
    })
    setEditingCustomerId(null)
  }

  const extractErrorMessage = (err, fallbackMessage) => {
    const errorData = err?.response?.data
    if (typeof errorData === 'string') return errorData
    return errorData?.message || errorData?.error || fallbackMessage
  }

  const handleSubmitCustomer = async (e) => {
    e.preventDefault()
    setCustomerSaving(true)
    setCustomerMessage('')
    setError('')

    const payload = {
      ...customerForm,
      name: customerForm.name.trim(),
      address: customerForm.address.trim(),
      phone: customerForm.phone.trim()
    }

    try {
      if (editingCustomerId) {
        await updateCustomer(editingCustomerId, payload)
        setCustomerMessage('Cliente actualizado correctamente.')
      } else {
        await createCustomer(payload)
        setCustomerMessage('Cliente creado correctamente.')
      }
      resetCustomerForm()
      await fetchCustomers()
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo guardar el cliente.'))
    } finally {
      setCustomerSaving(false)
    }
  }

  const handleEditCustomer = (customer) => {
    setCustomerMessage('')
    setError('')
    setEditingCustomerId(customer.id)
    setCustomerForm({
      name: customer.name || '',
      address: customer.address || '',
      phone: customer.phone || ''
    })
  }

  const handleDeleteCustomer = async (customer) => {
    const confirmed = window.confirm(`¿Seguro que deseas eliminar al cliente ${customer.name || 'sin nombre'}?`)
    if (!confirmed) return

    setError('')
    setCustomerMessage('')
    try {
      await deleteCustomer(customer.id)
      if (historyCustomer?.id === customer.id) {
        closeHistory()
      }
      if (editingCustomerId === customer.id) {
        resetCustomerForm()
      }
      await fetchCustomers()
      setCustomerMessage('Cliente eliminado correctamente.')
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo eliminar el cliente.'))
    }
  }

  const handlePromote = async (user) => {
    try {
      await promoteUserToAdmin(user.id)
      await fetchSystemUsers()
    } catch (err) {
      const message = extractErrorMessage(err, 'No se pudo promover el usuario a admin.')
      setUsersError(String(message))
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setNewAdminMessage('')
    setUsersError('')
    setNewAdminLoading(true)

    try {
      await createAdminUser(newAdminUsername, newAdminPassword)
      setNewAdminUsername('')
      setNewAdminPassword('')
      setNewAdminMessage('Admin creado correctamente.')
      await fetchSystemUsers()
    } catch (err) {
      const message = extractErrorMessage(err, 'No se pudo crear el admin.')
      setUsersError(String(message))
    } finally {
      setNewAdminLoading(false)
    }
  }

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(`¿Seguro que deseas eliminar al usuario ${user.username}? Esta acción no se puede deshacer.`)
    if (!confirmed) return

    setUsersError('')
    try {
      await deleteSystemUser(user.id)
      await fetchSystemUsers()
    } catch (err) {
      const message = extractErrorMessage(err, 'No se pudo eliminar el usuario.')
      setUsersError(String(message))
    }
  }

  const isAdminUser = (user) => user.roles?.includes('ADMIN')

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
          <p className="mt-2 text-xs font-bold text-blue-900/70">
            Puedes crear, editar o eliminar registros de clientes para datos de contacto y receta.
          </p>
        </div>
        <div className="p-6 border-b bg-white">
          <form className="grid gap-3 md:grid-cols-3" onSubmit={handleSubmitCustomer}>
            <input
              type="text"
              placeholder="Nombre"
              className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
              value={customerForm.name}
              onChange={(e) => setCustomerForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Teléfono"
              className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
              value={customerForm.phone}
              onChange={(e) => setCustomerForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Dirección"
              className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
              value={customerForm.address}
              onChange={(e) => setCustomerForm((prev) => ({ ...prev, address: e.target.value }))}
            />
            <div className="flex gap-2 md:col-span-3">
              <button
                type="submit"
                className="rounded-xl bg-blue-700 px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-800 disabled:opacity-60"
                disabled={customerSaving}
              >
                {customerSaving ? 'Guardando...' : editingCustomerId ? 'Actualizar Cliente' : 'Crear Cliente'}
              </button>
              {editingCustomerId && (
                <button
                  type="button"
                  onClick={resetCustomerForm}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
          {customerMessage && <p className="mt-3 text-xs font-black text-green-700">{customerMessage}</p>}
        </div>
        <div className="custom-scroll">
          {loading ? (
            <div className="p-8 text-sm font-bold text-gray-500">Cargando clientes...</div>
          ) : error ? (
            <div className="p-8 text-sm font-bold text-red-700">{error}</div>
          ) : (
            <table className="min-w-[900px] w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Nombre</th>
                  <th className="px-6 py-4 whitespace-nowrap">Teléfono</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Compras Acumuladas</th>
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() => openHistory(customer)}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-blue-700 hover:text-white transition-all"
                        >
                          Ver Historial
                        </button>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-amber-700 hover:text-white transition-all"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-red-700 hover:text-white transition-all"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b bg-blue-50/50">
          <h2 className="text-sm font-black text-blue-700 uppercase tracking-widest">Gestión de Accesos Admin</h2>
          <p className="mt-2 text-xs font-bold text-blue-900/70">
            Desde aquí puedes promover usuarios existentes, crear cuentas admin y consultar el estado ClienteAmigo por cuenta.
          </p>
        </div>

        <div className="p-6 border-b bg-white">
          <form className="grid gap-3 md:grid-cols-3" onSubmit={handleCreateAdmin}>
            <input
              type="text"
              placeholder="Nuevo usuario admin"
              className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
              value={newAdminUsername}
              onChange={(e) => setNewAdminUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="rounded-xl bg-blue-700 px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-800 disabled:opacity-60"
              disabled={newAdminLoading}
            >
              {newAdminLoading ? 'Creando...' : 'Crear Admin'}
            </button>
          </form>
          {newAdminMessage && <p className="mt-3 text-xs font-black text-green-700">{newAdminMessage}</p>}
          {usersError && <p className="mt-3 text-xs font-black text-red-700">{usersError}</p>}
        </div>

        <div className="custom-scroll">
          {usersLoading ? (
            <div className="p-8 text-sm font-bold text-gray-500">Cargando usuarios...</div>
          ) : (
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Usuario</th>
                  <th className="px-6 py-4 whitespace-nowrap">Roles</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Compras Cuenta</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Progreso (0-5)</th>
                  <th className="px-6 py-4 whitespace-nowrap">Codigo ClienteAmigo</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {systemUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{user.username}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(user.roles || []).map((role) => (
                          <span key={`${user.id}-${role}`} className="rounded-lg bg-gray-100 px-3 py-1 text-[10px] font-black uppercase text-gray-700">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-[10px] font-black text-blue-700">
                        {Number(user.totalPurchaseCount || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-[10px] font-black text-gray-700">
                        {Number(user.purchasesSinceCoupon || 0)}/5
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-gray-700">
                          {user.clienteAmigoNumber || 'Sin codigo activo'}
                        </span>
                        {user.couponAvailable && (
                          <span className="inline-block rounded-lg bg-green-100 px-2 py-1 text-[9px] font-black uppercase text-green-700">
                            Disponible
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {isAdminUser(user) ? (
                          <span className="inline-block rounded-lg bg-green-100 px-3 py-1 text-[10px] font-black uppercase text-green-700">
                            Ya es admin
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePromote(user)}
                            className="rounded-lg bg-blue-50 px-3 py-1 text-[10px] font-black uppercase text-blue-700 hover:bg-blue-700 hover:text-white"
                          >
                            Promover a Admin
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="rounded-lg bg-red-50 px-3 py-1 text-[10px] font-black uppercase text-red-700 hover:bg-red-700 hover:text-white"
                        >
                          Eliminar
                        </button>
                      </div>
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
                          {sale.accountUsername && (
                            <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-purple-700">
                              Cuenta: {sale.accountUsername}
                            </p>
                          )}
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