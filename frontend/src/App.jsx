import { useEffect, useRef, useState } from 'react'
import { jsPDF } from 'jspdf'
import { getProducts, createProduct, updateProduct, deleteProduct, addStockToProduct, createSale, getSales, getSalesReport, getInventoryReport, getReceipt, suggestCombo, validateAccountCouponCode, getLoyaltyCouponStatus, createCustomCategory, updateProductVisibility } from './services/api'
import CategoryManagementPanel from './components/CategoryManagementPanel'
import CustomerManagementPanel from './components/CustomerManagementPanel'
import CampaignManagementPanel from './components/CampaignManagementPanel'
import ProductCategoryField from './components/ProductCategoryField'
import './styles/scrollbar.css'

function App({ auth, onRequireAuth, onLogout }) {
  const CATEGORY_VISIBLE_LIMIT = 6
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [view, setView] = useState('inventory')
  const [reportType, setReportType] = useState(null)
  const [salesReport, setSalesReport] = useState([])
  const [inventoryReport, setInventoryReport] = useState([])
  const [reportRange, setReportRange] = useState({from: '', to: ''})
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCode, setSearchCode] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 })
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 })
  const [hideExpired, setHideExpired] = useState(false)
  const [showExpiringSoon, setShowExpiringSoon] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('vitallogix_cart')
      return savedCart ? JSON.parse(savedCart) : []
    } catch {
      return []
    }
  })
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    description: '',
    imageUrl: '',
    category: '',
    stock: '',
    price: '',
    expirationDate: '',
    requiresPrescription: false,
    visibleInSuggestions: true,
    promotionType: 'NONE',
    promoBuyQuantity: '',
    promoPayQuantity: '',
    promoPercentDiscount: ''
  })
  const [customCategory, setCustomCategory] = useState('')
  const [expirationSelection, setExpirationSelection] = useState({ day: '', month: '', year: '' })
  const [saleCompleted, setSaleCompleted] = useState(false)
  const [lastSaleId, setLastSaleId] = useState(null)
  const [recommendationResult, setRecommendationResult] = useState(null)
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false)
  const [isRecommendationHovering, setIsRecommendationHovering] = useState(false)
  const recommendationScrollRef = useRef(null)
  const cartIconRef = useRef(null)
  const cartDrawerAutoCloseRef = useRef(null)
  const [isCartIconBumping, setIsCartIconBumping] = useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const [commercePage, setCommercePage] = useState('/products')
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('card')
  const [isPrescriptionSale, setIsPrescriptionSale] = useState(false)
  const [saleCustomer, setSaleCustomer] = useState({
    name: '',
    address: '',
    phone: '',
    friend: false,
    clienteAmigoNumber: ''
  })
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceData, setInvoiceData] = useState({
    razonSocial: '',
    rfc: '',
    domicilioFiscal: '',
    usoCfdi: 'G03',
    metodoPago: 'PUE',
    formaPago: '01',
    regimenFiscal: ''
  })
  const [couponCode, setCouponCode] = useState('')
  const [couponFeedback, setCouponFeedback] = useState({ status: 'idle', message: '' })
  const [couponApplied, setCouponApplied] = useState(false)
  const [loyaltyCouponStatus, setLoyaltyCouponStatus] = useState({
    hasAvailableCoupon: false,
    couponCode: '',
    purchasesSinceCoupon: 0,
    purchasesToNextCoupon: 5,
  })
  const [loyaltyPromotionBanner, setLoyaltyPromotionBanner] = useState(null)
  const [showPaymentGatewayModal, setShowPaymentGatewayModal] = useState(false)

  const closeCouponFeedback = () => {
    setCouponFeedback({ status: 'idle', message: '' })
  }

  // Roles and authentication
  const isAdmin = auth?.role === 'admin';
  const isGuest = !auth?.logged;

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0)
  useEffect(() => {
    try {
      if (cart.length === 0) {
        localStorage.removeItem('vitallogix_cart')
        return
      }
      localStorage.setItem('vitallogix_cart', JSON.stringify(cart))
    } catch {
      // Ignore storage errors.
    }
  }, [cart])

  // Auto-hide coupon feedback after 2 seconds if valid and 3 seconds if invalid.
  useEffect(() => {
    if (couponFeedback.status === 'valid') {
      const timer = setTimeout(() => {
        closeCouponFeedback()
        setCouponApplied(true)
      }, 2000)
      return () => clearTimeout(timer)
    }

    if (couponFeedback.status === 'invalid') {
      const timer = setTimeout(() => {
        closeCouponFeedback()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [couponFeedback])

  useEffect(() => {
    if (!loyaltyPromotionBanner) return
    const timer = setTimeout(() => {
      setLoyaltyPromotionBanner(null)
    }, 3000)
    return () => clearTimeout(timer)
  }, [loyaltyPromotionBanner])

  const getPromotionLabel = (product) => {
    const promotionType = (product?.promotionType || 'NONE').toUpperCase()
    if (promotionType === 'BUY_X_PAY_Y') {
      const buy = Number(product?.promoBuyQuantity || 0)
      const pay = Number(product?.promoPayQuantity || 0)
      if (buy >= 2 && pay >= 1 && pay < buy) {
        return `${buy}x${pay}`
      }
      return null
    }
    if (promotionType === 'PERCENTAGE') {
      const percent = Number(product?.promoPercentDiscount || 0)
      if (percent > 0 && percent < 100) {
        return `${percent}% OFF`
      }
    }
    return null
  }

  const getLinePricing = (product, quantity) => {
    const unitPrice = Number(product?.price || 0)
    const qty = Number(quantity || 0)
    const gross = unitPrice * qty

    if (qty <= 0 || unitPrice <= 0) {
      return { gross, net: gross, discount: 0 }
    }

    const promotionType = (product?.promotionType || 'NONE').toUpperCase()
    if (promotionType === 'BUY_X_PAY_Y') {
      const buy = Number(product?.promoBuyQuantity || 0)
      const pay = Number(product?.promoPayQuantity || 0)
      if (buy >= 2 && pay >= 1 && pay < buy && qty >= buy) {
        const groups = Math.floor(qty / buy)
        const remainder = qty % buy
        const payableUnits = (groups * pay) + remainder
        const net = unitPrice * payableUnits
        return {
          gross,
          net,
          discount: Math.max(0, gross - net)
        }
      }
      return { gross, net: gross, discount: 0 }
    }

    if (promotionType === 'PERCENTAGE') {
      const percent = Number(product?.promoPercentDiscount || 0)
      if (percent > 0 && percent < 100) {
        const discount = gross * (percent / 100)
        const net = gross - discount
        return {
          gross,
          net,
          discount: Math.max(0, discount)
        }
      }
    }

    return { gross, net: gross, discount: 0 }
  }

  const cartLineBreakdown = cart.map((item) => ({
    item,
    pricing: getLinePricing(item, item.quantity)
  }))
  const cartGrossSubtotal = cartLineBreakdown.reduce((acc, line) => acc + line.pricing.gross, 0)
  const cartPromotionDiscount = cartLineBreakdown.reduce((acc, line) => acc + line.pricing.discount, 0)
  const cartSubtotal = cartLineBreakdown.reduce((acc, line) => acc + line.pricing.net, 0)
  const cartDiscount = couponApplied ? cartSubtotal * 0.1 : 0
  const cartTotal = cartSubtotal - cartDiscount

  const navigateCommerce = (path) => {
    if (path === '/checkout' && cart.length === 0 && !saleCompleted) {
      alert('Agrega al menos 1 producto al carrito antes de ir a checkout.')
      return
    }

    setCommercePage(path)
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
    }
  }

  const handleRequireAuthFromCurrentContext = () => {
    try {
      const currentPath =
        commercePage === '/cart' || commercePage === '/checkout' || commercePage === '/products'
          ? commercePage
          : '/products'
      sessionStorage.setItem('vitallogix_post_auth_page', currentPath)
    } catch {
      // Ignore storage errors.
    }

    if (onRequireAuth) onRequireAuth()
  }

  const handleUserLogout = () => {
    setCart([])
    setSaleCompleted(false)
    setLastSaleId(null)
    setIsCartDrawerOpen(false)
    setShowPaymentGatewayModal(false)
    setCouponCode('')
    setCouponApplied(false)
    setCouponFeedback({ status: 'idle', message: '' })
    setLoyaltyCouponStatus({ hasAvailableCoupon: false, couponCode: '', purchasesSinceCoupon: 0, purchasesToNextCoupon: 5 })
    setLoyaltyPromotionBanner(null)
    setCommercePage('/products')
    setView('inventory')

    try {
      localStorage.removeItem('vitallogix_cart')
    } catch {
      // Ignore storage errors.
    }

    if (window.location.pathname !== '/products') {
      window.history.pushState({}, '', '/products')
    }

    if (onLogout) onLogout()
  }

  const syncCommercePageFromUrl = () => {
    const pathname = window.location.pathname.toLowerCase()
    if (pathname === '/products' || pathname === '/cart' || pathname === '/checkout' || pathname === '/checkout/success') {
      if ((pathname === '/checkout' || pathname === '/checkout/success') && !saleCompleted) {
        setCommercePage('/cart')
        return
      }
      setCommercePage(pathname === '/checkout/success' ? '/checkout' : pathname)
      return
    }
    setCommercePage('/products')
  }

  const animateAddToCart = (triggerElement, product) => {
    if (!triggerElement || !cartIconRef.current) return

    setIsCartIconBumping(true)
    window.setTimeout(() => setIsCartIconBumping(false), 360)

    const startRect = triggerElement.getBoundingClientRect()
    const endRect = cartIconRef.current.getBoundingClientRect()
    const ghost = document.createElement('img')

    ghost.src = product.imageUrl || buildDefaultProductImage(product.name)
    ghost.alt = product.name
    ghost.style.position = 'fixed'
    ghost.style.left = `${startRect.left + startRect.width / 2 - 26}px`
    ghost.style.top = `${startRect.top + startRect.height / 2 - 26}px`
    ghost.style.width = '52px'
    ghost.style.height = '52px'
    ghost.style.borderRadius = '999px'
    ghost.style.objectFit = 'cover'
    ghost.style.zIndex = '9999'
    ghost.style.pointerEvents = 'none'
    ghost.style.boxShadow = '0 14px 28px rgba(30, 64, 175, 0.35)'
    ghost.style.transition = 'transform 700ms cubic-bezier(.2,.9,.2,1), opacity 700ms ease'
    ghost.style.transform = 'translate3d(0, 0, 0) scale(1)'
    ghost.style.opacity = '0.95'
    document.body.appendChild(ghost)

    const deltaX = endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2)
    const deltaY = endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2)

    requestAnimationFrame(() => {
      ghost.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.15)`
      ghost.style.opacity = '0.15'
    })

    ghost.addEventListener('transitionend', () => {
      ghost.remove()
    }, { once: true })
  }

  const openCartDrawerTemporarily = () => {
    if (cartDrawerAutoCloseRef.current) {
      window.clearTimeout(cartDrawerAutoCloseRef.current)
    }

    setIsCartDrawerOpen(true)
    cartDrawerAutoCloseRef.current = window.setTimeout(() => {
      setIsCartDrawerOpen(false)
      cartDrawerAutoCloseRef.current = null
    }, 1000)
  }

  // --- PRODUCT LOGIC ---
  const addToCart = (product, triggerElement = null) => {
    if (product.stock <= 0) return alert("Producto sin existencias");
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert("No hay más unidades disponibles en el inventario");
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
      animateAddToCart(triggerElement, product)
      if (commercePage === '/products') {
        openCartDrawerTemporarily()
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      animateAddToCart(triggerElement, product)
      if (commercePage === '/products') {
        openCartDrawerTemporarily()
      }
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(i => i.id !== id))
  }

  const getCartQuantity = (productId) => {
    const item = cart.find((cartItem) => cartItem.id === productId)
    return item ? item.quantity : 0
  }

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        const product = products.find(p => p.id === id);
        if (newQty > 0 && newQty <= product.stock) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await deleteProduct(id);
      fetchProducts();
      alert('Producto eliminado');
    } catch (e) {
      if (e?.response?.status === 409) {
        alert('No se puede eliminar el producto porque ya tiene ventas asociadas.');
      } else {
        alert('Error al eliminar producto');
      }
    }
  };

  const handleRestockProduct = async (id, productName) => {
    const input = window.prompt(`¿Cuántas unidades deseas agregar a ${productName}?`, '10');
    if (input === null) return;
    const quantity = Number(input);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert('Ingresa una cantidad entera mayor a 0.');
      return;
    }
    try {
      await addStockToProduct(id, quantity);
      await fetchProducts();
      alert(`Se agregaron ${quantity} unidades a ${productName}.`);
    } catch (e) {
      alert('No se pudo actualizar el stock.');
    }
  };

  const resetProductForm = () => {
    setNewProduct({
      name: '',
      code: '',
      description: '',
      imageUrl: '',
      category: '',
      stock: '',
      price: '',
      expirationDate: '',
      requiresPrescription: false,
      visibleInSuggestions: true,
      promotionType: 'NONE',
      promoBuyQuantity: '',
      promoPayQuantity: '',
      promoPercentDiscount: ''
    })
    setCustomCategory('')
    setExpirationSelection({ day: '', month: '', year: '' })
    setEditingProductId(null)
  }

  const openCreateProductModal = () => {
    resetProductForm()
    setIsModalOpen(true)
  }

  const openEditProductModal = (product) => {
    const sourceDate = product.expirationDate ? String(product.expirationDate).slice(0, 10) : ''
    const [year = '', month = '', day = ''] = sourceDate ? sourceDate.split('-') : []

    const allExistingCategories = Array.from(new Set([...categories, ...suggestedCategories]))
    const isKnownCategory = allExistingCategories.includes(product.category)
    
    setNewProduct({
      name: product.name || '',
      code: product.code || '',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      category: isKnownCategory ? product.category : 'OTHER',
      stock: String(product.stock ?? ''),
      price: String(product.price ?? ''),
      expirationDate: sourceDate,
      requiresPrescription: Boolean(product.requiresPrescription),
      visibleInSuggestions: product.visibleInSuggestions !== false,
      promotionType: product.promotionType || 'NONE',
      promoBuyQuantity: product.promoBuyQuantity != null ? String(product.promoBuyQuantity) : '',
      promoPayQuantity: product.promoPayQuantity != null ? String(product.promoPayQuantity) : '',
      promoPercentDiscount: product.promoPercentDiscount != null ? String(product.promoPercentDiscount) : ''
    })
    
    if (!isKnownCategory) {
      setCustomCategory(product.category || '')
    } else {
      setCustomCategory('')
    }
    
    setExpirationSelection({ day, month, year })
    setEditingProductId(product.id)
    setIsModalOpen(true)
  }

  // --- EFFECTS AND FETCHING ---
  useEffect(() => {
    fetchProducts()
    if (auth?.logged) {
      fetchSales()
      fetchLoyaltyStatus()
    } else {
      setLoyaltyCouponStatus({ hasAvailableCoupon: false, couponCode: '', purchasesSinceCoupon: 0, purchasesToNextCoupon: 5 })
    }
  }, [auth?.logged, isAdmin])

  useEffect(() => {
    syncCommercePageFromUrl()
    window.addEventListener('popstate', syncCommercePageFromUrl)
    return () => {
      window.removeEventListener('popstate', syncCommercePageFromUrl)
    }
  }, [])

  useEffect(() => {
    if (commercePage !== '/products') {
      setIsCartDrawerOpen(false)
    }
  }, [commercePage])

  useEffect(() => {
    if (commercePage === '/checkout' && cart.length === 0 && !saleCompleted) {
      setCommercePage('/cart')
      if (window.location.pathname !== '/cart') {
        window.history.pushState({}, '', '/cart')
      }
    }
  }, [commercePage, cart.length, saleCompleted])

  useEffect(() => {
    if (!auth?.logged) return

    let postAuthPage = null
    try {
      postAuthPage = sessionStorage.getItem('vitallogix_post_auth_page')
      sessionStorage.removeItem('vitallogix_post_auth_page')
    } catch {
      // Ignore storage errors.
    }

    const target = postAuthPage === '/cart' || postAuthPage === '/products'
      ? postAuthPage
      : null

    if (!target) return

    setCommercePage(target)
    if (window.location.pathname !== target) {
      window.history.pushState({}, '', target)
    }
  }, [auth?.logged])

  useEffect(() => {
    return () => {
      if (cartDrawerAutoCloseRef.current) {
        window.clearTimeout(cartDrawerAutoCloseRef.current)
      }
    }
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await getProducts()
      setProducts(response.data.content || response.data)
    } catch (error) { console.error("Error productos:", error) }
  }

  const fetchSales = async () => {
    if (!auth?.logged) {
      setSales([])
      return
    }
    try {
      const response = await getSales()
      setSales(Array.isArray(response.data) ? response.data : [])
    } catch (error) { console.error("Error ventas:", error) }
  }

  const categories = [...new Set(products.map((p) => (p.category || '').trim()).filter(Boolean))]
  const hasHiddenCategories = categories.length > CATEGORY_VISIBLE_LIMIT
  const displayedCategories = showAllCategories ? categories : categories.slice(0, CATEGORY_VISIBLE_LIMIT)

  useEffect(() => {
    if (!hasHiddenCategories) {
      setShowAllCategories(false)
    }
  }, [hasHiddenCategories])

  useEffect(() => {
    if (!products.length) {
      setPriceBounds({ min: 0, max: 0 })
      setPriceRange({ min: 0, max: 0 })
      return
    }

    const prices = products.map((p) => Number(p.price || 0)).filter((price) => Number.isFinite(price))
    const min = Math.floor(Math.min(...prices))
    const max = Math.ceil(Math.max(...prices))

    setPriceBounds({ min, max })
    setPriceRange((prev) => {
      if (prev.min === 0 && prev.max === 0) {
        return { min, max }
      }
      return {
        min: Math.max(min, Math.min(prev.min, max)),
        max: Math.min(max, Math.max(prev.max, min))
      }
    })
  }, [products])

  const buildDefaultProductImage = (name = 'Producto') => {
    const label = (name || 'Producto').slice(0, 28)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#d1d5db"/><rect x="40" y="40" width="720" height="520" rx="24" fill="#e5e7eb" stroke="#9ca3af" stroke-width="6" stroke-dasharray="18 12"/><text x="400" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#4b5563">No hay imagen</text><text x="400" y="335" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#6b7280">${label}</text></svg>`
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  }

  const handleProductImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setNewProduct((prev) => ({ ...prev, imageUrl: String(reader.result || '') }))
    }
    reader.readAsDataURL(file)
  }

  const toggleCategorySelection = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category)
      }
      return [...prev, category]
    })
  }

  const handlePriceMinChange = (value) => {
    const numeric = Number(value)
    setPriceRange((prev) => ({ min: Math.min(numeric, prev.max), max: prev.max }))
  }

  const handlePriceMaxChange = (value) => {
    const numeric = Number(value)
    setPriceRange((prev) => ({ min: prev.min, max: Math.max(numeric, prev.min) }))
  }
  const expirationMonths = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ]
  const currentYear = new Date().getFullYear()
  const expirationYears = Array.from({ length: 21 }, (_, index) => String(currentYear + index))
  const maxExpirationDay = expirationSelection.year && expirationSelection.month
    ? new Date(Number(expirationSelection.year), Number(expirationSelection.month), 0).getDate()
    : 31

  const handleExpirationSelection = (field, value) => {
    const nextSelection = { ...expirationSelection, [field]: value }

    if (nextSelection.year && nextSelection.month && nextSelection.day) {
      const maxDayForMonth = new Date(Number(nextSelection.year), Number(nextSelection.month), 0).getDate()
      const normalizedDay = String(Math.min(Number(nextSelection.day), maxDayForMonth)).padStart(2, '0')
      const normalizedSelection = { ...nextSelection, day: normalizedDay }
      const formattedDate = `${normalizedSelection.year}-${normalizedSelection.month}-${normalizedSelection.day}`

      setExpirationSelection(normalizedSelection)
      setNewProduct((prev) => ({ ...prev, expirationDate: formattedDate }))
      return
    }

    setExpirationSelection(nextSelection)
    setNewProduct((prev) => ({ ...prev, expirationDate: '' }))
  }
  const suggestedCategories = [
    'Analgésicos',
    'Antibióticos',
    'Antiinflamatorios',
    'Antigripales',
    'Antialérgicos',
    'Vitaminas',
    'Suplementos',
    'Controlados',
    'Higiene',
    'Cuidado personal'
  ]

  const isProductExpired = (product) => {
    if (!product.expirationDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiration = new Date(product.expirationDate)
    expiration.setHours(0, 0, 0, 0)
    return expiration < today
  }

  const isProductExpiringSoon = (product, days = 60) => {
    if (!product.expirationDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiration = new Date(product.expirationDate)
    expiration.setHours(0, 0, 0, 0)
    const ms = expiration.getTime() - today.getTime()
    const daysLeft = Math.ceil(ms / (1000 * 60 * 60 * 24))
    return daysLeft >= 0 && daysLeft <= days
  }

  const filteredProducts = products.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCode = !searchCode || (p.code || '').toLowerCase().includes(searchCode.trim().toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes((p.category || '').trim())
    const numericPrice = Number(p.price || 0)
    const matchesPrice = (priceBounds.max === 0 && priceBounds.min === 0)
      ? true
      : numericPrice >= priceRange.min && numericPrice <= priceRange.max
    const matchesExpiredFilter = !hideExpired || !isProductExpired(p)
    const matchesSoonFilter = !showExpiringSoon || isProductExpiringSoon(p)
    return matchesName && matchesCode && matchesCategory && matchesPrice && matchesExpiredFilter && matchesSoonFilter
  })

  const validateCheckoutBeforePayment = () => {
    if (cart.length === 0) return false

    if (isGuest) {
      handleRequireAuthFromCurrentContext()
      return false
    }

    const hasPrescriptionProducts = cart.some((item) => Boolean(item.requiresPrescription))
    if (hasPrescriptionProducts && !isPrescriptionSale) {
      alert('No se puede concretar la venta: el carrito contiene productos con receta. Activa "Venta con receta" y captura los datos del cliente.')
      return false
    }

    if (isPrescriptionSale) {
      if (!saleCustomer.name || !saleCustomer.address || !saleCustomer.phone) {
        alert('Para venta con receta debes capturar nombre, direccion y telefono del cliente.')
        return false
      }
    }

    return true
  }

  const buildSalePayload = () => {
    const payload = {
      items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
      prescription: isPrescriptionSale,
      paymentMethod: checkoutPaymentMethod,
      couponCode: couponApplied ? couponCode.trim().toUpperCase() : null,
    }

    const shouldSendCustomer =
      isPrescriptionSale ||
      Boolean(saleCustomer.name?.trim()) ||
      Boolean(saleCustomer.address?.trim()) ||
      Boolean(saleCustomer.phone?.trim())

    if (shouldSendCustomer) {
      payload.customer = {
        name: saleCustomer.name?.trim() || (isPrescriptionSale ? '' : null),
        address: saleCustomer.address,
        phone: saleCustomer.phone,
        friend: false,
        clienteAmigoNumber: null,
      }
    }

    return payload
  }

  const handleCheckout = () => {
    if (!validateCheckoutBeforePayment()) return
    setShowPaymentGatewayModal(true)
  }

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode.trim().toUpperCase()

    if (!normalizedCode) {
      setCouponFeedback({ status: 'invalid', message: 'Ingresa un codigo para aplicar el cupon.' })
      setCouponApplied(false)
      return
    }

    if (isGuest) {
      setCouponFeedback({ status: 'invalid', message: 'Necesitas iniciar sesion para validar codigos.' })
      setCouponApplied(false)
      return
    }

    try {
      setCouponFeedback({ status: 'checking', message: 'Validando cupon de la cuenta...' })
      const response = await validateAccountCouponCode(normalizedCode)
      const data = response.data || {}

      if (!data.valid) {
        setCouponFeedback({ status: 'invalid', message: data.message || 'El cupon no es valido.' })
        setCouponApplied(false)
        return
      }

      setCouponApplied(true)
      setCouponFeedback({ status: 'valid', message: data.message || 'Cupón válido. Se aplicará 10% en esta compra.' })
    } catch (error) {
      setCouponFeedback({ status: 'invalid', message: 'No se pudo validar el cupon. Intenta de nuevo.' })
      setCouponApplied(false)
    }
  }

  const fetchLoyaltyStatus = async () => {
    if (!auth?.logged) {
      setLoyaltyCouponStatus({ hasAvailableCoupon: false, couponCode: '', purchasesSinceCoupon: 0, purchasesToNextCoupon: 5 })
      return
    }

    try {
      const res = await getLoyaltyCouponStatus()
      const data = res.data || {}
      setLoyaltyCouponStatus({
        hasAvailableCoupon: Boolean(data.hasAvailableCoupon),
        couponCode: data.couponCode || '',
        purchasesSinceCoupon: Number(data.purchasesSinceCoupon || 0),
        purchasesToNextCoupon: Number(data.purchasesToNextCoupon || 5),
      })
    } catch {
      setLoyaltyCouponStatus({ hasAvailableCoupon: false, couponCode: '', purchasesSinceCoupon: 0, purchasesToNextCoupon: 5 })
    }
  }

  const handleConfirmGatewayPayment = async () => {
    if (!validateCheckoutBeforePayment()) return

    try {
      const payload = buildSalePayload()
      const res = await createSale(payload)
      const promotedCode = res?.data?.loyaltyAwardedCode
      if (promotedCode) {
        setLoyaltyPromotionBanner({ code: promotedCode })
      }

      setLastSaleId(res?.data?.id ?? null)
      setSaleCompleted(true)
      setShowPaymentGatewayModal(false)
      alert('Venta realizada con éxito 🛒')
      setCart([])
      setIsPrescriptionSale(false)
      setSaleCustomer({ name: '', address: '', phone: '', friend: false, clienteAmigoNumber: '' })
      setCouponCode('')
      setCouponApplied(false)
      setCouponFeedback({ status: 'idle', message: '' })
      localStorage.removeItem('vitallogix_cart')
      fetchProducts()
      fetchSales()
      fetchLoyaltyStatus()
      navigateCommerce('/checkout')
    } catch (e) {
      const backendError = e?.response?.data
      const backendMessage =
        typeof backendError === 'string'
          ? backendError
          : backendError?.message

      if (backendMessage && backendMessage.trim()) {
        alert(backendMessage)
        return
      }

      alert('No se pudo concretar la venta.')
    }
  }

  useEffect(() => {
    let isActive = true

    const fetchAutoSuggestions = async () => {
      if (cart.length === 0) {
        if (!isActive) return
        setRecommendationResult(null)
        setIsRecommendationLoading(false)
        return
      }

      try {
        setIsRecommendationLoading(true)
        const prioritizedProductIds = [...new Set(cart.map((item) => item.id))]
        const res = await suggestCombo(prioritizedProductIds, 8)
        if (!isActive) return
        setRecommendationResult(res.data)
      } catch (e) {
        if (!isActive) return
        setRecommendationResult({
          recommendedItems: [],
          message: 'No pudimos cargar sugerencias en este momento.'
        })
      } finally {
        if (!isActive) return
        setIsRecommendationLoading(false)
      }
    }

    fetchAutoSuggestions()

    return () => {
      isActive = false
    }
  }, [cart])

  const handleAddSuggestedProduct = (suggestedId) => {
    const product = products.find((p) => p.id === suggestedId)
    if (!product) return
    addToCart(product)
    if (commercePage === '/products') {
      setIsCartDrawerOpen(true)
    }
  }

  const scrollRecommendations = (direction) => {
    const container = recommendationScrollRef.current
    if (!container) return
    const amount = Math.round(container.clientWidth * 0.85)
    container.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    const container = recommendationScrollRef.current
    if (!container) return
    if (isRecommendationHovering) return
    if (!recommendationResult?.recommendedItems?.length) return

    const intervalId = setInterval(() => {
      const maxScrollLeft = container.scrollWidth - container.clientWidth
      const remaining = maxScrollLeft - container.scrollLeft

      if (remaining <= 8) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
        return
      }

      const amount = Math.round(container.clientWidth * 0.85)
      container.scrollBy({ left: amount, behavior: 'smooth' })
    }, 3400)

    return () => clearInterval(intervalId)
  }, [recommendationResult, isRecommendationHovering])

  const handleToggleProductVisibility = async (product, field) => {
    const nextValue = !Boolean(product[field]);
    try {
      await updateProductVisibility(product.id, { [field]: nextValue });
      await fetchProducts();
    } catch (e) {
      const status = e?.response?.status;
      const backendMessage =
        typeof e?.response?.data === 'string'
          ? e.response.data
          : e?.response?.data?.message;

      // Fallback for environments running an older backend without PATCH /visibility.
      if (status === 404 || status === 405) {
        try {
          await updateProduct(product.id, {
            name: product.name,
            code: product.code,
            description: product.description || null,
            imageUrl: product.imageUrl || buildDefaultProductImage(product.name),
            category: product.category,
            stock: parseInt(product.stock, 10),
            price: parseFloat(product.price),
            requiresPrescription: Boolean(product.requiresPrescription),
            visibleInSuggestions: field === 'visibleInSuggestions' ? nextValue : (product.visibleInSuggestions !== false),
            promotionType: product.promotionType || 'NONE',
            promoBuyQuantity: product.promoBuyQuantity ?? null,
            promoPayQuantity: product.promoPayQuantity ?? null,
            promoPercentDiscount: product.promoPercentDiscount ?? null,
            expirationDate: product.expirationDate ? String(product.expirationDate) : null
          });
          await fetchProducts();
          return;
        } catch (fallbackError) {
          const fallbackMessage =
            typeof fallbackError?.response?.data === 'string'
              ? fallbackError.response.data
              : fallbackError?.response?.data?.message;
          alert(fallbackMessage || 'No se pudo actualizar la visibilidad de sugerencias.');
          return;
        }
      }

      if (status === 403) {
        alert('Tu sesión no tiene permisos de administrador para cambiar sugerencias.');
        return;
      }

      alert(backendMessage || 'No se pudo actualizar la visibilidad de sugerencias.');
    }
  };

  const fetchLastReceipt = async () => {
    if (!lastSaleId) {
      alert('No se encontró el folio de la última venta.');
      return null;
    }
    try {
      const res = await getReceipt(lastSaleId);
      return res.data;
    } catch (e) {
      alert('No se pudo generar el ticket.');
      return null;
    }
  };

  const handleDownloadTicketPdf = async () => {
    const receipt = await fetchLastReceipt();
    if (!receipt) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 15;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('VITALLOGIX', margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Ticket de venta', margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Folio: #VL-${receipt.saleId}`, margin, y);
    y += 6;
    doc.text(`Fecha: ${new Date(receipt.saleDate).toLocaleString()}`, margin, y);
    y += 6;

    if (receipt.customerName) {
      doc.text(`Cliente: ${receipt.customerName}`, margin, y);
      y += 6;
    }

    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    (receipt.items || []).forEach((item) => {
      const line = `${item.productName} x${item.quantity}  -  $${Number(item.subtotal || 0).toFixed(2)}`;
      const wrapped = doc.splitTextToSize(line, 175);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 5;
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
    });

    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${Number(receipt.totalAmount || 0).toFixed(2)}`, margin, y);
    y += 6;
    doc.text(`Descuento: $${Number(receipt.discount || 0).toFixed(2)}`, margin, y);
    y += 6;
    doc.text(`Final: $${Number(receipt.finalAmount || 0).toFixed(2)}`, margin, y);
    y += 8;

    if (receipt.loyaltyAwardedCode) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Nuevo codigo ClienteAmigo: ${receipt.loyaltyAwardedCode}`, margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('Guardalo para canjear tu descuento en una sola compra.', margin, y);
    }

    doc.save(`ticket-VL-${receipt.saleId}.pdf`);
  };

  const handleOpenInvoiceModal = async () => {
    const receipt = await fetchLastReceipt();
    if (!receipt) return;
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoicePdf = async () => {
    const receipt = await fetchLastReceipt();
    if (!receipt) return;

    if (!invoiceData.razonSocial.trim() || !invoiceData.rfc.trim()) {
      alert('Captura al menos Razón Social y RFC para facturar.');
      return;
    }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 15;
    let y = 18;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('VITALLOGIX', margin, y);
    doc.setFontSize(10);
    doc.text('Factura simplificada', 160, y, { align: 'right' });
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Emisor: VitalLogix S.A. de C.V.', margin, y);
    y += 5;
    doc.text('RFC Emisor: VIT260401AB1', margin, y);
    y += 5;
    doc.text('Lugar de expedicion: 97000', margin, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Datos del receptor', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`Razon social: ${invoiceData.razonSocial}`, margin, y);
    y += 5;
    doc.text(`RFC: ${invoiceData.rfc.toUpperCase()}`, margin, y);
    y += 5;
    doc.text(`Domicilio fiscal: ${invoiceData.domicilioFiscal || 'N/A'}`, margin, y);
    y += 5;
    doc.text(`Regimen fiscal: ${invoiceData.regimenFiscal}`, margin, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Datos CFDI', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`Folio venta: VL-${receipt.saleId}`, margin, y);
    y += 5;
    doc.text(`Fecha: ${new Date(receipt.saleDate).toLocaleString()}`, margin, y);
    y += 5;
    doc.text(`Uso CFDI: ${invoiceData.usoCfdi}`, margin, y);
    y += 5;
    doc.text(`Metodo de pago: ${invoiceData.metodoPago}`, margin, y);
    y += 5;
    doc.text(`Forma de pago: ${invoiceData.formaPago}`, margin, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Conceptos', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    (receipt.items || []).forEach((item) => {
      const line = `${item.productName} x${item.quantity}  $${Number(item.unitPrice || 0).toFixed(2)}  Importe: $${Number(item.subtotal || 0).toFixed(2)}`;
      const wrapped = doc.splitTextToSize(line, 180);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 4.5;
      if (y > 260) {
        doc.addPage();
        y = 18;
      }
    });

    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: $${Number(receipt.totalAmount || 0).toFixed(2)}`, 195, y, { align: 'right' });
    y += 5;
    const iva = Number(receipt.finalAmount || receipt.totalAmount || 0) * 0.16;
    doc.text(`IVA (16%): $${iva.toFixed(2)}`, 195, y, { align: 'right' });
    y += 5;
    doc.text(`Total: $${(Number(receipt.finalAmount || 0) + iva).toFixed(2)}`, 195, y, { align: 'right' });

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Documento generado para fines internos de punto de venta.', margin, y);

    doc.save(`factura-VL-${receipt.saleId}.pdf`);
    setShowInvoiceModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newProduct.category.trim()) {
      alert('La categoria es obligatoria.');
      return;
    }

    if (newProduct.category === 'OTHER' && !customCategory.trim()) {
      alert('Especifica el nombre de la nueva categoría.');
      return;
    }

    if (!newProduct.expirationDate) {
      alert('La fecha de vencimiento es obligatoria.');
      return;
    }

    if (newProduct.promotionType === 'BUY_X_PAY_Y') {
      const buy = Number(newProduct.promoBuyQuantity)
      const pay = Number(newProduct.promoPayQuantity)
      if (!Number.isInteger(buy) || !Number.isInteger(pay) || buy < 2 || pay < 1 || pay >= buy) {
        alert('Configura la oferta tipo compra X paga Y con valores válidos (buy>=2 y 1<=pay<buy).')
        return
      }
    }

    if (newProduct.promotionType === 'PERCENTAGE') {
      const percent = Number(newProduct.promoPercentDiscount)
      if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
        alert('Configura un porcentaje de descuento válido (mayor a 0 y menor a 100).')
        return
      }
    }

    try {
      const finalCategory = newProduct.category === 'OTHER' ? customCategory.trim() : newProduct.category.trim();
      
      const payload = {
        name: newProduct.name,
        code: newProduct.code,
        description: newProduct.description || null,
        imageUrl: newProduct.imageUrl || buildDefaultProductImage(newProduct.name),
        category: finalCategory,
        stock: parseInt(newProduct.stock),
        price: parseFloat(newProduct.price),
        requiresPrescription: newProduct.requiresPrescription,
        visibleInSuggestions: newProduct.visibleInSuggestions,
        promotionType: newProduct.promotionType,
        promoBuyQuantity: newProduct.promotionType === 'BUY_X_PAY_Y' ? Number(newProduct.promoBuyQuantity) : null,
        promoPayQuantity: newProduct.promotionType === 'BUY_X_PAY_Y' ? Number(newProduct.promoPayQuantity) : null,
        promoPercentDiscount: newProduct.promotionType === 'PERCENTAGE' ? Number(newProduct.promoPercentDiscount) : null,
        expirationDate: `${newProduct.expirationDate}T00:00:00`
      };

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
      } else {
        await createProduct(payload);
      }

      setIsModalOpen(false);
      resetProductForm();
      fetchProducts();
    } catch (error) {
      if (error?.response?.status === 409) {
        alert('El codigo del producto ya existe.');
      } else {
        alert('Error al guardar');
      }
    }
  };

  // --- REPORTS ---
  const fetchSalesReport = async (fromParam, toParam) => {
    const from = fromParam || reportRange.from
    const to = toParam || reportRange.to
    if (!from || !to) return alert('Selecciona un rango de fechas');
    try {
      const res = await getSalesReport(from, to);
      setSalesReport(res.data);
      setReportType('sales');
    } catch (e) { alert('Error al obtener reporte de ventas'); }
  };

  const formatDateInput = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const applyQuickSalesRange = (period) => {
    const today = new Date()
    let from = new Date(today)

    if (period === 'daily') {
      from = new Date(today)
    } else if (period === 'weekly') {
      from.setDate(today.getDate() - 6)
    } else if (period === 'monthly') {
      from = new Date(today.getFullYear(), today.getMonth(), 1)
    } else if (period === 'annual') {
      from = new Date(today.getFullYear(), 0, 1)
    }

    const fromValue = formatDateInput(from)
    const toValue = formatDateInput(today)
    setReportRange({ from: fromValue, to: toValue })
    fetchSalesReport(fromValue, toValue)
  }
  const fetchInventoryReport = async () => {
    try {
      const res = await getInventoryReport();
      setInventoryReport(res.data);
      setReportType('inventory');
    } catch (e) { alert('Error al obtener reporte de inventario'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-blue-800 tracking-tighter italic">VITALLOGIX</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">UADY | Ingeniería de Software</p>
        </div>
        <div className="flex items-center gap-4">
          {auth?.logged ? (
            <>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl">{auth.username}</span>
              <button
                onClick={handleUserLogout}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-700 hover:bg-red-100"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRequireAuthFromCurrentContext}
                className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700 hover:bg-blue-50"
              >
                Iniciar sesion
              </button>
              <button
                onClick={handleUserLogout}
                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-red-700 hover:bg-red-50"
              >
                Salir
              </button>
            </div>
          )}
        </div>
        <nav className="flex bg-gray-200 p-1 rounded-2xl shadow-inner">
          <button 
            onClick={() => setView('inventory')}
            className={`px-6 py-2 rounded-xl font-black text-xs uppercase transition-all ${view === 'inventory' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
          >
            🛒 Ventas
          </button>
          {isAdmin && (
            <button 
              onClick={() => setView('history')}
              className={`px-6 py-2 rounded-xl font-black text-xs uppercase transition-all ${view === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
            >
              📋 Historial
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => setView('customers')}
              className={`px-6 py-2 rounded-xl font-black text-xs uppercase transition-all ${view === 'customers' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
            >
              👥 Clientes
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => setView('categories')}
              className={`px-6 py-2 rounded-xl font-black text-xs uppercase transition-all ${view === 'categories' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
            >
              📂 Categorías
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => setView('campaigns')}
              className={`px-6 py-2 rounded-xl font-black text-xs uppercase transition-all ${view === 'campaigns' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
            >
              🎯 Campañas
            </button>
          )}
        </nav>
      </header>
      {isAdmin && (

        <div className="max-w-7xl mx-auto mb-6 flex gap-4">
          <button onClick={fetchInventoryReport} className="bg-gray-200 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-100">Reporte Inventario</button>
          <div className="flex gap-2 items-center">
            <button onClick={() => applyQuickSalesRange('daily')} className="bg-gray-200 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100">Diario</button>
            <button onClick={() => applyQuickSalesRange('weekly')} className="bg-gray-200 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100">Semanal</button>
            <button onClick={() => applyQuickSalesRange('monthly')} className="bg-gray-200 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100">Mensual</button>
            <button onClick={() => applyQuickSalesRange('annual')} className="bg-gray-200 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100">Anual</button>
          </div>
          <form onSubmit={e => {e.preventDefault(); fetchSalesReport();}} className="flex gap-2 items-center">
            <input type="date" value={reportRange.from} onChange={e => setReportRange({...reportRange, from: e.target.value})} className="border rounded px-2 py-1 text-xs" />
            <span className="text-gray-400 font-bold text-xs">a</span>
            <input type="date" value={reportRange.to} onChange={e => setReportRange({...reportRange, to: e.target.value})} className="border rounded px-2 py-1 text-xs" />
            <button type="submit" className="bg-gray-200 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-100">Reporte Ventas</button>
          </form>
          {reportType && (
            <button
              onClick={() => { setReportType(null); setSalesReport([]); setInventoryReport([]); }}
              className="ml-auto rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-red-700 hover:bg-red-50"
            >
              Cerrar reporte
            </button>
          )}
        </div>
      )}
      {reportType === 'sales' && (
        <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 mb-8">
          <div className="p-6 border-b bg-blue-50/50">
            <h2 className="text-sm font-black text-blue-700 uppercase tracking-widest">Reporte de Ventas</h2>
          </div>
          <div className="custom-scroll">
            <table className="min-w-[1150px] w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Total Ventas</th>
                  <th className="px-6 py-4">Transacciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {salesReport.map((r, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4">{r.date}</td>
                    <td className="px-6 py-4">${r.totalSales}</td>
                    <td className="px-6 py-4">{r.totalTransactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {reportType === 'inventory' && (
        <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 mb-8">
          <div className="p-6 border-b bg-blue-50/50">
            <h2 className="text-sm font-black text-blue-700 uppercase tracking-widest">Reporte de Inventario</h2>
          </div>
          <div className="custom-scroll">
            <table className="min-w-[900px] w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Vencimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventoryReport.map((r, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4">{r.productName}</td>
                    <td className="px-6 py-4">{r.stock}</td>
                    <td className="px-6 py-4">{r.category}</td>
                    <td className="px-6 py-4">{r.expiration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'inventory' ? (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-white via-slate-50 to-blue-50 p-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-center">
                {[
                  { label: 'Catalogo', path: '/products' },
                  { label: 'Finalizar compra', path: '/cart' },
                  { label: 'Pedido confirmado', path: '/checkout' }
                ].map((step, index, steps) => {
                  const isActive = commercePage === step.path || (step.path === '/checkout' && commercePage === '/checkout/success')
                  const activeIndex = steps.findIndex((item) => item.path === (commercePage === '/checkout/success' ? '/checkout' : commercePage))
                  const isCompleted = activeIndex > index
                  const connectorActive = activeIndex > index
                  const isCheckoutDisabled = step.path === '/checkout' && !saleCompleted

                  return (
                    <div key={step.path} className="flex min-w-0 flex-1 items-center">
                      <button
                        type="button"
                        disabled={isCheckoutDisabled}
                        onClick={() => navigateCommerce(step.path)}
                        className={`group flex min-w-0 items-center gap-2 ${isCheckoutDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-black transition-colors ${isActive || isCompleted ? 'border-blue-700 bg-blue-700 text-white' : 'border-blue-200 bg-white text-blue-500 group-hover:border-blue-400'}`}>
                          {index + 1}
                        </span>
                        <span className={`truncate text-[11px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-blue-800' : isCompleted ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
                          {step.label}
                        </span>
                      </button>
                      {index < steps.length - 1 && (
                        <span className={`mx-2 h-[3px] min-w-3 flex-1 rounded-full transition-colors ${connectorActive ? 'bg-blue-600' : 'bg-blue-100'}`} />
                      )}
                    </div>
                  )
                })}
              </div>

              <button
                ref={cartIconRef}
                type="button"
                onClick={() => {
                  if (cartDrawerAutoCloseRef.current) {
                    window.clearTimeout(cartDrawerAutoCloseRef.current)
                    cartDrawerAutoCloseRef.current = null
                  }
                  if (commercePage === '/products') {
                    setIsCartDrawerOpen((prev) => !prev)
                    return
                  }
                  navigateCommerce('/cart')
                }}
                className={`relative flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-blue-800 transition-transform ${isCartIconBumping ? 'scale-110' : 'scale-100'}`}
              >
                <span className="text-lg">🛒</span>
                <span className="text-xs font-black uppercase tracking-wider">Carrito</span>
                <span className="ml-1 rounded-full bg-blue-700 px-2 py-0.5 text-[11px] font-black text-white">{cartItemsCount}</span>
              </button>
            </div>
          </div>

          {commercePage === '/products' && (
            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
              <div className="border-b bg-white p-6 space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                  <div className="relative md:col-span-7">
                    <input
                      type="text"
                      placeholder="Buscar medicamento..."
                      className="w-full bg-gray-100 border-none rounded-xl p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-3 top-3 opacity-30">🔍</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Codigo (SKU / barras)"
                    className="w-full bg-gray-100 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm md:col-span-5"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                  />
                </div>
                {isAdmin && (
                  <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-gray-600 bg-white px-3 py-2 rounded-xl border border-gray-200">
                        <input type="checkbox" checked={hideExpired} onChange={(e) => setHideExpired(e.target.checked)} />
                        Ocultar vencidos
                      </label>
                      <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-gray-600 bg-white px-3 py-2 rounded-xl border border-gray-200">
                        <input type="checkbox" checked={showExpiringSoon} onChange={(e) => setShowExpiringSoon(e.target.checked)} />
                        Proximos a vencer
                      </label>
                    </div>
                    <button onClick={openCreateProductModal} className="shrink-0 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm">
                      ➕ Nuevo Producto
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-[280px_minmax(0,_1fr)]">
                <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-4 h-fit md:sticky md:top-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Filtrar</h4>
                  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-blue-800">Por categoría</p>
                    <div className="mt-3 space-y-2 max-h-56 overflow-y-auto custom-scroll pr-1">
                      {displayedCategories.map((category) => (
                        <label key={category} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategorySelection(category)}
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                    {hasHiddenCategories && (
                      <button
                        type="button"
                        onClick={() => setShowAllCategories((prev) => !prev)}
                        className="mt-3 rounded-xl border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-black text-blue-800 hover:bg-blue-50"
                      >
                        {showAllCategories ? 'Ver menos' : 'Ver más'}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-blue-800">Precio</p>
                    <p className="mt-2 text-sm font-black text-gray-800">
                      ${priceRange.min.toFixed(0)} - ${priceRange.max.toFixed(0)}
                    </p>
                    <div className="mt-4 space-y-4">
                      <input
                        type="range"
                        min={priceBounds.min}
                        max={priceBounds.max || 1}
                        value={priceRange.min}
                        onChange={(e) => handlePriceMinChange(e.target.value)}
                        className="w-full accent-blue-600"
                      />
                      <input
                        type="range"
                        min={priceBounds.min}
                        max={priceBounds.max || 1}
                        value={priceRange.max}
                        onChange={(e) => handlePriceMaxChange(e.target.value)}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>
                </aside>

                <div className="min-w-0 grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                  {filteredProducts.map((p) => {
                    const quantityInCart = getCartQuantity(p.id)
                    const promoLabel = getPromotionLabel(p)
                    return (
                      <article key={p.id} className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg ${quantityInCart > 0 ? 'border-blue-400 shadow-blue-100' : 'border-gray-200'}`}>
                        <div className={`relative h-52 bg-gray-100 ${p.stock <= 0 ? 'grayscale' : ''}`}>
                          <img
                            src={p.imageUrl || buildDefaultProductImage(p.name)}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                          {p.stock > 0 && promoLabel && (
                            <span className="absolute right-3 top-3 rounded-md bg-amber-400 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-900 shadow">
                              {promoLabel}
                            </span>
                          )}
                          {quantityInCart > 0 && (
                            <span className="absolute left-3 top-3 rounded-full bg-blue-700 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                              Seleccionado x{quantityInCart}
                            </span>
                          )}
                          {p.stock <= 0 && (
                            <div className="absolute inset-0 bg-gray-500/35 flex items-center justify-center">
                              <span className="rounded-xl bg-gray-900/80 px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-white">Agotado</span>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">{p.category || 'Sin categoría'}</p>
                          <h3 className={`mt-1 text-xl font-black text-blue-900 leading-tight ${p.stock <= 0 ? 'line-through text-gray-400' : ''}`}>{p.name}</h3>
                          {p.code && <p className="mt-1 text-xs font-bold text-gray-500">Código: {p.code}</p>}
                          <p className={`mt-3 text-3xl font-black ${p.stock <= 0 ? 'text-gray-400' : 'text-red-600'}`}>${Number(p.price || 0).toFixed(2)}</p>
                          <p className="mt-1 text-xs font-bold text-gray-500">Stock: {p.stock} unidades</p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              onClick={(e) => addToCart(p, e.currentTarget)}
                              disabled={p.stock <= 0}
                              className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Añadir al carrito
                            </button>

                            {quantityInCart > 0 && (
                              <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-2 py-1">
                                <button onClick={() => updateQuantity(p.id, -1)} className="px-1 font-black text-blue-700">-</button>
                                <span className="w-5 text-center text-xs font-black text-blue-800">{quantityInCart}</span>
                                <button onClick={() => updateQuantity(p.id, 1)} className="px-1 font-black text-blue-700">+</button>
                              </div>
                            )}

                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleToggleProductVisibility(p, 'visibleInSuggestions')}
                                  className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase ${p.visibleInSuggestions !== false ? 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-700 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-700 hover:text-white'}`}
                                >
                                  {p.visibleInSuggestions !== false ? 'Visible sug.' : 'Oculto sug.'}
                                </button>
                                <button
                                  onClick={() => openEditProductModal(p)}
                                  className="rounded-xl bg-amber-100 px-3 py-2 text-[10px] font-black uppercase text-amber-700 hover:bg-amber-700 hover:text-white"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleRestockProduct(p.id, p.name)}
                                  className="rounded-xl bg-emerald-100 px-3 py-2 text-[10px] font-black uppercase text-emerald-700 hover:bg-emerald-700 hover:text-white"
                                >
                                  Reabastecer
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="rounded-xl bg-red-100 px-3 py-2 text-[10px] font-black uppercase text-red-700 hover:bg-red-700 hover:text-white"
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}

                  {filteredProducts.length === 0 && (
                    <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                      <p className="text-lg font-black text-gray-600">No encontramos productos con esos filtros</p>
                      <p className="mt-2 text-sm font-bold text-gray-500">Prueba con otro rango de precio o categorías diferentes.</p>
                    </div>
                  )}
                </div>

                <aside
                  className={`fixed right-0 top-0 z-50 hidden h-screen w-[min(540px,100vw)] flex-col overflow-hidden border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] transition-transform duration-300 lg:flex lg:rounded-none ${isCartDrawerOpen ? 'translate-x-0' : 'translate-x-[110%]'}`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-[20px] font-black uppercase leading-none tracking-[-0.03em] text-slate-950">Carrito</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCartDrawerOpen(false)}
                      className="rounded-full bg-white px-2 py-1 text-2xl leading-none font-light text-slate-800 hover:bg-slate-50"
                    >
                      ×
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4 custom-scroll">
                    {cart.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-xs font-bold text-slate-500 shadow-sm">
                        Tu carrito esta vacio.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cartLineBreakdown.map(({ item, pricing }) => (
                        <article key={item.id} className="relative rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center text-[#ff2d55] hover:text-[#e11d48]"
                            aria-label={`Quitar ${item.name} del carrito`}
                            title="Quitar del carrito"
                          >
                            <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" aria-hidden="true">
                              <path
                                d="M5 7.25h14m-8.5 0V5.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.5m-10 0 .55 10.7A1.75 1.75 0 0 0 7.55 19.5h8.9a1.75 1.75 0 0 0 1.75-1.65l.55-10.6m-8.6 3.2v5.5m3.1-5.5v5.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.55"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          <div className="grid grid-cols-[96px_minmax(0,_1fr)] gap-3 pr-8">
                            <div className="flex items-start justify-center pt-1">
                              <img
                                src={item.imageUrl || buildDefaultProductImage(item.name)}
                                alt={item.name}
                                className="h-20 w-20 rounded-md border border-slate-100 object-contain bg-white"
                              />
                            </div>
                            <div className="min-w-0 pt-1">
                              {getPromotionLabel(item) && (
                                <span className="inline-flex rounded-sm bg-yellow-400 px-1.5 py-0.5 text-[10px] font-black uppercase leading-none text-white shadow-[0_0_0_1px_rgba(249,115,22,0.35)]">
                                  {getPromotionLabel(item)}
                                </span>
                              )}
                              <p className="mt-1 line-clamp-2 text-[16px] font-medium uppercase leading-5 text-slate-900">{item.name}</p>
                              <p className="mt-1 text-[19px] font-black leading-none text-slate-900">${Number(item.price || 0).toFixed(2)}</p>
                              {pricing.discount > 0 && (
                                <p className="mt-1 text-[10px] font-black text-emerald-700">Ahorro: ${pricing.discount.toFixed(2)}</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-[1fr_1.15fr_1fr] items-stretch gap-0 overflow-hidden rounded-sm border border-slate-100">
                            <button onClick={() => updateQuantity(item.id, -1)} className="h-11 bg-slate-100 text-[30px] leading-none font-black text-slate-900 hover:bg-slate-200">−</button>
                            <span className="flex items-center justify-center bg-white text-[18px] font-medium text-slate-900">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="h-11 bg-slate-100 text-[30px] leading-none font-black text-slate-900 hover:bg-slate-200">+</button>
                          </div>
                        </article>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 bg-white p-4">
                    <button
                      type="button"
                      onClick={() => navigateCommerce('/cart')}
                      className="w-full rounded-xl bg-[#4a90e2] px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white hover:bg-blue-700"
                    >
                      Finalizar compra
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {commercePage === '/cart' && (
            <div className="mx-auto w-full max-w-[1500px]">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,_1fr)_320px]">
                <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/85 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e11d48] text-[11px] font-black text-white">1</span>
                        <h2 className="text-xl font-black text-slate-950">Finalizar compra</h2>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{cartItemsCount} items</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
                      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-indigo-700">Validación de receta</p>
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-800">
                        <input type="checkbox" checked={isPrescriptionSale} onChange={(e) => setIsPrescriptionSale(e.target.checked)} />
                        Venta con receta
                      </label>

                      {isPrescriptionSale && (
                        <div className="mt-3 grid gap-2 md:grid-cols-3">
                          <input type="text" placeholder="Nombre del cliente" value={saleCustomer.name} onChange={(e) => setSaleCustomer({ ...saleCustomer, name: e.target.value })} className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-indigo-400" />
                          <input type="text" placeholder="Direccion" value={saleCustomer.address} onChange={(e) => setSaleCustomer({ ...saleCustomer, address: e.target.value })} className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-indigo-400" />
                          <input type="text" placeholder="Telefono" value={saleCustomer.phone} onChange={(e) => setSaleCustomer({ ...saleCustomer, phone: e.target.value })} className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-indigo-400" />
                        </div>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-[#4a90e2] text-white">
                            <th className="px-3 py-3 text-[12px] font-black">Producto</th>
                            <th className="px-2 py-3 text-[12px] font-black text-center">Precio</th>
                            <th className="px-2 py-3 text-[12px] font-black text-center">Cant.</th>
                            <th className="px-2 py-3 text-[12px] font-black text-right">Total</th>
                            <th className="px-2 py-3 text-[12px] font-black text-center">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-4 py-16 text-center text-sm font-bold text-slate-500">
                                Tu carrito está vacío.
                              </td>
                            </tr>
                          ) : (
                            cartLineBreakdown.map(({ item, pricing }) => (
                              <tr key={item.id} className="border-b border-slate-100 align-middle">
                                <td className="px-3 py-4">
                                  <div className="flex items-start gap-2">
                                    <img
                                      src={item.imageUrl || buildDefaultProductImage(item.name)}
                                      alt={item.name}
                                      className="h-12 w-12 shrink-0 rounded-md border border-slate-200 bg-white object-contain"
                                    />
                                    <div className="min-w-0">
                                      {getPromotionLabel(item) && (
                                        <span className="inline-flex rounded-sm bg-yellow-400 px-1.5 py-0.5 text-[9px] font-black uppercase leading-none text-white shadow-[0_0_0_1px_rgba(249,115,22,0.35)]">
                                          {getPromotionLabel(item)}
                                        </span>
                                      )}
                                      <p className="mt-1 max-w-[180px] text-xs font-medium uppercase leading-4 text-slate-900">{item.name}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-2 py-4 text-xs font-medium text-slate-700 text-center">${Number(item.price || 0).toFixed(2)}</td>
                                <td className="px-4 py-6">
                                  <div className="inline-flex items-stretch overflow-hidden rounded-sm border border-slate-200 bg-white">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="h-9 w-10 bg-slate-100 text-xl font-black text-slate-900 hover:bg-slate-200">−</button>
                                    <span className="flex w-12 items-center justify-center text-sm font-medium text-slate-900">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="h-9 w-10 bg-slate-100 text-xl font-black text-slate-900 hover:bg-slate-200">+</button>
                                  </div>
                                </td>
                                <td className="px-4 py-6 text-sm font-bold text-slate-900">${pricing.net.toFixed(2)}</td>
                                <td className="px-2 py-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-600 hover:bg-red-100"
                                    aria-label={`Quitar ${item.name} del carrito`}
                                    title="Quitar del carrito"
                                  >
                                    <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
                                      <path
                                        d="M5 7.25h14m-8.5 0V5.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.5m-10 0 .55 10.7A1.75 1.75 0 0 0 7.55 19.5h8.9a1.75 1.75 0 0 0 1.75-1.65l.55-10.6m-8.6 3.2v5.5m3.1-5.5v5.5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.55"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    Quitar
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <aside className="rounded-3xl border border-gray-100 bg-white shadow-lg">
                  <div className="bg-[#4a90e2] px-6 py-4 text-center text-[13px] font-black text-white">Resumen de compra</div>
                  <div className="p-4">
                    <div className={`relative rounded-[24px] border p-4 shadow-[0_10px_24px_rgba(214,163,39,0.14)] overflow-visible transition-colors ${
                      couponApplied 
                        ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100' 
                        : 'border-amber-200 bg-gradient-to-br from-[#fff8e4] via-[#fff3c9] to-[#f7e0a1]'
                    }`}>
                      <div className={`flex items-center gap-2 ${couponApplied ? 'text-emerald-700' : 'text-[#b85b20]'}`}>
                        <span className="text-lg">{couponApplied ? '✓' : '✦'}</span>
                        <span className="text-sm font-black uppercase tracking-[0.2em]">{couponApplied ? 'Cupón Aplicado' : 'Cupón'}</span>
                      </div>
                      {!isGuest && (
                        <p className="mt-2 text-[11px] font-bold text-slate-700">
                          {loyaltyCouponStatus.hasAvailableCoupon
                            ? `Tu cuenta tiene cupón disponible (${loyaltyCouponStatus.couponCode}). Aplícalo para activar 10% en esta compra.`
                            : `Aún no tienes cupón activo. Te faltan ${loyaltyCouponStatus.purchasesToNextCoupon} compras para recibir uno.`}
                        </p>
                      )}
                      {isGuest && (
                        <p className="mt-2 text-[11px] font-bold text-amber-800">
                          Inicia sesión para validar cupones de tu cuenta.
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Código"
                          disabled={couponApplied}
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value)
                            setCouponApplied(false)
                            if (couponFeedback.status !== 'idle') {
                              setCouponFeedback({ status: 'idle', message: '' })
                            }
                          }}
                          className={`min-w-0 flex-1 rounded-2xl border px-3 py-2 text-sm font-semibold outline-none focus:border-opacity-100 transition-colors ${
                            couponApplied
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 focus:border-emerald-500'
                              : 'border-amber-200 bg-white/90 text-slate-700 focus:border-amber-400'
                          } ${couponApplied ? 'cursor-not-allowed opacity-75' : ''}`}
                        />
                        <button 
                          type="button" 
                          onClick={couponApplied ? () => { setCouponCode(''); setCouponApplied(false) } : handleApplyCoupon}
                          className={`rounded-2xl px-4 py-2 text-sm font-black text-white shadow-sm transition-colors ${
                            couponApplied 
                              ? 'bg-emerald-600 hover:bg-emerald-700' 
                              : 'bg-[#4a90e2] hover:bg-blue-700'
                          }`}
                        >
                          {couponApplied ? 'Limpiar' : 'Aplicar'}
                        </button>
                      </div>

                      {couponFeedback.status === 'checking' && (
                        <p className="mt-3 text-[11px] font-black uppercase tracking-wider text-blue-700">Validando codigo...</p>
                      )}
                    </div>

                    <div className="mt-5 space-y-4 text-sm text-slate-700">
                      {cartPromotionDiscount > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Promociones</span>
                          <span className="font-black text-emerald-700">-$ {cartPromotionDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      {cartDiscount > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Cupón de cuenta (10%)</span>
                          <span className="font-black text-emerald-700">-$ {cartDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Subtotal</span>
                        <span className="font-black text-slate-900">$ {cartSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Gastos del envío</span>
                        <span className="font-black text-slate-900">Gratis</span>
                      </div>
                      <div className="flex items-center justify-between border-t pt-3">
                        <span>Total</span>
                        <span className="font-black text-slate-900">$ {cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 px-4 pb-4">
                    {isGuest && (
                      <div className="rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900 shadow-sm">
                        Inicia sesion para finalizar compra y generar ticket/factura.
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={isGuest ? handleRequireAuthFromCurrentContext : handleCheckout}
                      className={`w-full rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest shadow-sm ${isGuest ? 'border border-amber-400 bg-amber-300 text-amber-950 hover:bg-amber-200' : 'bg-[#4a90e2] text-white hover:bg-blue-700'}`}
                    >
                      {isGuest ? 'Iniciar sesion para finalizar compra' : 'Finalizar compra'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateCommerce('/products')}
                      className="w-full rounded-xl border border-[#4a90e2] bg-white px-4 py-3 text-sm font-black uppercase tracking-widest text-[#4a90e2] hover:bg-blue-50"
                    >
                      Elegir más productos
                    </button>
                  </div>
                </aside>
              </div>

              <section className="mt-6 rounded-3xl border border-blue-100 bg-white/90 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.07)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-gray-900">Inspirado en tu carrito</p>
                    <p className="mt-0.5 text-[11px] font-bold text-gray-500">Sugerencias automáticas de productos relacionados</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scrollRecommendations('prev')}
                      className="h-8 w-8 rounded-full border border-gray-300 bg-white text-base font-black text-blue-700 hover:bg-blue-50"
                      aria-label="Anterior"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollRecommendations('next')}
                      className="h-8 w-8 rounded-full border border-gray-300 bg-white text-base font-black text-blue-700 hover:bg-blue-50"
                      aria-label="Siguiente"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {isRecommendationLoading ? (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-6 text-center text-sm font-bold text-blue-700">
                    Cargando recomendaciones...
                  </div>
                ) : recommendationResult?.recommendedItems?.length ? (
                  <div
                    ref={recommendationScrollRef}
                    className="flex gap-3 overflow-x-auto pb-2 custom-scroll"
                    onMouseEnter={() => setIsRecommendationHovering(true)}
                    onMouseLeave={() => setIsRecommendationHovering(false)}
                  >
                    {recommendationResult.recommendedItems.map((item) => {
                      const isOutOfStock = Number(item.stock || 0) <= 0
                      return (
                        <article key={item.id} className="min-w-[220px] max-w-[220px] rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                          <div className="flex items-start gap-3">
                            <img
                              src={item.imageUrl || buildDefaultProductImage(item.name)}
                              alt={item.name}
                              className="h-14 w-14 rounded-lg border border-gray-200 bg-white object-contain"
                            />
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-xs font-black uppercase leading-4 text-slate-900">{item.name}</p>
                              <p className="mt-1 text-sm font-black text-blue-800">${Number(item.price || 0).toFixed(2)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddSuggestedProduct(item.id)}
                            disabled={isOutOfStock}
                            className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {isOutOfStock ? 'Sin stock' : 'Añadir'}
                          </button>
                        </article>
                      )
                    })}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-5 text-[11px] font-bold text-gray-500">
                    Agrega productos al carrito y te mostraremos sugerencias similares automáticamente.
                  </p>
                )}
              </section>
            </div>
          )}

          {commercePage === '/checkout' && (
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              {loyaltyPromotionBanner?.code && (
                <div className="mb-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-900 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Felicidades</p>
                  <p className="mt-1 text-sm font-bold">Alcanzaste 5 compras y ahora eres ClienteAmigo.</p>
                  <p className="mt-1 text-sm font-black">Tu codigo exclusivo: {loyaltyPromotionBanner.code}</p>
                </div>
              )}
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">2 · Pedido confirmado</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Tu pedido fue confirmado correctamente</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">{lastSaleId ? `Folio de venta #VL-${lastSaleId}` : 'Tu compra quedó registrada en el sistema.'}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button onClick={handleDownloadTicketPdf} className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-blue-700">Descargar ticket PDF</button>
                <button onClick={handleOpenInvoiceModal} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-emerald-700">Facturar PDF</button>
                <button onClick={() => { setSaleCompleted(false); navigateCommerce('/products'); }} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50">Comprar de nuevo</button>
                <button onClick={handleUserLogout} className="rounded-xl bg-[#e11d48] px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-[#c81d4f]">Salir</button>
              </div>
            </div>
          )}

          {(couponFeedback.status === 'invalid' || couponFeedback.status === 'valid') && commercePage === '/cart' && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-white/70 p-4 backdrop-blur-[1px]">
              <div className="relative w-full max-w-[520px] rounded-sm border-4 border-[#ece7de] bg-[#f4f2ef] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
                <button
                  type="button"
                  onClick={closeCouponFeedback}
                  className="absolute right-4 top-3 text-5xl leading-none text-[#5b5b5b] hover:text-[#2f2f2f]"
                  aria-label="Cerrar mensaje"
                >
                  ×
                </button>

                <div className="flex flex-col items-center text-center">
                  <div className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full border-[7px] ${couponFeedback.status === 'valid' ? 'border-emerald-300 text-emerald-600' : 'border-[#d0c4b8] text-[#d0c4b8]'}`}>
                    <span className="text-7xl leading-none">{couponFeedback.status === 'valid' ? '✓' : '×'}</span>
                  </div>
                  <p className={`leading-none text-[#3a3a3a] ${couponFeedback.status === 'valid' ? 'text-[42px]' : 'text-[30px]'}`}>
                    {couponFeedback.status === 'valid' ? 'Código aplicado correctamente' : (couponFeedback.message || 'Invalid redemption code')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : view === 'customers' ? (
        <CustomerManagementPanel isAdmin={isAdmin} />
      ) : view === 'categories' ? (
        <div className="max-w-7xl mx-auto">
          <CategoryManagementPanel />
        </div>
      ) : view === 'campaigns' ? (
        <CampaignManagementPanel onNavigateBack={() => setView('inventory')} />
      ) : (
        <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
          <div className="p-6 border-b bg-blue-50/50">
            <h2 className="text-sm font-black text-blue-700 uppercase tracking-widest">Registro de Ventas Realizadas</h2>
          </div>
          <div className="custom-scroll">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Folio</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Detalle</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-blue-700 font-bold">#VL-{sale.id}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                      {new Date(sale.saleDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-700">
                      {(sale.items || []).length > 0 ? (
                        <div className="space-y-1">
                          {(sale.items || []).slice(0, 3).map((item, idx) => (
                            <p key={`${sale.id}-${idx}`} className="truncate">
                              {item.productName} x{item.quantity}
                            </p>
                          ))}
                          {(sale.items || []).length > 3 && (
                            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                              +{(sale.items || []).length - 3} mas
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin detalle</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-blue-900">
                      ${sale.totalAmount?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showPaymentGatewayModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)]">
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Pasarela de pago externa</p>
              <h3 className="mt-1 text-2xl font-black text-slate-950">Completa tu pago</h3>
            </div>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,_1fr)_340px]">
              <div className="p-6 lg:border-r lg:border-slate-100">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Métodos de pago ficticios</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { key: 'card', title: 'Tarjeta', subtitle: 'Visa / Mastercard' },
                    { key: 'cash', title: 'Efectivo', subtitle: 'Pago en ventanilla' },
                    { key: 'transfer', title: 'Transferencia', subtitle: 'SPEI simulado' }
                  ].map((method) => (
                    <button
                      key={method.key}
                      type="button"
                      onClick={() => setCheckoutPaymentMethod(method.key)}
                      className={`rounded-2xl border px-4 py-4 text-left transition-all ${checkoutPaymentMethod === method.key ? 'border-blue-500 bg-blue-50 shadow-[0_10px_24px_rgba(74,144,226,0.12)]' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <p className="text-sm font-black text-slate-950">{method.title}</p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">{method.subtitle}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Detalles ficticios</p>
                  {checkoutPaymentMethod === 'card' && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input type="text" value="**** **** **** 4242" readOnly className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none" />
                      <input type="text" value="12 / 28" readOnly className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none" />
                      <input type="text" value="123" readOnly className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none" />
                      <input type="text" value="Titular demo" readOnly className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none" />
                    </div>
                  )}
                  {checkoutPaymentMethod === 'cash' && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                      Pago en efectivo seleccionado. Se confirmara como pago en ventanilla.
                    </div>
                  )}
                  {checkoutPaymentMethod === 'transfer' && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input type="text" value="CLABE demo: 646180000000000000" readOnly className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none" />
                      <input type="text" value="Banco: VitalLogix Bank" readOnly className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none" />
                      <input type="text" value="Referencia: VL-PAGO-2026" readOnly className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none" />
                      <input type="text" value="Concepto: Orden VitalLogix" readOnly className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none" />
                    </div>
                  )}
                </div>
              </div>

              <aside className="flex flex-col justify-between bg-white p-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Resumen rápido</p>
                  <div className="mt-4 space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Artículos</span>
                      <span className="font-black text-slate-950">{cartItemsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Método</span>
                      <span className="font-black uppercase text-slate-950">{checkoutPaymentMethod === 'card' ? 'TARJETA' : checkoutPaymentMethod === 'cash' ? 'EFECTIVO' : 'TRANSFERENCIA'}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm text-slate-600">
                      <span>Total</span>
                      <span className="font-black text-slate-950">$ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleConfirmGatewayPayment}
                    className="rounded-xl bg-[#16a34a] px-4 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-[#15803d]"
                  >
                    Pagar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentGatewayModal(false)
                      navigateCommerce('/cart')
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b bg-emerald-50/70 p-6">
              <h3 className="text-lg font-black uppercase text-emerald-900">Facturacion de venta</h3>
              <p className="mt-1 text-xs font-bold text-emerald-700">Captura los datos del receptor para generar el PDF.</p>
            </div>
            <div className="grid gap-4 p-6">
              <input
                type="text"
                placeholder="Razon Social"
                className="w-full rounded-xl border-2 border-gray-100 p-3 text-sm font-bold outline-none focus:border-emerald-500"
                value={invoiceData.razonSocial}
                onChange={(e) => setInvoiceData({ ...invoiceData, razonSocial: e.target.value })}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="RFC"
                  className="w-full rounded-xl border-2 border-gray-100 p-3 text-sm font-bold uppercase outline-none focus:border-emerald-500"
                  value={invoiceData.rfc}
                  onChange={(e) => setInvoiceData({ ...invoiceData, rfc: e.target.value.toUpperCase() })}
                />
                <input
                  type="text"
                  placeholder="Codigo Postal Fiscal"
                  className="w-full rounded-xl border-2 border-gray-100 p-3 text-sm font-bold outline-none focus:border-emerald-500"
                  value={invoiceData.domicilioFiscal}
                  onChange={(e) => setInvoiceData({ ...invoiceData, domicilioFiscal: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <select
                  className="w-full rounded-xl border-2 border-gray-100 p-3 text-sm font-bold outline-none focus:border-emerald-500"
                  value={invoiceData.usoCfdi}
                  onChange={(e) => setInvoiceData({ ...invoiceData, usoCfdi: e.target.value })}
                >
                  <option value="G03">G03 - Gastos en general</option>
                  <option value="P01">P01 - Por definir</option>
                  <option value="S01">S01 - Sin efectos fiscales</option>
                </select>
                <select
                  className="w-full rounded-xl border-2 border-gray-100 p-3 text-sm font-bold outline-none focus:border-emerald-500"
                  value={invoiceData.metodoPago}
                  onChange={(e) => setInvoiceData({ ...invoiceData, metodoPago: e.target.value })}
                >
                  <option value="PUE">PUE - Pago en una sola exhibicion</option>
                  <option value="PPD">PPD - Pago en parcialidades</option>
                </select>
                <select
                  className="w-full rounded-xl border-2 border-gray-100 p-3 text-sm font-bold outline-none focus:border-emerald-500"
                  value={invoiceData.formaPago}
                  onChange={(e) => setInvoiceData({ ...invoiceData, formaPago: e.target.value })}
                >
                  <option value="01">01 - Efectivo</option>
                  <option value="03">03 - Transferencia</option>
                  <option value="04">04 - Tarjeta credito</option>
                  <option value="28">28 - Tarjeta debito</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Regimen Fiscal (ej. 612)"
                className="w-full rounded-xl border-2 border-gray-100 p-3 text-sm font-bold outline-none focus:border-emerald-500"
                value={invoiceData.regimenFiscal}
                onChange={(e) => setInvoiceData({ ...invoiceData, regimenFiscal: e.target.value })}
              />
            </div>
            <div className="flex gap-3 border-t p-6">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 py-3 text-sm font-bold text-gray-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDownloadInvoicePdf}
                className="flex-1 rounded-xl bg-emerald-700 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800"
              >
                Descargar factura PDF
              </button>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
            <div className="p-6 border-b bg-blue-50/50">
              <h3 className="text-lg font-black text-blue-900 uppercase">
                {editingProductId ? '✏️ Editar Medicamento' : '📦 Registrar Medicamento'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar">
              <input 
                type="text" 
                placeholder="Nombre del producto"
                className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Codigo del producto (opcional)"
                className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm uppercase"
                value={newProduct.code}
                onChange={(e) => setNewProduct({...newProduct, code: e.target.value.toUpperCase()})}
              />
              <p className="text-[11px] font-bold text-gray-400">Si lo dejas vacio, el sistema genera un codigo automaticamente.</p>
              <ProductCategoryField
                value={newProduct.category}
                categories={categories}
                suggestedCategories={suggestedCategories}
                customCategory={customCategory}
                onCategoryChange={(nextCategory) => {
                  setNewProduct({ ...newProduct, category: nextCategory })
                  if (nextCategory !== 'OTHER') {
                    setCustomCategory('')
                  }
                }}
                onCustomCategoryChange={setCustomCategory}
              />
              <input
                type="text"
                placeholder="Descripcion (opcional)"
                className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              />
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">Imagen del producto</p>
                <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
                  <img
                    src={newProduct.imageUrl || buildDefaultProductImage(newProduct.name)}
                    alt="Vista previa"
                    className="h-24 w-24 rounded-xl border border-gray-200 object-cover"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setNewProduct({ ...newProduct, imageUrl: '' })}
                      className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-gray-700 hover:bg-gray-100"
                    >
                      Usar imagen por defecto
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="Stock"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  required
                />
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Precio"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  required
                />
              </div>
              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-gray-500">Fecha de vencimiento *</p>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm text-gray-700"
                    value={expirationSelection.day}
                    onChange={(e) => handleExpirationSelection('day', e.target.value)}
                  >
                    <option value="">Dia</option>
                    {Array.from({ length: maxExpirationDay }, (_, index) => String(index + 1).padStart(2, '0')).map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <select
                    className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm text-gray-700"
                    value={expirationSelection.month}
                    onChange={(e) => handleExpirationSelection('month', e.target.value)}
                  >
                    <option value="">Mes</option>
                    {expirationMonths.map((month) => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                  <select
                    className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm text-gray-700"
                    value={expirationSelection.year}
                    onChange={(e) => handleExpirationSelection('year', e.target.value)}
                  >
                    <option value="">Año</option>
                    {expirationYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <p className="mt-2 text-[11px] font-bold text-gray-400">Selecciona dia, mes y año para registrar el vencimiento.</p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-800">Oferta del producto</p>
                <select
                  className="mt-2 w-full rounded-xl border-2 border-amber-100 bg-white p-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-400"
                  value={newProduct.promotionType}
                  onChange={(e) => {
                    const nextType = e.target.value
                    if (nextType === 'BUY_X_PAY_Y') {
                      setNewProduct({ ...newProduct, promotionType: nextType, promoBuyQuantity: '3', promoPayQuantity: '2', promoPercentDiscount: '' })
                      return
                    }
                    if (nextType === 'PERCENTAGE') {
                      setNewProduct({ ...newProduct, promotionType: nextType, promoBuyQuantity: '', promoPayQuantity: '', promoPercentDiscount: '50' })
                      return
                    }
                    setNewProduct({ ...newProduct, promotionType: 'NONE', promoBuyQuantity: '', promoPayQuantity: '', promoPercentDiscount: '' })
                  }}
                >
                  <option value="NONE">Sin oferta</option>
                  <option value="BUY_X_PAY_Y">Compra X, paga Y (ej: 3x2 / 2x1)</option>
                  <option value="PERCENTAGE">Porcentaje de descuento (ej: 50%)</option>
                </select>

                {newProduct.promotionType === 'BUY_X_PAY_Y' && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="2"
                      placeholder="Compra X"
                      className="w-full rounded-xl border border-amber-200 bg-white p-3 text-sm font-bold outline-none focus:border-amber-400"
                      value={newProduct.promoBuyQuantity}
                      onChange={(e) => setNewProduct({ ...newProduct, promoBuyQuantity: e.target.value })}
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Paga Y"
                      className="w-full rounded-xl border border-amber-200 bg-white p-3 text-sm font-bold outline-none focus:border-amber-400"
                      value={newProduct.promoPayQuantity}
                      onChange={(e) => setNewProduct({ ...newProduct, promoPayQuantity: e.target.value })}
                    />
                  </div>
                )}

                {newProduct.promotionType === 'PERCENTAGE' && (
                  <input
                    type="number"
                    min="1"
                    max="99"
                    step="0.01"
                    placeholder="Porcentaje de descuento"
                    className="mt-3 w-full rounded-xl border border-amber-200 bg-white p-3 text-sm font-bold outline-none focus:border-amber-400"
                    value={newProduct.promoPercentDiscount}
                    onChange={(e) => setNewProduct({ ...newProduct, promoPercentDiscount: e.target.value })}
                  />
                )}

                <p className="mt-2 text-[11px] font-bold text-amber-900/70">Ejemplos reales: 2x1 = Compra 2 / Paga 1, 3x2 = Compra 3 / Paga 2, 50% = Porcentaje 50.</p>
              </div>

              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-800">
                <input
                  type="checkbox"
                  checked={newProduct.requiresPrescription}
                  onChange={(e) => setNewProduct({...newProduct, requiresPrescription: e.target.checked})}
                />
                Producto que requiere receta
              </label>
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-fuchsia-800">
                <input
                  type="checkbox"
                  checked={newProduct.visibleInSuggestions}
                  onChange={(e) => setNewProduct({...newProduct, visibleInSuggestions: e.target.checked})}
                />
                Visible en sugerencias
              </label>
              <div className="sticky bottom-0 -mx-6 mt-4 flex gap-3 border-t border-gray-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    resetProductForm()
                  }}
                  className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-blue-700 text-white font-black py-3 rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-blue-200">
                  {editingProductId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App;