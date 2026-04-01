import React, { useState, useEffect } from 'react'
import { getAllCategories, approveCategory, rejectCategory, updateCategory, deactivateCategory, getPendingCategories, getProducts } from '../services/api'

const CategoryManagementPanel = () => {
  const [categories, setCategories] = useState([])
  const [pendingCategories, setPendingCategories] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchPendingCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await getAllCategories()
      setCategories(response.data || [])
      setError(null)
    } catch (err) {
      const status = err?.response?.status
      if (status === 404) {
        try {
          // Backward-compatible fallback: derive categories from existing products
          // so admin workflows remain usable while the categories module is not deployed.
          const productsResponse = await getProducts()
          const names = Array.from(new Set((productsResponse.data || []).map((p) => p?.category).filter(Boolean)))
          const fallbackCategories = names.map((name, index) => ({
            id: `legacy-${index}-${name}`,
            name,
            description: 'Detectada desde productos existentes',
            status: 'ACTIVE',
            type: 'LEGACY',
            createdBy: 'SISTEMA',
            approvedBy: null,
            approvedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
          setCategories(fallbackCategories)
          setError('El módulo de categorías no está disponible en backend. Se muestran categorías detectadas desde productos.')
          return
        } catch (fallbackErr) {
          console.error('Error en fallback de categorías:', fallbackErr)
        }
      }
      setError('Error al cargar categorías')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingCategories = async () => {
    try {
      const response = await getPendingCategories()
      setPendingCategories(response.data || [])
    } catch (err) {
      const status = err?.response?.status
      if (status === 404) {
        setPendingCategories([])
        return
      }
      console.error('Error al cargar categorías pendientes:', err)
    }
  }

  const handleApprove = async (id) => {
    try {
      await approveCategory(id)
      alert('Categoría aprobada correctamente')
      fetchCategories()
      fetchPendingCategories()
    } catch (err) {
      alert('Error al aprobar la categoría')
    }
  }

  const handleReject = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas rechazar esta categoría?')) {
      try {
        await rejectCategory(id)
        alert('Categoría rechazada')
        fetchCategories()
        fetchPendingCategories()
      } catch (err) {
        alert('Error al rechazar la categoría')
      }
    }
  }

  const handleDeactivate = async (id) => {
    if (window.confirm('¿Desactivar esta categoría?')) {
      try {
        await deactivateCategory(id)
        alert('Categoría desactivada')
        fetchCategories()
      } catch (err) {
        alert('Error al desactivar')
      }
    }
  }

  const handleSaveEdit = async (id) => {
    try {
      await updateCategory(id, editName, editDescription)
      alert('Categoría actualizada')
      setEditingId(null)
      fetchCategories()
    } catch (err) {
      alert('Error al actualizar')
    }
  }

  const startEdit = (category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditDescription(category.description || '')
  }

  const getStatusBadge = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-gray-100 text-gray-800',
      'PENDING_APPROVAL': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeBadge = (type) => {
    if (type === 'LEGACY') {
      return 'bg-slate-100 text-slate-700'
    }
    return type === 'PREDEFINED' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800'
  }

  if (loading) {
    return <div className="p-6 text-center">Cargando categorías...</div>
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wider">📂 Gestión de Categorías</h2>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-bold text-sm uppercase tracking-wider ${
            activeTab === 'all'
              ? 'text-blue-700 border-b-2 border-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Todas ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-bold text-sm uppercase tracking-wider ${
            activeTab === 'pending'
              ? 'text-blue-700 border-b-2 border-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pendientes ({pendingCategories.length})
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-xl font-bold">
          {error}
        </div>
      )}

      {/* All Categories Tab */}
      {activeTab === 'all' && (
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scroll">
          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay categorías cargadas</p>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
              >
                {editingId === category.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border-2 border-blue-300 rounded-lg p-2 font-bold"
                      placeholder="Nombre de categoría"
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full border-2 border-blue-300 rounded-lg p-2"
                      placeholder="Descripción"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(category.id)}
                        className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-all"
                      >
                        ✅ Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 bg-gray-400 text-white font-bold py-2 rounded-lg hover:bg-gray-500 transition-all"
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs font-black px-3 py-1 rounded-full ${getStatusBadge(category.status)}`}>
                          {category.status}
                        </span>
                        <span className={`text-xs font-black px-3 py-1 rounded-full ${getTypeBadge(category.type)}`}>
                          {category.type}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-3 space-y-1">
                      <p>Creada por: {category.createdBy} • {new Date(category.createdAt).toLocaleDateString()}</p>
                      {category.approvedBy && (
                        <p>Aprobada por: {category.approvedBy} • {new Date(category.approvedAt).toLocaleDateString()}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {category.status !== 'INACTIVE' && (
                        <>
                          <button
                            onClick={() => startEdit(category)}
                            className="flex-1 bg-amber-100 text-amber-700 font-bold py-2 rounded-lg hover:bg-amber-700 hover:text-white transition-all text-xs uppercase"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDeactivate(category.id)}
                            className="flex-1 bg-red-100 text-red-700 font-bold py-2 rounded-lg hover:bg-red-700 hover:text-white transition-all text-xs uppercase"
                          >
                            🚫 Desactivar
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Pending Categories Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scroll">
          {pendingCategories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay categorías pendientes de aprobación</p>
          ) : (
            pendingCategories.map((category) => (
              <div
                key={category.id}
                className="border-2 border-yellow-300 rounded-xl p-4 bg-yellow-50 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${getTypeBadge(category.type)}`}>
                    {category.type}
                  </span>
                </div>

                <div className="text-xs text-gray-600 mb-4 space-y-1">
                  <p>Creada por: {category.createdBy} • {new Date(category.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(category.id)}
                    className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-all text-xs uppercase"
                  >
                    ✅ Aprobar
                  </button>
                  <button
                    onClick={() => handleReject(category.id)}
                    className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-all text-xs uppercase"
                  >
                    ❌ Rechazar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default CategoryManagementPanel
