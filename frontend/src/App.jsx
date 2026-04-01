import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import { getProducts, createProduct, updateProduct, deleteProduct, addStockToProduct, createSale, getSales, getSalesReport, getInventoryReport, getReceipt, suggestCombo, getCustomers, validateClienteAmigoCode } from './services/api'
import './styles/scrollbar.css'

function App({ auth, onRequireAuth, onLogout }) {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [view, setView] = useState('inventory')
  const [reportType, setReportType] = useState(null)
  const [salesReport, setSalesReport] = useState([])
  const [inventoryReport, setInventoryReport] = useState([])
  const [reportRange, setReportRange] = useState({from: '', to: ''})
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCode, setSearchCode] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [hideExpired, setHideExpired] = useState(false)
  const [showExpiringSoon, setShowExpiringSoon] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [cart, setCart] = useState([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    stock: '',
    price: '',
    expirationDate: '',
    requiresPrescription: false
  })
  const [expirationSelection, setExpirationSelection] = useState({ day: '', month: '', year: '' })
  const [saleCompleted, setSaleCompleted] = useState(false)
  const [lastSaleId, setLastSaleId] = useState(null)
  const [showRecommendationModal, setShowRecommendationModal] = useState(false)
  const [recommendBudget, setRecommendBudget] = useState('150.00')
  const [recommendationResult, setRecommendationResult] = useState(null)
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false)
  const [isPrescriptionSale, setIsPrescriptionSale] = useState(false)
  const [saleCustomer, setSaleCustomer] = useState({
    name: '',
    address: '',
    phone: '',
    friend: false,
    clienteAmigoNumber: ''
  })
  const [clienteAmigoValidation, setClienteAmigoValidation] = useState({ status: 'idle', message: '' })
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceData, setInvoiceData] = useState({
    razonSocial: '',
    rfc: '',
    domicilioFiscal: '',
    usoCfdi: 'G03',
    metodoPago: 'PUE',
    formaPago: '01',
    regimenFiscal: '612'
  })

  // Roles y autenticación
  const isAdmin = auth?.role === 'admin';
  const isGuest = !auth?.logged;

  // --- LÓGICA DE PRODUCTOS ---
  const addToCart = (product) => {
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
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

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
      category: '',
      stock: '',
      price: '',
      expirationDate: '',
      requiresPrescription: false
    })
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

    setNewProduct({
      name: product.name || '',
      code: product.code || '',
      description: product.description || '',
      category: product.category || '',
      stock: String(product.stock ?? ''),
      price: String(product.price ?? ''),
      expirationDate: sourceDate,
      requiresPrescription: Boolean(product.requiresPrescription)
    })
    setExpirationSelection({ day, month, year })
    setEditingProductId(product.id)
    setIsModalOpen(true)
  }

  // --- EFECTOS Y FETCH ---
  useEffect(() => {
    fetchProducts()
    if (auth?.logged) {
      fetchSales()
      if (isAdmin) {
        fetchCustomers()
      }
    }
  }, [auth?.logged, isAdmin])

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
      setSales(response.data)
    } catch (error) { console.error("Error ventas:", error) }
  }

  const fetchCustomers = async () => {
    if (!isAdmin) {
      setCustomers([])
      return
    }
    try {
      const response = await getCustomers()
      setCustomers(response.data)
    } catch (error) { console.error("Error clientes:", error) }
  }

  const categories = [...new Set(products.map((p) => (p.category || '').trim()).filter(Boolean))]
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
    const matchesCategory = !categoryFilter || (p.category || '').toLowerCase() === categoryFilter.toLowerCase()
    const matchesExpiredFilter = !hideExpired || !isProductExpired(p)
    const matchesSoonFilter = !showExpiringSoon || isProductExpiringSoon(p)
    return matchesName && matchesCode && matchesCategory && matchesExpiredFilter && matchesSoonFilter
  })

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    // Si es invitado, pedir login antes de pagar
    if (isGuest) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (saleCustomer.friend && !saleCustomer.clienteAmigoNumber.trim()) {
      alert('Si aplicas clienteamigo, captura su numero clienteamigo.');
      return;
    }

    if (saleCustomer.friend && clienteAmigoValidation.status !== 'valid') {
      alert('Valida el numero clienteamigo antes de confirmar la transaccion.');
      return;
    }

    if (isPrescriptionSale) {
      if (!saleCustomer.name || !saleCustomer.address || !saleCustomer.phone) {
        alert('Para venta con receta debes capturar nombre, direccion y telefono del cliente.');
        return;
      }
    }

    try {
      const payload = {
        items: cart.map(i => ({ productId: i.id, quantity: i.quantity })),
        prescription: isPrescriptionSale,
      }

      const shouldSendCustomer =
        isPrescriptionSale ||
        saleCustomer.friend ||
        Boolean(saleCustomer.name?.trim()) ||
        Boolean(saleCustomer.address?.trim()) ||
        Boolean(saleCustomer.phone?.trim());

      if (shouldSendCustomer) {
        payload.customer = {
          name: saleCustomer.name,
          address: saleCustomer.address,
          phone: saleCustomer.phone,
          friend: saleCustomer.friend,
          clienteAmigoNumber: saleCustomer.friend ? saleCustomer.clienteAmigoNumber.trim() : null,
        }
      }

      const res = await createSale(payload);
      setLastSaleId(res?.data?.id ?? null);
      setSaleCompleted(true);
      alert("Venta realizada con éxito 🛒");
      setCart([]);
      setIsPrescriptionSale(false);
      setSaleCustomer({ name: '', address: '', phone: '', friend: false, clienteAmigoNumber: '' });
      fetchProducts();
      fetchSales();
      setView('inventory');
    } catch (e) { alert("Error al procesar la venta"); }
  };

  const handleValidateClienteAmigo = async () => {
    const code = saleCustomer.clienteAmigoNumber.trim();
    if (!code) {
      setClienteAmigoValidation({ status: 'invalid', message: 'Ingresa un codigo para validar.' });
      return;
    }

    try {
      setClienteAmigoValidation({ status: 'checking', message: 'Canjeando codigo...' });
      const response = await validateClienteAmigoCode(code);
      const data = response.data || {};

      if (data.valid) {
        setClienteAmigoValidation({ status: 'valid', message: 'Codigo valido. Beneficio clienteamigo aplicado.' });
        setSaleCustomer((prev) => ({
          ...prev,
          clienteAmigoNumber: code.toUpperCase(),
          name: prev.name || data.customerName || '',
          phone: prev.phone || data.customerPhone || ''
        }));
      } else {
        setClienteAmigoValidation({ status: 'invalid', message: 'Codigo invalido. Verifica e intenta de nuevo.' });
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        setClienteAmigoValidation({ status: 'invalid', message: 'Tu sesion no permite validar en este momento.' });
      } else if (status >= 500) {
        setClienteAmigoValidation({ status: 'invalid', message: 'Servicio no disponible. Intenta de nuevo en unos minutos.' });
      } else {
        setClienteAmigoValidation({ status: 'invalid', message: 'No se pudo validar el codigo. Revisa tu conexion e intenta de nuevo.' });
      }
    }
  };

  const handleSuggestCombo = async () => {
    if (cart.length === 0) {
      alert('Agrega al menos un producto al carrito para recibir sugerencias personalizadas.');
      return;
    }
    if (!recommendBudget || Number(recommendBudget) <= 0) {
      alert('Ingresa un presupuesto valido para sugerir recomendaciones.');
      return;
    }
    try {
      setIsRecommendationLoading(true);
      const prioritizedProductIds = [...new Set(cart.map((item) => item.id))];
      const res = await suggestCombo(recommendBudget, prioritizedProductIds, 6);
      setRecommendationResult(res.data);
    } catch (e) {
      alert('No se pudieron generar recomendaciones personalizadas.');
    } finally {
      setIsRecommendationLoading(false);
    }
  };

  const handleAddSuggestedComboToCart = () => {
    if (!recommendationResult?.recommendedItems?.length) return;

    let updatedCart = [...cart];

    recommendationResult.recommendedItems.forEach((suggested) => {
      const product = products.find((p) => p.id === suggested.id);
      if (!product || product.stock <= 0) return;

      const existing = updatedCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity < product.stock) {
          updatedCart = updatedCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
      } else {
        updatedCart.push({ ...product, quantity: 1 });
      }
    });

    setCart(updatedCart);
    setShowRecommendationModal(false);
  };

  const openRecommendationModal = () => {
    if (cart.length === 0) {
      alert('Primero agrega un producto al carrito para personalizar recomendaciones.');
      return;
    }
    setRecommendationResult(null);
    setShowRecommendationModal(true);
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

    if (!newProduct.expirationDate) {
      alert('La fecha de vencimiento es obligatoria.');
      return;
    }

    try {
      const payload = {
        name: newProduct.name,
        code: newProduct.code,
        description: newProduct.description || null,
        category: newProduct.category.trim(),
        stock: parseInt(newProduct.stock),
        price: parseFloat(newProduct.price),
        requiresPrescription: newProduct.requiresPrescription,
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

  // --- REPORTES ---
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
              <button onClick={onLogout} className="text-xs text-gray-500 underline hover:text-red-600">Salir</button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onRequireAuth}
                className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700 hover:bg-blue-50"
              >
                Iniciar sesion
              </button>
              <button
                onClick={onLogout}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50"
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
              onClick={() => { setView('customers'); fetchCustomers(); }}
              className={`px-6 py-2 rounded-xl font-black text-xs uppercase transition-all ${view === 'customers' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
            >
              👥 Clientes
            </button>
          )}
        </nav>
      </header>
      {/* BOTONES DE REPORTE */}
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
          {reportType && <button onClick={()=>{setReportType(null); setSalesReport([]); setInventoryReport([]);}} className="ml-auto text-xs text-gray-400 underline">Cerrar reporte</button>}
        </div>
      )}
      {/* VISTA DE REPORTE */}
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
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <main className="flex-1 bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
            <div className="custom-scroll border-b bg-white">
              <div className="min-w-[1200px] p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-80">
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
                  className="w-44 bg-gray-100 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                />
                <select
                  className="w-56 bg-gray-100 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm text-gray-700"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">Todas las categorias</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {isAdmin && (
                  <>
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-gray-600 bg-gray-100 px-3 py-2 rounded-xl">
                      <input type="checkbox" checked={hideExpired} onChange={(e) => setHideExpired(e.target.checked)} />
                      Ocultar vencidos
                    </label>
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-gray-600 bg-gray-100 px-3 py-2 rounded-xl">
                      <input type="checkbox" checked={showExpiringSoon} onChange={(e) => setShowExpiringSoon(e.target.checked)} />
                      Proximos a vencer
                    </label>
                  </>
                )}
              </div>
              {isAdmin && (
                <button onClick={openCreateProductModal} className="shrink-0 bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center gap-2">
                  ➕ Nuevo Producto
                </button>
              )}
            </div>
            </div>

            <div className="custom-scroll">
              <table className="min-w-[1100px] w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4">Precio</th>
                    <th className="px-6 py-4">Vencimiento</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className={`${p.stock <= 0 ? 'bg-gray-100/70 text-gray-400' : 'hover:bg-blue-50/30'} transition-colors`}>
                      <td className="relative px-6 py-4 font-bold">
                        <span className={p.stock <= 0 ? 'line-through' : ''}>{p.name}</span>
                        {p.code && (
                          <span className="ml-2 rounded bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-700">
                            {p.code}
                          </span>
                        )}
                        {isAdmin && (
                          <span className="ml-2 text-[10px] font-bold text-gray-400">ID:{p.id}</span>
                        )}
                        {p.requiresPrescription && (
                          <span className="ml-2 rounded bg-violet-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-violet-700">
                            Receta
                          </span>
                        )}
                        {p.stock <= 0 && (
                          <>
                            <span className="ml-2 rounded bg-gray-300 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-gray-700">
                              Agotado
                            </span>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-[-18deg] text-[11px] font-black uppercase tracking-[0.2em] text-gray-300/80">
                              AGOTADO
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{p.category || 'Sin categoria'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${p.stock <= 0 ? 'bg-gray-200 text-gray-500' : p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                          {p.stock} UN.
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-bold text-gray-500 ${p.stock <= 0 ? 'line-through opacity-70' : ''}`}>${p.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">
                        {p.expirationDate ? new Date(p.expirationDate).toLocaleDateString() : 'Sin fecha'}
                      </td>
                      <td className="px-6 py-4 text-right flex gap-2 justify-end">
                        {p.stock <= 0 ? (
                          <span className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-[10px] font-black uppercase">
                            No disponible
                          </span>
                        ) : (
                          <button onClick={() => addToCart(p)} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 hover:text-white transition-all">
                            Añadir
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditProductModal(p)}
                              className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-amber-700 hover:text-white transition-all"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleRestockProduct(p.id, p.name)}
                              className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-700 hover:text-white transition-all"
                            >
                              Reabastecer
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-red-700 hover:text-white transition-all">
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>

          <aside className="w-full lg:w-96 bg-white shadow-2xl rounded-3xl p-6 h-fit border border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              📦 Resumen de Venta
            </h3>
            <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-lg font-black text-gray-900">Ver recomendaciones personalizadas</p>
              <p className="mt-1 text-xs font-bold text-gray-500">Basadas en los productos de tu carrito</p>
              <button
                onClick={openRecommendationModal}
                className="mt-4 rounded-full bg-yellow-400 px-6 py-2 text-sm font-black text-gray-900 hover:bg-yellow-500"
              >
                Ver sugerencias
              </button>
            </div>
            <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-800">
                <input
                  type="checkbox"
                  checked={isPrescriptionSale}
                  onChange={(e) => setIsPrescriptionSale(e.target.checked)}
                />
                Venta con receta
              </label>
              <div className="mt-3 grid gap-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-800">
                  <input
                    type="checkbox"
                    checked={saleCustomer.friend}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setSaleCustomer({ ...saleCustomer, friend: checked, clienteAmigoNumber: checked ? saleCustomer.clienteAmigoNumber : '' })
                      setClienteAmigoValidation({ status: 'idle', message: '' })
                    }}
                  />
                  Aplicar clienteamigo
                </label>
                {saleCustomer.friend && (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Numero clienteamigo"
                        value={saleCustomer.clienteAmigoNumber}
                        onChange={(e) => {
                          setSaleCustomer({ ...saleCustomer, clienteAmigoNumber: e.target.value.toUpperCase() })
                          if (clienteAmigoValidation.status !== 'idle') {
                            setClienteAmigoValidation({ status: 'idle', message: '' })
                          }
                        }}
                        className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm font-bold uppercase outline-none focus:border-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={handleValidateClienteAmigo}
                        disabled={clienteAmigoValidation.status === 'checking'}
                        className="rounded-xl border border-indigo-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
                      >
                        {clienteAmigoValidation.status === 'checking' ? 'Canjeando...' : 'Canjear'}
                      </button>
                    </div>
                    {clienteAmigoValidation.status !== 'idle' && (
                      <div
                        className={`rounded-xl border px-3 py-2 text-[11px] font-black transition-all duration-300 ${
                          clienteAmigoValidation.status === 'valid'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : clienteAmigoValidation.status === 'checking'
                              ? 'animate-pulse border-amber-300 bg-amber-50 text-amber-700'
                              : 'border-red-300 bg-red-50 text-red-700'
                        }`}
                      >
                        {clienteAmigoValidation.status === 'valid' ? '✅ ' : clienteAmigoValidation.status === 'checking' ? '⏳ ' : '❌ '}
                        {clienteAmigoValidation.message}
                      </div>
                    )}
                  </>
                )}
              </div>
              {isPrescriptionSale && (
                <div className="mt-3 grid gap-2">
                  <input
                    type="text"
                    placeholder="Nombre del cliente"
                    value={saleCustomer.name}
                    onChange={(e) => setSaleCustomer({ ...saleCustomer, name: e.target.value })}
                    className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    placeholder="Direccion"
                    value={saleCustomer.address}
                    onChange={(e) => setSaleCustomer({ ...saleCustomer, address: e.target.value })}
                    className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    placeholder="Telefono"
                    value={saleCustomer.phone}
                    onChange={(e) => setSaleCustomer({ ...saleCustomer, phone: e.target.value })}
                    className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-indigo-400"
                  />
                </div>
              )}
            </div>
            {saleCompleted && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-green-800">Venta finalizada</p>
                <p className="mt-2 text-sm text-green-900">Elige qué deseas hacer ahora:</p>
                <div className="mt-4 grid gap-2">
                  <button
                    onClick={() => setSaleCompleted(false)}
                    className="w-full rounded-xl bg-blue-700 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-800"
                  >
                    Nueva venta
                  </button>
                  <button
                    onClick={handleDownloadTicketPdf}
                    className="w-full rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700 border border-blue-200 hover:bg-blue-50"
                  >
                    Descargar ticket PDF
                  </button>
                  <button
                    onClick={handleOpenInvoiceModal}
                    className="w-full rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                  >
                    Facturar PDF
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setView('history')}
                      className="w-full rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-700 border border-gray-200 hover:bg-gray-50"
                    >
                      Ir a historial
                    </button>
                  )}
                  {auth?.logged ? (
                    <button
                      onClick={onLogout}
                      className="w-full rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-red-700 border border-red-200 hover:bg-red-50"
                    >
                      Salir
                    </button>
                  ) : (
                    <div className="grid gap-2">
                      <button
                        onClick={onRequireAuth}
                        className="w-full rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700 border border-blue-200 hover:bg-blue-50"
                      >
                        Iniciar sesion
                      </button>
                      <button
                        onClick={onLogout}
                        className="w-full rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-700 border border-gray-300 hover:bg-gray-50"
                      >
                        Salir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2" width="48" height="48" fill="none" viewBox="0 0 48 48"><rect width="48" height="48" rx="24" fill="#E0E7FF"/><path d="M32.5 15.5l-19 19" stroke="#6366F1" strokeWidth="3" strokeLinecap="round"/><ellipse cx="32.5" cy="15.5" rx="6.5" ry="6.5" fill="#6366F1"/><ellipse cx="15.5" cy="32.5" rx="6.5" ry="6.5" fill="#A5B4FC"/></svg>
                <p className="text-gray-300 italic text-sm font-bold">Carrito vacío</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <p className="font-black text-gray-800 text-[11px] uppercase leading-tight">{item.name}</p>
                        <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-red-600 hover:bg-red-100 hover:text-red-800 font-bold text-xs px-3 py-1 rounded transition-colors border border-red-200">Quitar</button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-blue-600 font-black px-1 hover:scale-125 transition-transform">-</button>
                          <span className="text-xs font-black w-4 text-center text-gray-700">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-blue-600 font-black px-1 hover:scale-125 transition-transform">+</button>
                        </div>
                        <span className="font-black text-sm text-blue-800">${(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-dashed pt-4">
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400 font-black uppercase text-[10px]">Subtotal</span>
                      <span className="font-black text-gray-800">${cart.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</span>
                    </div>
                    {saleCustomer.friend && (
                      <div className="flex justify-between mb-2">
                        <span className="text-green-600 font-black uppercase text-[10px]">Descuento ClienteAmigo (10%)</span>
                        <span className="font-black text-green-600">-${(cart.reduce((acc, i) => acc + (i.price * i.quantity), 0) * 0.10).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mb-6 border-t-2 border-dashed pt-4">
                    <span className="text-gray-400 font-black uppercase text-[10px] self-center">Total a pagar</span>
                    <span className="text-2xl font-black text-blue-800">
                      ${(
                        cart.reduce((acc, i) => acc + (i.price * i.quantity), 0) *
                        (saleCustomer.friend ? 0.90 : 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <button onClick={handleCheckout} className={`w-full text-white font-black py-4 rounded-2xl shadow-xl transition-all uppercase text-xs tracking-widest active:scale-95 ${isGuest ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-700 hover:bg-blue-800'}`}>
                    {isGuest ? 'Inicia sesion para finalizar compra' : 'Confirmar Transaccion'}
                  </button>
                  {isGuest && (
                    <p className="mt-3 text-center text-[11px] font-bold text-amber-700">
                      Puedes explorar y agregar productos. El inicio de sesion se solicita al pagar.
                    </p>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      ) : view === 'customers' ? (
        /* VISTA DE CLIENTES */
        <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
          <div className="p-6 border-b bg-purple-50/50">
            <h2 className="text-sm font-black text-purple-700 uppercase tracking-widest">Gestión de Clientes</h2>
          </div>
          <div className="custom-scroll">
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
                        onClick={() => alert(`Historial de ${customer.name}:\n${customer.purchaseCount} compra(s)`)}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-blue-700 hover:text-white transition-all"
                      >
                        Ver Historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VISTA DE HISTORIAL */
        <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
          <div className="p-6 border-b bg-gray-50/50">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Registro de Ventas Realizadas</h2>
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
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {sale.items?.map((item, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-500 text-[9px] px-2 py-1 rounded font-black uppercase">
                            {item.product?.name} x{item.quantity}
                          </span>
                        ))}
                      </div>
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
      {showRecommendationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b bg-slate-50 p-6">
              <h3 className="text-2xl font-black text-slate-900">Recomendaciones personalizadas</h3>
              <p className="mt-1 text-sm font-bold text-slate-500">Priorizamos los productos que ya seleccionaste y optimizamos el resto con mochila.</p>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={recommendBudget}
                  onChange={(e) => setRecommendBudget(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-100 p-3 text-sm font-bold outline-none focus:border-blue-500 md:w-64"
                  placeholder="Presupuesto total"
                />
                <button
                  onClick={handleSuggestCombo}
                  disabled={isRecommendationLoading}
                  className="rounded-xl bg-blue-700 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {isRecommendationLoading ? 'Calculando...' : 'Generar sugerencias'}
                </button>
                {recommendationResult?.recommendedItems?.length > 0 && (
                  <button
                    onClick={handleAddSuggestedComboToCart}
                    className="rounded-xl border border-blue-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-blue-700 hover:bg-blue-50"
                  >
                    Agregar recomendaciones
                  </button>
                )}
              </div>

              {recommendationResult && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-700">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>Presupuesto: ${Number(recommendationResult.budget || 0).toFixed(2)}</span>
                      <span>Base carrito: ${Number(recommendationResult.prioritizedCost || 0).toFixed(2)}</span>
                      <span>Recomendado: ${Number(recommendationResult.recommendedCost || 0).toFixed(2)}</span>
                      <span>Total: ${Number(recommendationResult.totalCost || 0).toFixed(2)}</span>
                    </div>
                    {recommendationResult.message && (
                      <p className="mt-2 text-xs text-gray-600">{recommendationResult.message}</p>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-widest text-gray-500">Tus productos priorizados</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendationResult.prioritizedItems?.map((item) => (
                        <span key={item.id} className="rounded-lg bg-blue-100 px-3 py-2 text-[11px] font-black uppercase text-blue-800">
                          {item.name} - ${Number(item.price || 0).toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-widest text-gray-500">Sugerencias complementarias</p>
                    {recommendationResult.recommendedItems?.length ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        {recommendationResult.recommendedItems.map((item) => (
                          <div key={item.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                            <p className="text-sm font-black uppercase text-amber-900">{item.name}</p>
                            <p className="mt-1 text-xs font-bold text-amber-700">${Number(item.price || 0).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-gray-500">No hay sugerencias adicionales para ese presupuesto.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end border-t p-6">
              <button
                type="button"
                onClick={() => setShowRecommendationModal(false)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-xs font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL PARA NUEVO PRODUCTO */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b bg-blue-50/50">
              <h3 className="text-lg font-black text-blue-900 uppercase">
                {editingProductId ? '✏️ Editar Medicamento' : '📦 Registrar Medicamento'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              <input
                type="text"
                placeholder="Categoria *"
                className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                list="category-options"
                required
              />
              <datalist id="category-options">
                {Array.from(new Set([...categories, ...suggestedCategories])).map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              <p className="text-[11px] font-bold text-gray-400">
                Sugerencia: escribe o selecciona una categoria existente para mantener consistencia.
              </p>
              <input
                type="text"
                placeholder="Descripcion (opcional)"
                className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              />
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
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-800">
                <input
                  type="checkbox"
                  checked={newProduct.requiresPrescription}
                  onChange={(e) => setNewProduct({...newProduct, requiresPrescription: e.target.checked})}
                />
                Producto que requiere receta
              </label>
              <div className="flex gap-3 pt-4">
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