import React, { useState, useEffect, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSearchbar, IonChip, IonLabel, IonCard, IonCardContent, IonCardHeader,
  IonBadge, IonButton, IonIcon, IonText, IonToast, IonRippleEffect, IonSpinner,
  IonSegment, IonSegmentButton, IonModal, IonInput, IonToggle, IonAlert, IonSelect, IonSelectOption, IonItem
} from '@ionic/react'
import { cartOutline, starSharp, starHalfOutline, starOutline, create, trash, close } from 'ionicons/icons'
import Navbar from '../../components/MainLayout'
import { shopApi } from '../../hooks/shopApi'
import { useAuth } from '../../AuthContext'

type Category = 'Todos' | 'Kimono' | 'Equipamento' | 'Faixa' | 'Acessório'
type AdminTab = 'productos' | 'pedidos'

interface Product {
  _id?: string
  id?: string
  name: string
  description: string
  category: string
  price: number
  originalPrice?: number
  rating?: number
  reviewCount?: number
  inStock: boolean
  badge?: string
  image?: string
  published?: boolean
  availableForPraticinador?: boolean
}

const CATEGORIES: Category[] = ['Todos', 'Kimono', 'Equipamento', 'Faixa', 'Acessório']

interface Order {
  _id: string
  userId: { _id: string; name: string; email: string; username: string }
  products: Array<{ productId: any; name: string; price: number; quantity: number }>
  totalPrice: number
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'enviado' | 'entregue'
  createdAt: string
}

interface CartItem {
  product: ExtendedProduct
  quantity: number
}

interface ExtendedProduct extends Product {
  _id?: string
  published?: boolean
  availableForPraticinador?: boolean
  status?: 'pendente' | 'aprovado' | 'rejeitado'
  createdBy?: { _id?: string; name?: string; username?: string; email?: string }
}

const badgeColor: Record<string, string> = {
  'Novo': 'primary',
  'Mais Vendido': 'warning',
  'Promoção': 'danger',
}

const productStatusColor: Record<string, string> = {
  'pendente': 'warning',
  'aprovado': 'success',
  'rejeitado': 'danger',
}

const statusColor: Record<string, string> = {
  'pendente': 'warning',
  'aprovado': 'success',
  'rejeitado': 'danger',
  'enviado': 'primary',
  'entregue': 'secondary',
}

const Stars: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const icon = i <= Math.floor(rating) ? starSharp : (i - 0.5 <= rating ? starHalfOutline : starOutline)
        return <IonIcon key={i} icon={icon} style={{ fontSize: 13, color: '#f4a400' }} />
      })}
    </span>
  )
}

const ProductCard: React.FC<{ product: ExtendedProduct; onAdd: (product: ExtendedProduct) => void; isAdmin?: boolean; disableBuy?: boolean }> = ({ product, onAdd, isAdmin, disableBuy }) => (
  <IonCard
    style={{
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      margin: 0,
      position: 'relative',
    }}
  >
    {product.badge && (
      <IonBadge
        color={badgeColor[product.badge]}
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, borderRadius: 8, fontSize: 11 }}
      >
        {product.badge}
      </IonBadge>
    )}

    <div
      style={{
        height: 130,
        overflow: 'hidden',
        background: '#f4f4f4',
      }}
    >
      <img
        src={product.image || 'https://via.placeholder.com/400x300?text=Produto'}
        alt={product.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>

    <IonCardContent style={{ padding: '12px 14px 14px' }}>
      <IonText>
        <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{product.name}</h3>
      </IonText>
      <IonText color="medium">
        <p style={{ margin: '0 0 8px', fontSize: 12, lineHeight: 1.4 }}>{product.description}</p>
      </IonText>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Stars rating={product.rating || 4.5} />
        <IonText color="medium" style={{ fontSize: 11 }}>({product.reviewCount || 0})</IonText>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {product.originalPrice && (
            <IonText color="medium">
              <span style={{ fontSize: 12, textDecoration: 'line-through', marginRight: 4 }}>
                € {product.originalPrice.toFixed(2)}
              </span>
            </IonText>
          )}
          <IonText color={!product.inStock ? 'medium' : undefined}>
            <span style={{ fontSize: 16, fontWeight: 800, color: product.inStock ? '#3a0000' : undefined }}>
              € {product.price.toFixed(2)}
            </span>
          </IonText>
        </div>

        {!isAdmin && !disableBuy && (
          <IonButton
            size="small"
            fill="solid"
            color="primary"
            disabled={!product.inStock}
            onClick={() => onAdd(product)}
            style={{ '--border-radius': '10px', '--padding-start': '10px', '--padding-end': '10px' }}
          >
            <IonIcon slot="icon-only" icon={cartOutline} />
            <IonRippleEffect />
          </IonButton>
        )}
      </div>

      {!product.inStock && (
        <IonText color="danger">
          <p style={{ margin: '6px 0 0', fontSize: 11 }}>Fora de estoque</p>
        </IonText>
      )}
    </IonCardContent>
  </IonCard>
)

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

const Loja: React.FC = () => {
  const { user } = useAuth()
  const { getProducts, getAdminProducts, createProduct, updateProduct, deleteProduct, getAdminOrders, updateOrderStatus, createCheckoutSession } = shopApi()
  
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('Todos')
  const [toastMessage, setToastMessage] = useState('')
  const [products, setProducts] = useState<ExtendedProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [adminTab, setAdminTab] = useState<AdminTab>('productos')
  const [orders, setOrders] = useState<Order[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [showCartPanel, setShowCartPanel] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const cartRef = useRef<HTMLDivElement | null>(null)
  const [editingProduct, setEditingProduct] = useState<ExtendedProduct | null>(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    category: string
    price: number
    originalPrice?: number
    inStock: boolean
    published: boolean
    availableForPraticinador: boolean
    badge: string
    status: 'pendente' | 'aprovado' | 'rejeitado'
  }>({
    name: '',
    description: '',
    category: 'Acessório',
    price: 0,
    originalPrice: undefined,
    inStock: true,
    published: true,
    availableForPraticinador: true,
    badge: '',
    status: 'aprovado'
  })

  const isAdmin = user?.type === 'admin'
  const isPraticinador = user?.type === 'praticinador'

  useEffect(() => {
    const storedCart = localStorage.getItem('shopCart')
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart))
      } catch (err) {

      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('shopCart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (showCartPanel) {
      cartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showCartPanel])

  useEffect(() => {
    loadData()
  }, [adminTab, isPraticinador])

  const loadData = async () => {
    setLoading(true)
    try {
      if (isAdmin && adminTab === 'productos') {
        const data = await getAdminProducts()
        setProducts((data.products || data || []) as ExtendedProduct[])
      } else if (isAdmin && adminTab === 'pedidos') {
        const data = await getAdminOrders()
        setOrders(data.orders || data || [])
      } else {
        const data = await getProducts()
        setProducts((data.products || data || []) as ExtendedProduct[])
      }
    } catch (err) {

      if (!isAdmin || adminTab !== 'pedidos') {
        setProducts([])
      }
    } finally {
      setLoading(false)
    }
  }

  const openProductModal = (product?: ExtendedProduct) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice || undefined,
        inStock: product.inStock,
        published: product.published || true,
        availableForPraticinador: product.availableForPraticinador || true,
        badge: product.badge || '',
        status: product.status || 'pendente'
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        category: 'Acessório',
        price: 0,
        originalPrice: undefined,
        inStock: true,
        published: true,
        availableForPraticinador: true,
        badge: '',
        status: 'pendente'
      })
    }
    setShowProductModal(true)
  }

  const handleSaveProduct = async () => {
    try {
      if (editingProduct?._id) {
        const updated = await updateProduct(editingProduct._id, formData)
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? { ...p, ...updated.product } : p))
      } else {
        const created = await createProduct(formData)
        setProducts(prev => [created.product as ExtendedProduct, ...prev])
      }
      setShowProductModal(false)
      setToastMessage('Produto guardado com sucesso!')
    } catch (error) {

      setToastMessage('Erro ao guardar produto.')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p._id !== id))
      setShowDeleteAlert(null)
      setToastMessage('Produto removido com sucesso!')
    } catch (error) {

      setToastMessage('Erro ao remover produto.')
    }
  }

  const handleProductStatus = async (productId: string, status: 'aprovado' | 'rejeitado') => {
    try {
      const updated = await updateProduct(productId, { status })
      setProducts(prev => prev.map(p => p._id === productId ? { ...p, ...updated.product } : p))
      setToastMessage(`Produto ${status} com sucesso!`)
    } catch (error) {

      setToastMessage('Erro ao atualizar status do produto.')
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o._id === orderId ? updated.order : o))
      setToastMessage(`Pedido ${newStatus} com sucesso!`)
    } catch (error) {

      setToastMessage('Erro ao atualizar pedido.')
    }
  }

  const addToCart = (product: ExtendedProduct) => {
    if (!product._id) return
    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id)
      if (existing) {
        return prev.map(item =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    setToastMessage(`"${product.name}" adicionado ao carrinho!`)
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product._id !== productId))
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }

    setCart(prev => prev.map(item =>
      item.product._id === productId ? { ...item, quantity } : item
    ))
  }

  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setToastMessage('O carrinho está vazio.')
      return
    }

    setCheckoutLoading(true)
    try {
      const items = cart.map(item => ({
        name: item.product.name,
        description: item.product.description,
        price: item.product.price,
        quantity: item.quantity,
      }))

      const data = await createCheckoutSession({ items })
      if (!data) {
        setToastMessage('Não foi possível iniciar o pagamento.')
        return
      }

      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      if (!stripePublicKey) {
        setToastMessage('Stripe público não configurado no frontend.')
        return
      }

      const stripe = await stripePromise
      if (!stripe) {
        setToastMessage('Erro ao carregar Stripe.')
        return
      }

      if (data.sessionId) {
        const result = await stripe.redirectToCheckout({ sessionId: data.sessionId })
        if (result?.error) {
          setToastMessage(result.error.message || 'Erro ao redirecionar para Stripe.')
        }
        return
      }

      if (data.url) {
        window.location.href = data.url
        return
      }

      setToastMessage('Não foi possível iniciar o pagamento.')
    } catch (caughtError) {

      const err = caughtError as any
      if (err?.response?.data?.message) {
        setToastMessage(err.response.data.message)
      } else {
        setToastMessage('Erro ao iniciar o pagamento.')
      }
    } finally {
      setCheckoutLoading(false)
    }
  }

  const filtered = products.filter(p => {
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Loja</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding background bg-slate-950/5 text-slate-950">
        <div className="mx-4 mb-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <IonText className="text-lg font-semibold">🛍️ Loja</IonText>
          <p className="mt-2 text-sm text-slate-600">Encontre equipamentos, kimonos e acessórios para treinar.</p>
        </div>

        {!isAdmin && (
          <div className="mx-4 mb-4">
            <IonButton
              expand="block"
              color="tertiary"
              onClick={() => setShowCartPanel(prev => !prev)}
            >
              {showCartPanel ? 'Ocultar Carrinho' : `Ver Carrinho (${cart.length} item${cart.length !== 1 ? 's' : ''})`}
            </IonButton>
          </div>
        )}

        {isAdmin && (
          <IonSegment 
            value={adminTab} 
            onIonChange={(e) => setAdminTab(e.detail.value as AdminTab)}
            className="mx-4 mb-4"
          >
            <IonSegmentButton value="productos">
              <IonLabel>Gerir Produtos</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="pedidos">
              <IonLabel>Gerir Pedidos</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        )}

        {adminTab === 'productos' && (
          <>
            {isPraticinador && (
              <div className="mx-4 mb-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
                <IonText className="font-semibold">Seus Produtos</IonText>
                <p className="mt-2 text-sm text-slate-600">
                  Para gerir os seus produtos, crie, edite e apague-os em uma página dedicada.
                  Produtos aceites ou rejeitados não podem mais ser alterados.
                </p>
                <IonButton routerLink="/seus-produtos" expand="block" className="mt-4 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-sm">
                  Ir para Seus Produtos
                </IonButton>
              </div>
            )}

            <IonSearchbar
              value={search}
              onIonInput={e => setSearch(e.detail.value ?? '')}
              placeholder="Buscar produtos..."
              className="mx-4 mb-4 rounded-3xl bg-slate-100 border border-slate-200"
            />

            {!isAdmin && (
              <div className="mx-4 mb-4 flex flex-wrap gap-2 overflow-x-auto">
                {CATEGORIES.map(cat => (
                  <IonChip
                    key={cat}
                    color={activeCategory === cat ? 'primary' : undefined}
                    outline={activeCategory !== cat}
                    onClick={() => setActiveCategory(cat)}
                    className="cursor-pointer"
                  >
                    <IonLabel>{cat}</IonLabel>
                  </IonChip>
                ))}
              </div>
            )}

            {!isAdmin && showCartPanel && (
              <div ref={cartRef} className="mx-4 mb-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <div>
                    <IonText className="font-semibold">Carrinho</IonText>
                    <p className="text-sm text-slate-600">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                  </div>
                  <IonButton size="small" fill="clear" onClick={() => setCart([])} disabled={cart.length === 0}>
                    Limpar carrinho
                  </IonButton>
                </div>
                {cart.length === 0 ? (
                  <p className="text-sm text-slate-600">O seu carrinho está vazio.</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.product._id || item.product.id} className="rounded-3xl border border-slate-200 p-3 bg-slate-50">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <IonText className="font-semibold">{item.product.name}</IonText>
                            <p className="text-sm text-slate-600">€{item.product.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <IonButton size="small" onClick={() => updateCartQuantity(item.product._id || '', item.quantity - 1)}>
                              -
                            </IonButton>
                            <span className="text-sm">{item.quantity}</span>
                            <IonButton size="small" onClick={() => updateCartQuantity(item.product._id || '', item.quantity + 1)}>
                              +
                            </IonButton>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-600">
                          <span>Total</span>
                          <span>€{(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <IonButton size="small" color="danger" fill="clear" onClick={() => removeFromCart(item.product._id || '')}>
                          Remover
                        </IonButton>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                      <IonText className="font-semibold">Total do carrinho</IonText>
                      <IonText className="font-semibold">€{cartTotal.toFixed(2)}</IonText>
                    </div>
                    <IonButton
                      expand="block"
                      color="success"
                      onClick={handleCheckout}
                      disabled={checkoutLoading || cart.length === 0}
                    >
                      {checkoutLoading ? 'A processar...' : 'Pagar com Stripe'}
                    </IonButton>
                  </div>
                )}
              </div>
            )}

            <IonText color="medium" className="mx-4 text-sm">
              {filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </IonText>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <IonSpinner name="crescent" />
              </div>
            ) : (
              <>
                {isAdmin ? (
                  <div className="space-y-4 px-4 pb-24">
                    {products.map(product => (
                      <IonCard key={product._id || product.id} className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
                        <IonCardHeader className="pb-0">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1">
                              <IonText className="text-base font-semibold">{product.name}</IonText>
                              <p className="mt-1 text-sm text-slate-600">{product.description.substring(0, 100)}...</p>
                              <p className="mt-2 text-sm font-semibold">€{product.price.toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <IonBadge 
                                color={product.published ? 'success' : 'warning'} 
                                className="text-sm"
                              >
                                {product.published ? 'Publicado' : 'Rascunho'}
                              </IonBadge>
                              <IonBadge 
                                color={product.inStock ? 'primary' : 'danger'} 
                                className="text-sm"
                              >
                                {product.inStock ? 'Em Stock' : 'Sem Stock'}
                              </IonBadge>
                              <IonBadge
                                color={productStatusColor[product.status || 'pendente']}
                                className="text-sm"
                              >
                                {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Pendente'}
                              </IonBadge>
                            </div>
                          </div>
                        </IonCardHeader>

                        <IonCardContent>
                          <div className="text-sm text-slate-600 space-y-2">
                            <p>Categoria: <strong>{product.category}</strong></p>
                            <p>Detalhes: {product.description}</p>
                            {product.createdBy && (
                              <p>Submetido por: <strong>{product.createdBy.name || product.createdBy.username || product.createdBy.email}</strong></p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200">
                            <IonButton 
                              size="small"
                              color="primary"
                              expand="block"
                              onClick={() => openProductModal(product)}
                            >
                              <IonIcon slot="start" icon={create} />
                              Editar
                            </IonButton>
                            <IonButton 
                              size="small"
                              color="danger"
                              expand="block"
                              onClick={() => setShowDeleteAlert(product._id || '')}
                            >
                              <IonIcon slot="start" icon={trash} />
                              Remover
                            </IonButton>
                            {product.status === 'pendente' && (
                              <>
                                <IonButton
                                  size="small"
                                  color="success"
                                  expand="block"
                                  onClick={() => handleProductStatus(product._id || '', 'aprovado')}
                                >
                                  Aprovar
                                </IonButton>
                                <IonButton
                                  size="small"
                                  color="danger"
                                  expand="block"
                                  onClick={() => handleProductStatus(product._id || '', 'rejeitado')}
                                >
                                  Rejeitar
                                </IonButton>
                              </>
                            )}
                          </div>
                        </IonCardContent>
                      </IonCard>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 px-4 pb-24 sm:grid-cols-2">
                    {filtered.map(product => (
                      <ProductCard
                        key={product._id || product.id}
                        product={product}
                        onAdd={addToCart}
                        disableBuy={isPraticinador}
                      />
                    ))}
                  </div>
                )}

                {filtered.length === 0 && (
                  <div className="mx-4 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70">
                    <span className="text-[56px] block">🔍</span>
                    <IonText color="medium">
                      <p>Nenhum produto encontrado.</p>
                    </IonText>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {adminTab === 'pedidos' && isAdmin && (
          <div className="space-y-4 px-4 pb-24">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <IonSpinner name="crescent" />
              </div>
            ) : (
              <>
                {orders.length === 0 ? (
                  <IonCard className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
                    <IonCardContent className="text-center py-8">
                      <p className="text-slate-600">Nenhum pedido encontrado</p>
                    </IonCardContent>
                  </IonCard>
                ) : (
                  orders.map(order => (
                    <IonCard key={order._id} className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
                      <IonCardHeader className="pb-0">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex-1">
                            <IonText className="text-base font-semibold">{order.userId.name}</IonText>
                            <p className="mt-1 text-sm text-slate-600">{order.userId.email}</p>
                            <p className="mt-1 text-sm text-slate-600">Total: €{order.totalPrice.toFixed(2)}</p>
                            <p className="mt-1 text-sm text-slate-600">{new Date(order.createdAt).toLocaleDateString('pt-PT')}</p>
                          </div>
                          <IonBadge 
                            color={statusColor[order.status] || 'medium'} 
                            className="text-sm"
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </IonBadge>
                        </div>
                      </IonCardHeader>
                      <IonCardContent>
                        <div className="mb-4 space-y-2">
                          <IonText className="font-semibold text-sm">Produtos:</IonText>
                          {order.products.map((p, idx) => (
                            <p key={idx} className="text-sm text-slate-600">
                              • {p.name} - €{p.price.toFixed(2)} x{p.quantity}
                            </p>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-slate-200">
                          {order.status === 'pendente' && (
                            <>
                              <IonButton 
                                size="small"
                                color="success"
                                expand="block"
                                onClick={() => handleUpdateOrderStatus(order._id, 'aprovado')}
                              >
                                Aprovar
                              </IonButton>
                              <IonButton 
                                size="small"
                                color="danger"
                                expand="block"
                                onClick={() => handleUpdateOrderStatus(order._id, 'rejeitado')}
                              >
                                Rejeitar
                              </IonButton>
                            </>
                          )}
                          {order.status === 'aprovado' && (
                            <IonButton 
                              size="small"
                              color="primary"
                              expand="block"
                              onClick={() => handleUpdateOrderStatus(order._id, 'enviado')}
                            >
                              Marcar como Enviado
                            </IonButton>
                          )}
                          {order.status === 'enviado' && (
                            <IonButton 
                              size="small"
                              color="secondary"
                              expand="block"
                              onClick={() => handleUpdateOrderStatus(order._id, 'entregue')}
                            >
                              Marcar como Entregue
                            </IonButton>
                          )}
                        </div>
                      </IonCardContent>
                    </IonCard>
                  ))
                )}
              </>
            )}
          </div>
        )}

        {/* Product Modal */}
        <IonModal isOpen={showProductModal} onDidDismiss={() => setShowProductModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</IonTitle>
              <IonButton slot="end" onClick={() => setShowProductModal(false)}>
                <IonIcon icon={close} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div className="space-y-4">
              <IonItem>
                <IonLabel position="floating">Nome do Produto</IonLabel>
                <IonInput
                  value={formData.name}
                  onIonChange={(e) => setFormData({ ...formData, name: e.detail.value || '' })}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="floating">Descrição</IonLabel>
                <IonInput
                  value={formData.description}
                  onIonChange={(e) => setFormData({ ...formData, description: e.detail.value || '' })}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="floating">Categoria</IonLabel>
                <IonSelect
                  value={formData.category}
                  onIonChange={(e) => setFormData({ ...formData, category: e.detail.value })}
                >
                  <IonSelectOption value="Acessório">Acessório</IonSelectOption>
                  <IonSelectOption value="Uniforme">Uniforme</IonSelectOption>
                  <IonSelectOption value="Equipamento">Equipamento</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="floating">Preço (€)</IonLabel>
                <IonInput
                  type="number"
                  value={formData.price}
                  onIonChange={(e) => setFormData({ ...formData, price: parseFloat(e.detail.value || '0') })}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="floating">Preço Original (€)</IonLabel>
                <IonInput
                  type="number"
                  value={formData.originalPrice || ''}
                  onIonChange={(e) => setFormData({ ...formData, originalPrice: e.detail.value ? parseFloat(e.detail.value) : undefined })}
                />
              </IonItem>

              <div className="space-y-3 bg-slate-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <IonLabel>Em Stock</IonLabel>
                  <IonToggle
                    checked={formData.inStock}
                    onIonChange={(e) => setFormData({ ...formData, inStock: e.detail.checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <IonLabel>Publicado</IonLabel>
                  <IonToggle
                    checked={formData.published}
                    onIonChange={(e) => setFormData({ ...formData, published: e.detail.checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <IonLabel>Disponível para Praticinador</IonLabel>
                  <IonToggle
                    checked={formData.availableForPraticinador}
                    onIonChange={(e) => setFormData({ ...formData, availableForPraticinador: e.detail.checked })}
                  />
                </div>
              </div>

              <IonItem>
                <IonLabel position="floating">Estado do Produto</IonLabel>
                <IonSelect
                  value={formData.status}
                  onIonChange={(e) => setFormData({ ...formData, status: e.detail.value })}
                >
                  <IonSelectOption value="pendente">Pendente</IonSelectOption>
                  <IonSelectOption value="aprovado">Aprovado</IonSelectOption>
                  <IonSelectOption value="rejeitado">Rejeitado</IonSelectOption>
                </IonSelect>
              </IonItem>

              <div className="flex gap-2 pt-4">
                <IonButton expand="block" onClick={() => setShowProductModal(false)} color="medium">
                  Cancelar
                </IonButton>
                <IonButton expand="block" onClick={handleSaveProduct} color="primary">
                  Guardar
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Delete Alert */}
        <IonAlert
          isOpen={showDeleteAlert !== null}
          onDidDismiss={() => setShowDeleteAlert(null)}
          header="Confirmar Remoção"
          message="Tem certeza que deseja remover este produto?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Remover',
              role: 'destructive',
              handler: () => {
                if (showDeleteAlert) {
                  handleDeleteProduct(showDeleteAlert)
                }
              },
            },
          ]}
        />

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2000}
          color={toastMessage.includes('Erro') ? 'danger' : 'success'}
          position="bottom"
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>

      <Navbar />
    </IonPage>
  )
}

export default Loja
