import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonText, IonCard, IonCardContent, IonCardHeader,
  IonBadge, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonToggle, IonModal, IonAlert, IonToast, IonSpinner
} from '@ionic/react';
import { add, create, trash, close } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import Navbar from '../../components/MainLayout';
import { shopApi } from '../../hooks/shopApi';
import { useAuth } from '../../AuthContext';

interface ExtendedProduct {
  _id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  inStock: boolean;
  badge?: string;
  image?: string;
  published?: boolean;
  status?: 'pendente' | 'aprovado' | 'rejeitado';
  availableForPraticinador?: boolean;
}

const productStatusColor: Record<string, string> = {
  pendente: 'warning',
  aprovado: 'success',
  rejeitado: 'danger',
};

const SeusProdutos: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const { getMyProducts, createProduct, updateProduct, deleteProduct } = shopApi();

  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ExtendedProduct | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Acessório',
    price: 0,
    originalPrice: undefined as number | undefined,
    quantity: 1,
    availableForPraticinador: true,
    image: '',
  });

  useEffect(() => {
    if (!user) return;
    if (user.type !== 'praticinador') {
      history.replace('/shop');
      return;
    }
    loadProducts();
  }, [user]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getMyProducts();
      setProducts((data.products || data || []) as ExtendedProduct[]);
    } catch (error) {
      console.error('Failed to load products', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const openProductModal = (product?: ExtendedProduct) => {
    if (product) {
      setEditingProduct(product);
      setImageFile(null);
      setImagePreview(product.image || '');
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: product.quantity ?? 1,
        availableForPraticinador: product.availableForPraticinador ?? true,
        image: product.image || '',
      });
    } else {
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview('');
      setFormData({
        name: '',
        description: '',
        category: 'Acessório',
        price: 0,
        originalPrice: undefined,
        quantity: 1,
        availableForPraticinador: true,
        image: '',
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      let payload: any;
      if (imageFile) {
        const form = new FormData();
        form.append('name', formData.name);
        form.append('description', formData.description);
        form.append('category', formData.category);
        form.append('price', String(formData.price));
        if (formData.originalPrice !== undefined) {
          form.append('originalPrice', String(formData.originalPrice));
        }
        form.append('quantity', String(formData.quantity));
        form.append('availableForPraticinador', String(formData.availableForPraticinador));
        form.append('file', imageFile);
        payload = form;
      } else {
        payload = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: formData.price,
          quantity: formData.quantity,
          availableForPraticinador: formData.availableForPraticinador,
        };
        if (formData.originalPrice !== undefined) {
          payload.originalPrice = formData.originalPrice;
        }
        if (formData.image) {
          payload.image = formData.image;
        }
      }

      if (editingProduct?._id) {
        const updated = await updateProduct(editingProduct._id, payload);
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? { ...p, ...updated.product } : p));
      } else {
        const created = await createProduct(payload);
        setProducts(prev => [created.product as ExtendedProduct, ...prev]);
      }
      setShowProductModal(false);
      setToastMessage('Produto guardado com sucesso!');
    } catch (error) {
      console.error('Failed to save product', error);
      setToastMessage('Erro ao guardar produto.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      setShowDeleteAlert(null);
      setToastMessage('Produto removido com sucesso!');
    } catch (error) {
      console.error('Failed to delete product', error);
      setToastMessage('Erro ao remover produto.');
    }
  };

  const canEdit = (product: ExtendedProduct) => product.status === 'pendente';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Seus Produtos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding background bg-slate-950/5 text-slate-950">
        <div className="mx-4 mb-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <IonText className="text-lg font-semibold">Seus Produtos</IonText>
          <p className="mt-2 text-sm text-slate-600">
            Aqui você pode criar, editar e remover seus produtos. Quando o admin aceitar ou rejeitar,
            o produto não poderá mais ser alterado.
          </p>
        </div>

        <IonButton
          expand="block"
          className="mx-4 mb-4 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
          onClick={() => openProductModal()}
        >
          <IonIcon slot="start" icon={add} />
          Novo Produto
        </IonButton>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <div className="space-y-4 px-4 pb-24">
            {products.length === 0 ? (
              <IonCard className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
                <IonCardContent className="text-center py-8">
                  <p className="text-slate-600">Nenhum produto criado ainda.</p>
                </IonCardContent>
              </IonCard>
            ) : (
              products.map(product => (
                <IonCard key={product._id} className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
                  <IonCardHeader className="pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <IonText className="text-base font-semibold">{product.name}</IonText>
                        <p className="mt-1 text-sm text-slate-600">{product.description.substring(0, 100)}...</p>
                        <p className="mt-2 text-sm font-semibold">€{product.price.toFixed(2)}</p>
                      </div>
                      <IonBadge color={productStatusColor[product.status || 'pendente']} className="text-sm">
                        {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Pendente'}
                      </IonBadge>
                    </div>
                  </IonCardHeader>

                  <IonCardContent>
                    <div className="text-sm text-slate-600 space-y-2">
                      <p>Categoria: <strong>{product.category}</strong></p>
                      <p>Detalhes: {product.description}</p>
                      <p>Quantidade em stock: <strong>{product.quantity ?? 0}</strong></p>
                      <p>Disponível para praticinador: <strong>{product.availableForPraticinador ? 'Sim' : 'Não'}</strong></p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200">
                      <IonButton
                        size="small"
                        color="primary"
                        expand="block"
                        onClick={() => openProductModal(product)}
                        disabled={!canEdit(product)}
                      >
                        <IonIcon slot="start" icon={create} />
                        Editar
                      </IonButton>
                      <IonButton
                        size="small"
                        color="danger"
                        expand="block"
                        onClick={() => setShowDeleteAlert(product._id || '')}
                        disabled={!canEdit(product)}
                      >
                        <IonIcon slot="start" icon={trash} />
                        Remover
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))
            )}
          </div>
        )}

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
                <IonInput value={formData.name} onIonChange={e => setFormData({ ...formData, name: e.detail.value || '' })} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Descrição</IonLabel>
                <IonInput value={formData.description} onIonChange={e => setFormData({ ...formData, description: e.detail.value || '' })} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Categoria</IonLabel>
                <IonSelect value={formData.category} onIonChange={e => setFormData({ ...formData, category: e.detail.value })}>
                  <IonSelectOption value="Acessório">Acessório</IonSelectOption>
                  <IonSelectOption value="Uniforme">Uniforme</IonSelectOption>
                  <IonSelectOption value="Equipamento">Equipamento</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Preço (€)</IonLabel>
                <IonInput type="number" value={formData.price} onIonChange={e => setFormData({ ...formData, price: parseFloat(e.detail.value || '0') })} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Preço Original (€)</IonLabel>
                <IonInput type="number" value={formData.originalPrice || ''} onIonChange={e => setFormData({ ...formData, originalPrice: e.detail.value ? parseFloat(e.detail.value) : undefined })} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Quantidade em Stock</IonLabel>
                <IonInput type="number" value={formData.quantity} onIonChange={e => setFormData({ ...formData, quantity: parseInt(e.detail.value || '0', 10) || 0 })} />
              </IonItem>
              <div>
                <IonLabel className="block mb-2 font-medium text-sm">Imagem do Produto</IonLabel>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                    if (file) {
                      setImagePreview(URL.createObjectURL(file));
                    } else {
                      setImagePreview(formData.image || '');
                    }
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview do produto" className="mt-3 h-48 w-full rounded-xl object-cover" />
                ) : null}
              </div>
              <div className="space-y-3 bg-slate-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <IonLabel>Disponível para Praticinador</IonLabel>
                  <IonToggle checked={formData.availableForPraticinador} onIonChange={e => setFormData({ ...formData, availableForPraticinador: e.detail.checked })} />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <IonButton expand="block" onClick={() => setShowProductModal(false)} color="medium">Cancelar</IonButton>
                <IonButton expand="block" onClick={handleSaveProduct} color="primary">Guardar</IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showDeleteAlert !== null}
          onDidDismiss={() => setShowDeleteAlert(null)}
          header="Confirmar Remoção"
          message="Tem certeza que deseja remover este produto?"
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Remover', role: 'destructive', handler: () => { if (showDeleteAlert) handleDeleteProduct(showDeleteAlert); } },
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
  );
};

export default SeusProdutos;
