import { useState, useEffect } from 'react'
import { getCampaigns, getProducts, createCampaign, updateCampaign, toggleCampaignStatus, deleteCampaign } from '../services/api'

function CampaignManagementPanel({ onNavigateBack }) {
  const CAMPAIGNS_STORAGE_KEY = 'vitallogix_campaigns_local'
  const [campaigns, setCampaigns] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditingCampaign, setIsEditingCampaign] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [campaignsMode, setCampaignsMode] = useState('server')

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    promotionType: 'NONE',
    promoBuyQuantity: '',
    promoPayQuantity: '',
    promoPercentDiscount: '',
    startDate: '',
    startTime: '00:00',
    endDate: '',
    endTime: '23:59',
    isActive: true,
    productIds: new Set()
  })

  const [searchTerm, setSearchTerm] = useState('')

  // Fetch campaigns and products on mount
  useEffect(() => {
    loadCampaigns()
    loadAllProducts()
  }, [])

  const loadLocalCampaigns = () => {
    try {
      const raw = localStorage.getItem(CAMPAIGNS_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const saveLocalCampaigns = (nextCampaigns) => {
    try {
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(nextCampaigns))
    } catch {
      // Ignore storage errors.
    }
  }

  const loadCampaigns = async () => {
    try {
      setIsLoading(true)
      const response = await getCampaigns()
      const data = response.data || []
      setCampaigns(data)
      setCampaignsMode('server')
      setError(null)
    } catch (err) {
      const status = err?.response?.status
      if (status === 404) {
        setCampaignsMode('local')
        setCampaigns(loadLocalCampaigns())
        setError(null)
      } else {
        setError(err?.response?.data?.message || err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadAllProducts = async () => {
    try {
      const response = await getProducts()
      const data = response.data;
      const productsArray = Array.isArray(data) ? data : (data?.content || [])
      setAllProducts(productsArray)
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    }
  }

  const openNewCampaignModal = () => {
    setNewCampaign({
      name: '',
      description: '',
      promotionType: 'NONE',
      promoBuyQuantity: '',
      promoPayQuantity: '',
      promoPercentDiscount: '',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '00:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '23:59',
      isActive: true,
      productIds: new Set()
    })
    setIsEditingCampaign(null)
    setIsModalOpen(true)
  }

  const openEditCampaignModal = (campaign) => {
    const startDateTime = new Date(campaign.startDate)
    const endDateTime = new Date(campaign.endDate)

    setNewCampaign({
      name: campaign.name,
      description: campaign.description || '',
      promotionType: campaign.promotionType,
      promoBuyQuantity: campaign.promoBuyQuantity || '',
      promoPayQuantity: campaign.promoPayQuantity || '',
      promoPercentDiscount: campaign.promoPercentDiscount || '',
      startDate: startDateTime.toISOString().split('T')[0],
      startTime: startDateTime.toTimeString().slice(0, 5),
      endDate: endDateTime.toISOString().split('T')[0],
      endTime: endDateTime.toTimeString().slice(0, 5),
      isActive: campaign.isActive,
      productIds: new Set(campaign.productIds || [])
    })
    setIsEditingCampaign(campaign.id)
    setIsModalOpen(true)
  }

  const handleSaveCampaign = async (e) => {
    e.preventDefault()

    if (!newCampaign.name.trim()) {
      alert('El nombre de la campaña es requerido')
      return
    }

    if (!newCampaign.startDate || !newCampaign.endDate) {
      alert('Las fechas de inicio y fin son requeridas')
      return
    }

    if (new Date(`${newCampaign.startDate}T${newCampaign.startTime}`) >= new Date(`${newCampaign.endDate}T${newCampaign.endTime}`)) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin')
      return
    }

    if (newCampaign.promotionType !== 'NONE' && newCampaign.productIds.size === 0) {
      alert('Selecciona al menos un producto para esta campaña')
      return
    }

    // Validate promotion fields
    if (newCampaign.promotionType === 'BUY_X_PAY_Y') {
      const buy = Number(newCampaign.promoBuyQuantity)
      const pay = Number(newCampaign.promoPayQuantity)
      if (buy < 2 || pay < 1 || pay >= buy) {
        alert('Compra debe ser >= 2 y Paga debe ser entre 1 y Compra-1')
        return
      }
    } else if (newCampaign.promotionType === 'PERCENTAGE') {
      const percent = Number(newCampaign.promoPercentDiscount)
      if (percent <= 0 || percent >= 100) {
        alert('El descuento debe estar entre 0 y 100 (exclusivo)')
        return
      }
    }

    const payload = {
      name: newCampaign.name,
      description: newCampaign.description,
      promotionType: newCampaign.promotionType,
      promoBuyQuantity: newCampaign.promotionType === 'BUY_X_PAY_Y' ? Number(newCampaign.promoBuyQuantity) : null,
      promoPayQuantity: newCampaign.promotionType === 'BUY_X_PAY_Y' ? Number(newCampaign.promoPayQuantity) : null,
      promoPercentDiscount: newCampaign.promotionType === 'PERCENTAGE' ? Number(newCampaign.promoPercentDiscount) : null,
      startDate: `${newCampaign.startDate}T${newCampaign.startTime}:00`,
      endDate: `${newCampaign.endDate}T${newCampaign.endTime}:00`,
      isActive: newCampaign.isActive,
      productIds: Array.from(newCampaign.productIds)
    }

    try {
      let response
      if (campaignsMode === 'local') {
        const existing = loadLocalCampaigns()
        if (isEditingCampaign) {
          const next = existing.map((campaign) => (
            campaign.id === isEditingCampaign ? { ...campaign, ...payload, id: isEditingCampaign } : campaign
          ))
          saveLocalCampaigns(next)
        } else {
          const localId = Date.now()
          const next = [{ ...payload, id: localId }, ...existing]
          saveLocalCampaigns(next)
        }
      } else {
        if (isEditingCampaign) {
          response = await updateCampaign(isEditingCampaign, payload)
        } else {
          response = await createCampaign(payload)
        }
      }

      setIsModalOpen(false)
      loadCampaigns()
    } catch (err) {
      alert('Error al guardar campaña: ' + (err?.response?.data?.message || err.message))
    }
  }

  const handleToggleCampaignStatus = async (campaignId) => {
    try {
      if (campaignsMode === 'local') {
        const next = loadLocalCampaigns().map((campaign) => (
          campaign.id === campaignId ? { ...campaign, isActive: !campaign.isActive } : campaign
        ))
        saveLocalCampaigns(next)
      } else {
        await toggleCampaignStatus(campaignId)
      }
      loadCampaigns()
    } catch (err) {
      alert('Error al cambiar estado: ' + (err?.response?.data?.message || err.message))
    }
  }

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta campaña?')) return

    try {
      if (campaignsMode === 'local') {
        const next = loadLocalCampaigns().filter((campaign) => campaign.id !== campaignId)
        saveLocalCampaigns(next)
      } else {
        await deleteCampaign(campaignId)
      }
      loadCampaigns()
    } catch (err) {
      alert('Error al eliminar campaña: ' + (err?.response?.data?.message || err.message))
    }
  }

  const getPromotionLabel = (campaign) => {
    if (campaign.promotionType === 'BUY_X_PAY_Y') {
      return `${campaign.promoBuyQuantity}x${campaign.promoPayQuantity}`
    }
    if (campaign.promotionType === 'PERCENTAGE') {
      return `${campaign.promoPercentDiscount}% OFF`
    }
    return 'Sin promoción'
  }

  const isCurrentlyActive = (campaign) => {
    const now = new Date()
    const start = new Date(campaign.startDate)
    const end = new Date(campaign.endDate)
    return campaign.isActive && now >= start && now <= end
  }

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-black text-slate-900">🎯 Gestión de Campañas</h2>
        <button
          onClick={onNavigateBack}
          className="px-4 py-2 rounded-xl bg-slate-400 text-white font-bold hover:bg-slate-500 transition-colors"
        >
          ← Volver
        </button>
      </div>

      {campaignsMode === 'local' && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
          El backend no expone /campaigns (404). Estas campañas se guardan localmente en este navegador.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Buscar campaña..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-xl border-2 border-slate-200 p-3 font-bold outline-none focus:border-blue-500"
        />
        <button
          onClick={openNewCampaignModal}
          className="px-6 py-3 bg-blue-700 text-white font-black rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200"
        >
          + Nueva Campaña
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-600">Cargando campañas...</div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 text-slate-600">No hay campañas. ¡Crea la primera!</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className={`p-4 rounded-2xl border-2 ${isCurrentlyActive(campaign) ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-slate-900">{campaign.name}</h3>
                    {isCurrentlyActive(campaign) && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-black rounded-full">EN VIGOR</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{campaign.description || '(sin descripción)'}</p>
                </div>
                <button
                  onClick={() => handleToggleCampaignStatus(campaign.id)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${
                    campaign.isActive
                      ? 'bg-green-200 text-green-900 hover:bg-green-300'
                      : 'bg-red-200 text-red-900 hover:bg-red-300'
                  }`}
                >
                  {campaign.isActive ? '✓ Activa' : '✗ Inactiva'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <p className="font-bold text-slate-600">Oferta</p>
                  <p className="text-lg font-black text-blue-700">{getPromotionLabel(campaign)}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-600">Vigencia</p>
                  <p className="text-xs text-slate-700">
                    {new Date(campaign.startDate).toLocaleDateString('es-ES')} a{' '}
                    {new Date(campaign.endDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              <div className="mb-3 p-2 bg-slate-100 rounded-lg">
                <p className="text-xs font-bold text-slate-600 mb-2">Productos asignados ({campaign.productIds.length})</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.productIds.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Sin productos</span>
                  ) : (
                    campaign.productIds.map((productId) => {
                      const product = allProducts.find(p => p.id === productId)
                      return (
                        <span key={productId} className="px-2 py-1 bg-slate-300 text-slate-900 text-xs font-bold rounded-full">
                          {product?.name || `Producto #${productId}`}
                        </span>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditCampaignModal(campaign)}
                  className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-900 font-bold rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDeleteCampaign(campaign.id)}
                  className="flex-1 px-4 py-2 bg-red-100 text-red-900 font-bold rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear/editar campaña */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b bg-blue-50/50 sticky top-0">
              <h3 className="text-lg font-black text-blue-900 uppercase">
                {isEditingCampaign ? '✏️ Editar Campaña' : '🎯 Nueva Campaña'}
              </h3>
            </div>
            <form onSubmit={handleSaveCampaign} className="p-6 space-y-4 max-h-[calc(90vh-180px)] overflow-y-auto scrollbar">
              <input
                type="text"
                placeholder="Nombre de la campaña"
                className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                required
              />

              <textarea
                placeholder="Descripción (opcional)"
                className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
                rows="2"
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
              />

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Fechas de vigencia</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Inicio</label>
                    <input
                      type="date"
                      className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                      required
                    />
                    <input
                      type="time"
                      className="w-full border-2 border-gray-100 rounded-xl p-2 outline-none focus:border-blue-500 font-bold text-sm mt-1"
                      value={newCampaign.startTime}
                      onChange={(e) => setNewCampaign({...newCampaign, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Fin</label>
                    <input
                      type="date"
                      className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                      required
                    />
                    <input
                      type="time"
                      className="w-full border-2 border-gray-100 rounded-xl p-2 outline-none focus:border-blue-500 font-bold text-sm mt-1"
                      value={newCampaign.endTime}
                      onChange={(e) => setNewCampaign({...newCampaign, endTime: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
                <p className="text-xs font-black uppercase tracking-wider text-amber-800 mb-2">Tipo de oferta</p>
                <select
                  className="w-full rounded-xl border-2 border-amber-100 bg-white p-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-400"
                  value={newCampaign.promotionType}
                  onChange={(e) => {
                    const nextType = e.target.value
                    if (nextType === 'BUY_X_PAY_Y') {
                      setNewCampaign({
                        ...newCampaign,
                        promotionType: nextType,
                        promoBuyQuantity: '3',
                        promoPayQuantity: '2',
                        promoPercentDiscount: ''
                      })
                      return
                    }
                    if (nextType === 'PERCENTAGE') {
                      setNewCampaign({
                        ...newCampaign,
                        promotionType: nextType,
                        promoBuyQuantity: '',
                        promoPayQuantity: '',
                        promoPercentDiscount: '50'
                      })
                      return
                    }
                    setNewCampaign({
                      ...newCampaign,
                      promotionType: 'NONE',
                      promoBuyQuantity: '',
                      promoPayQuantity: '',
                      promoPercentDiscount: ''
                    })
                  }}
                >
                  <option value="NONE">Sin oferta</option>
                  <option value="BUY_X_PAY_Y">Compra X, paga Y (ej: 3x2 / 2x1)</option>
                  <option value="PERCENTAGE">Porcentaje de descuento (ej: 50%)</option>
                </select>

                {newCampaign.promotionType === 'BUY_X_PAY_Y' && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="2"
                      placeholder="Compra X"
                      className="w-full rounded-xl border border-amber-200 bg-white p-3 text-sm font-bold outline-none focus:border-amber-400"
                      value={newCampaign.promoBuyQuantity}
                      onChange={(e) => setNewCampaign({...newCampaign, promoBuyQuantity: e.target.value})}
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Paga Y"
                      className="w-full rounded-xl border border-amber-200 bg-white p-3 text-sm font-bold outline-none focus:border-amber-400"
                      value={newCampaign.promoPayQuantity}
                      onChange={(e) => setNewCampaign({...newCampaign, promoPayQuantity: e.target.value})}
                    />
                  </div>
                )}

                {newCampaign.promotionType === 'PERCENTAGE' && (
                  <input
                    type="number"
                    min="1"
                    max="99"
                    step="0.01"
                    placeholder="Porcentaje de descuento"
                    className="mt-3 w-full rounded-xl border border-amber-200 bg-white p-3 text-sm font-bold outline-none focus:border-amber-400"
                    value={newCampaign.promoPercentDiscount}
                    onChange={(e) => setNewCampaign({...newCampaign, promoPercentDiscount: e.target.value})}
                  />
                )}
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Selecciona productos</p>
                <div className="border-2 border-gray-100 rounded-xl p-3 max-h-48 overflow-y-auto scrollbar">
                  {allProducts.length === 0 ? (
                    <p className="text-xs text-gray-500">No hay productos disponibles</p>
                  ) : (
                    allProducts.map((product) => (
                      <label key={product.id} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-blue-50 px-2 rounded">
                        <input
                          type="checkbox"
                          checked={newCampaign.productIds.has(product.id)}
                          onChange={(e) => {
                            const newSet = new Set(newCampaign.productIds)
                            if (e.target.checked) {
                              newSet.add(product.id)
                            } else {
                              newSet.delete(product.id)
                            }
                            setNewCampaign({...newCampaign, productIds: newSet})
                          }}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm font-bold text-slate-700 flex-1">{product.name}</span>
                        <span className="text-xs bg-slate-200 px-2 py-1 rounded font-bold">${product.price}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-700 text-white font-black py-3 rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-800"
                >
                  {isEditingCampaign ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignManagementPanel
