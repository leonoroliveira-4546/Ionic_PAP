import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSearchbar, IonChip, IonLabel, IonCard, IonCardContent,
  IonBadge, IonButton, IonIcon, IonText, IonToast, IonRippleEffect
} from '@ionic/react';
import { cartOutline, starSharp, starHalfOutline, starOutline } from 'ionicons/icons';
import { mockProducts, Product } from '../../mockData/shop';
import Navbar from '../../components/MainLayout';

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
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('Todos');
  const [toastMessage, setToastMessage] = useState('');

  const filtered = mockProducts.filter(p => {
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

      <IonContent>
        <IonSearchbar
          value={search}
          onIonInput={e => setSearch(e.detail.value ?? '')}
          placeholder="Buscar produtos..."
          style={{ padding: '8px 8px 0' }}
        />

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, padding: '8px 16px 12px', overflowX: 'auto' }}>
          {CATEGORIES.map(cat => (
            <IonChip
              key={cat}
              color={activeCategory === cat ? 'primary' : undefined}
              outline={activeCategory !== cat}
              onClick={() => setActiveCategory(cat)}
              style={{ flexShrink: 0, cursor: 'pointer' }}
            >
              <IonLabel>{cat}</IonLabel>
            </IonChip>
          ))}
        </div>

        {/* Results count */}
        <IonText color="medium">
          <p style={{ paddingLeft: 16, margin: '0 0 8px', fontSize: 13 }}>
            {filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
        </IonText>

        {/* Product grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            padding: '0 12px 24px',
          }}
        >
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={name => setToastMessage(`"${name}" adicionado ao carrinho!`)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <span style={{ fontSize: 56 }}>🔍</span>
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
