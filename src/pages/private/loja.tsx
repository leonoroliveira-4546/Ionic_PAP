import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSearchbar, IonChip, IonLabel, IonCard, IonCardContent,
  IonBadge, IonButton, IonIcon, IonText, IonToast, IonRippleEffect, IonSpinner
} from '@ionic/react';
import { cartOutline, starSharp, starHalfOutline, starOutline } from 'ionicons/icons';
import { mockProducts, Product } from '../../mockData/shop';
import Navbar from '../../components/MainLayout';
import { shopApi } from '../../hooks/shopApi';

type Category = 'Todos' | 'Kimono' | 'Equipamento' | 'Faixa' | 'Acessório';

const CATEGORIES: Category[] = ['Todos', 'Kimono', 'Equipamento', 'Faixa', 'Acessório'];

const badgeColor: Record<string, string> = {
  'Novo': 'primary',
  'Mais Vendido': 'warning',
  'Promoção': 'danger',
};

const Stars: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const icon = i <= Math.floor(rating) ? starSharp : (i - 0.5 <= rating ? starHalfOutline : starOutline);
        return <IonIcon key={i} icon={icon} style={{ fontSize: 13, color: '#f4a400' }} />;
      })}
    </span>
  );
};

const ProductCard: React.FC<{ product: Product; onAdd: (name: string) => void }> = ({ product, onAdd }) => (
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

    {/* Product image area */}
    <div
      style={{
        height: 130,
        overflow: 'hidden',
        background: '#f4f4f4',
      }}
    >
      <img
        src={product.image}
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
        <Stars rating={product.rating} />
        <IonText color="medium" style={{ fontSize: 11 }}>({product.reviewCount})</IonText>
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

        <IonButton
          size="small"
          fill="solid"
          color="primary"
          disabled={!product.inStock}
          onClick={() => onAdd(product.name)}
          style={{ '--border-radius': '10px', '--padding-start': '10px', '--padding-end': '10px' }}
        >
          <IonIcon slot="icon-only" icon={cartOutline} />
          <IonRippleEffect />
        </IonButton>
      </div>

      {!product.inStock && (
        <IonText color="danger">
          <p style={{ margin: '6px 0 0', fontSize: 11 }}>Fora de estoque</p>
        </IonText>
      )}
    </IonCardContent>
  </IonCard>
);

const Loja: React.FC = () => {
  const { getProducts } = shopApi();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('Todos');
  const [toastMessage, setToastMessage] = useState('');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        setProducts(data.products || data || mockProducts);
      } catch (err) {
        console.error('Failed to load products', err);
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getProducts]);

  const filtered = products.filter(p => {
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

        <IonSearchbar
          value={search}
          onIonInput={e => setSearch(e.detail.value ?? '')}
          placeholder="Buscar produtos..."
          className="mx-4 mb-4 rounded-3xl bg-slate-100 border border-slate-200"
        />

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

        <IonText color="medium" className="mx-4 text-sm">
          {filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </IonText>

        <div className="grid gap-4 px-4 pb-24 sm:grid-cols-2">
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={name => setToastMessage(`"${name}" adicionado ao carrinho!`)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mx-4 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70">
            <span className="text-[56px] block">🔍</span>
            <IonText color="medium">
              <p>Nenhum produto encontrado.</p>
            </IonText>
          </div>
        )}

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2000}
          color="success"
          position="bottom"
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>

      <Navbar />
    </IonPage>
  );
};

export default Loja;
