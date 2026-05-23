import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonButton, IonIcon, IonBadge, IonList, IonItem, IonLabel,
  IonSpinner,
  IonModal,
  IonCheckbox,
  IonInput,
  IonTextarea
} from '@ionic/react';
import {
  checkmarkCircle,
  createOutline,
  trashOutline,
  addOutline
} from 'ionicons/icons';
import Navbar from '../../components/MainLayout';
import { useAuth } from '../../AuthContext';
import { plansApi } from '../../hooks/plansApi';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const Planos: React.FC = () => {
  const { getPlans, createPlan, updatePlan } = plansApi();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const emptyPlan: Plan = {
    id: '',
    name: '',
    price: 0,
    period: 'mês',
    description: '',
    features: [],
    color: 'primary'
  };

  const [newPlan, setNewPlan] = useState<Plan>(emptyPlan);

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      try {
        const data = await getPlans();
        const mappedPlans = (data.plans || data || []).map((p: any) => ({
          ...p,
          id: p._id
        }));

        setPlans(mappedPlans);
      } catch (err) {
        console.error('Failed to load plans', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [getPlans]);

  const handleSelectPlan = (planId: string) => setSelectedPlan(planId);

  const handleSubscribe = (plan: Plan) => {
    if (plan.price === 0) {
      alert('Você já tem o plano Free ativo!');
      return;
    }
    console.log('Subscribing to plan:', plan.name);
    alert(`Assinatura do plano ${plan.name} solicitada! Em breve você receberá as instruções de pagamento.`);
  };

  const handleAddPlan = async () => {
    try {
      const payload = {
        name: newPlan.name,
        price: newPlan.price,
        period: newPlan.period,
        description: newPlan.description,
        features: newPlan.features,
        color: newPlan.color,
        popular: newPlan.popular || false
      };

      const response = await createPlan(payload);

      if (response.success) {
        setPlans(prev => [...prev, response.plan]);

        setNewPlan({
          id: '',
          name: '',
          price: 0,
          period: 'mês',
          description: '',
          features: [],
          color: 'primary'
        });

        alert('Plano criado com sucesso!');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao criar plano');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPlan) return;

    try {
      const response = await updatePlan(editingPlan.id, {
        name: editingPlan.name,
        price: editingPlan.price,
        period: editingPlan.period,
        description: editingPlan.description,
        features: editingPlan.features,
        color: editingPlan.color,
        popular: editingPlan.popular || false
      });

      if (response.success) {
        setPlans(prev =>
          prev.map(p =>
            p.id === editingPlan.id
              ? response.plan
              : p
          )
        );

        setEditingPlan(null);

        alert('Plano atualizado!');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar plano');
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Planos</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>💳 Planos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding background bg-slate-950/5 text-slate-950">
        <div className="mx-4 mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 text-center">
          <IonText className="text-2xl font-bold text-slate-900">Escolha seu Plano</IonText>
          <p className="mt-2 text-sm text-slate-600">Desbloqueie todo o potencial do seu karatê</p>
          {isAdmin && (
            <div className="px-4 mb-4">
              <IonButton
                expand="block"
                onClick={() => setShowCreateModal(true)}
              >
                <IonIcon icon={addOutline} slot="start" />
                Adicionar Plano
              </IonButton>
            </div>
          )}
        </div>

        <div className="grid gap-4 px-4 pb-24 sm:grid-cols-2">
          {plans.map(plan => (
            <IonCard
              key={plan.id}
              className={`relative overflow-visible rounded-3xl ${selectedPlan === plan.id ? 'border-2 border-primary' : 'border border-slate-200'} bg-white shadow-sm`}
              button
              onClick={() => handleSelectPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute left-1/2 top-[-12px] z-10 -translate-x-1/2 rounded-full bg-warning px-4 py-1 text-xs font-bold text-white">
                  MAIS POPULAR
                </div>
              )}

              <IonCardHeader className="text-center pt-6">
                <IonCardTitle className="text-2xl font-bold" style={{ color: `var(--ion-color-${plan.color})` }}>{plan.name}</IonCardTitle>
                <div className="my-3">
                  <IonText className="text-3xl font-extrabold">€{plan.price}</IonText>
                  <IonText color="medium" className="text-base">/ {plan.period}</IonText>
                </div>
                <IonText color="medium" className="text-sm">{plan.description}</IonText>
              </IonCardHeader>

              <IonCardContent className="space-y-3">
                <IonList className="bg-transparent">
                  {plan.features.map((feature, index) => (
                    <IonItem key={index} lines="none" className="!px-0">
                      <IonIcon icon={checkmarkCircle} color="success" className="mr-3 text-base" />
                      <IonLabel>
                        <IonText className="text-sm">{feature}</IonText>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>

                <IonButton
                  expand="block"
                  color={plan.color}
                  className="mt-4 rounded-full"
                  onClick={(e) => { e.stopPropagation(); handleSubscribe(plan); }}
                >
                  {plan.price === 0 ? 'Plano Atual' : 'Escolher Plano'}
                </IonButton>
                {isAdmin && (
                  <div className="mt-4 flex gap-2">
                    <IonButton
                      expand="block"
                      fill="outline"
                      color="medium"
                      onClick={(e) => {
                        e.stopPropagation();
                          setEditingPlan({
                            ...plan
                          }); 
                        setShowEditModal(true);
                      }}
                    >
                      <IonIcon icon={createOutline} slot="start" />
                      Editar
                    </IonButton>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          ))}
        </div>

        <div className="mx-4 mt-8 space-y-4">
          <IonText className="text-xl font-bold text-slate-900 block">❓ Perguntas Frequentes</IonText>

          <IonCard className="rounded-3xl border border-slate-200/80 shadow-sm">
            <IonCardContent>
              <IonText className="font-semibold">Posso cancelar a qualquer momento?</IonText>
              <p className="mt-2 text-sm text-slate-600">Sim, você pode cancelar sua assinatura a qualquer momento sem taxas adicionais.</p>
            </IonCardContent>
          </IonCard>

          <IonCard className="rounded-3xl border border-slate-200/80 shadow-sm">
            <IonCardContent>
              <IonText className="font-semibold">Como funciona o período de teste?</IonText>
              <p className="mt-2 text-sm text-slate-600">Oferecemos 7 dias de teste gratuito para os planos pagos. Você pode cancelar antes do fim do período sem custos.</p>
            </IonCardContent>
          </IonCard>

          <IonCard className="rounded-3xl border border-slate-200/80 shadow-sm">
            <IonCardContent>
              <IonText className="font-semibold">Os descontos na loja são cumulativos?</IonText>
              <p className="mt-2 text-sm text-slate-600">Não, os descontos são aplicados ao preço final e não são cumulativos com outras promoções.</p>
            </IonCardContent>
          </IonCard>
        </div>

        <div className="mx-4 mt-6 rounded-3xl bg-slate-100 p-6 text-center shadow-sm ring-1 ring-slate-200/70">
          <IonText className="text-sm text-slate-600">
            Precisa de ajuda para escolher o plano ideal?<br />Entre em contato conosco: <strong>suporte@wareradōjō.com</strong>
          </IonText>
        </div>

        <IonModal
        isOpen={showCreateModal}
        onDidDismiss={() => setShowCreateModal(false)}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Novo Plano</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <div className="space-y-4">
            <IonInput
              label="Nome"
              labelPlacement="stacked"
              value={newPlan.name}
              onIonInput={(e) =>
                setNewPlan({
                  ...newPlan,
                  name: e.detail.value!
                })
              }
            />

            <IonInput
              type="number"
              label="Preço"
              labelPlacement="stacked"
              value={newPlan.price}
              onIonInput={(e) =>
                setNewPlan({
                  ...newPlan,
                  price: Number(e.detail.value)
                })
              }
            />

            <IonInput
              label="Período"
              labelPlacement="stacked"
              value={newPlan.period}
              onIonInput={(e) =>
                setNewPlan({
                  ...newPlan,
                  period: e.detail.value!
                })
              }
            />

            <IonTextarea
              label="Descrição"
              labelPlacement="stacked"
              value={newPlan.description}
              onIonInput={(e) =>
                setNewPlan({
                  ...newPlan,
                  description: e.detail.value!
                })
              }
            />

            <IonInput
              label="Features (separadas por vírgula)"
              labelPlacement="stacked"
              onIonInput={(e) =>
                setNewPlan({
                  ...newPlan,
                  features: e.detail.value!
                    .split(',')
                    .map(f => f.trim())
                })
              }
            />

            <IonInput
              label="Cor"
              labelPlacement="stacked"
              value={newPlan.color}
              onIonInput={(e) =>
                setNewPlan({
                  ...newPlan,
                  color: e.detail.value!
                })
              }
            />

            <IonItem lines="none">
              <IonCheckbox
                checked={newPlan.popular}
                onIonChange={(e) =>
                  setNewPlan({
                    ...newPlan,
                    popular: e.detail.checked
                  })
                }
              />
              <IonLabel className="ml-3">
                Plano popular
              </IonLabel>
            </IonItem>

            <div className="flex gap-3 pt-4">
              <IonButton
                expand="block"
                onClick={async () => {
                  await handleAddPlan();
                  setShowCreateModal(false);
                }}
              >
                Criar
              </IonButton>

              <IonButton
                expand="block"
                fill="outline"
                color="medium"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>
      <IonModal
        isOpen={showEditModal}
        onDidDismiss={() => setShowEditModal(false)}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Editar Plano</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {editingPlan && (
            <div className="space-y-4">

              <IonInput
                label="Nome"
                labelPlacement="stacked"
                value={editingPlan.name}
                onIonInput={(e) =>
                  setEditingPlan({
                    ...editingPlan,
                    name: e.detail.value!
                  })
                }
              />

              <IonInput
                type="number"
                label="Preço"
                labelPlacement="stacked"
                value={editingPlan.price}
                onIonInput={(e) =>
                  setEditingPlan({
                    ...editingPlan,
                    price: Number(e.detail.value)
                  })
                }
              />

              <IonInput
                label="Período"
                labelPlacement="stacked"
                value={editingPlan.period}
                onIonInput={(e) =>
                  setEditingPlan({
                    ...editingPlan,
                    period: e.detail.value!
                  })
                }
              />

              <IonTextarea
                label="Descrição"
                labelPlacement="stacked"
                value={editingPlan.description}
                onIonInput={(e) =>
                  setEditingPlan({
                    ...editingPlan,
                    description: e.detail.value!
                  })
                }
              />

              <IonInput
                label="Features"
                labelPlacement="stacked"
                value={editingPlan.features.join(', ')}
                onIonInput={(e) =>
                  setEditingPlan({
                    ...editingPlan,
                    features: e.detail.value!
                      .split(',')
                      .map(f => f.trim())
                  })
                }
              />

              <IonInput
                label="Cor"
                labelPlacement="stacked"
                value={editingPlan.color}
                onIonInput={(e) =>
                  setEditingPlan({
                    ...editingPlan,
                    color: e.detail.value!
                  })
                }
              />

              <IonItem lines="none">
                <IonCheckbox
                  checked={editingPlan.popular}
                  onIonChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      popular: e.detail.checked
                    })
                  }
                />
                <IonLabel className="ml-3">
                  Plano popular
                </IonLabel>
              </IonItem>

              <div className="flex gap-3 pt-4">
                <IonButton
                  expand="block"
                  onClick={async () => {
                    await handleSaveEdit();
                    setShowEditModal(false);
                  }}
                >
                  Salvar
                </IonButton>

                <IonButton
                  expand="block"
                  fill="outline"
                  color="medium"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </IonButton>
              </div>
            </div>
          )}
        </IonContent>
      </IonModal>
      </IonContent>
      <Navbar />
    </IonPage>
  );
};

export default Planos;