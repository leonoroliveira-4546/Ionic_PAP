import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonButton, IonIcon, IonBadge, IonList, IonItem, IonLabel, IonSpinner
} from '@ionic/react';
import { checkmarkCircle, star, starOutline } from 'ionicons/icons';
import Navbar from '../../../components/MainLayout';
import usePlansApi from '../../../hooks/usePlansApi';

const Planos: React.FC = () => {
  const { plans, currentPlan, loading, error, subscribePlan } = usePlansApi();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async (plan: any) => {
    if (plan.price === 0) {
      alert('Você já tem o plano Free ativo!');
      return;
    }

    const response = await subscribePlan(plan.id);
    if (response.success) {
      alert(`Plano ${plan.name} ativado com sucesso!`);
    } else {
      alert(response.message || 'Não foi possível atualizar o plano.');
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>💳 Planos</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
        <Navbar />
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

      <IonContent className="ion-padding background">
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <IonText style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
            Escolha seu Plano
          </IonText>
          <p style={{ margin: '8px 0', color: 'var(--ion-color-medium)' }}>
            Desbloqueie todo o potencial do seu karatê
          </p>
        </div>

        {/* Plans Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
            padding: '0 0 24px'
          }}
        >
          {plans.map(plan => (
            <IonCard
              key={plan.id}
              style={{
                position: 'relative',
                border: selectedPlan === plan.id ? '2px solid var(--ion-color-primary)' : '1px solid var(--ion-color-light-shade)',
                borderRadius: 16,
                overflow: 'visible'
              }}
              button
              onClick={() => handleSelectPlan(plan.id)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--ion-color-warning)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 'bold',
                    zIndex: 1
                  }}
                >
                  MAIS POPULAR
                </div>
              )}

              <IonCardHeader style={{ textAlign: 'center', paddingTop: plan.popular ? 20 : 16 }}>
                <IonCardTitle style={{ fontSize: 24, color: `var(--ion-color-${plan.color})` }}>
                  {plan.name}
                </IonCardTitle>
                <div style={{ margin: '8px 0' }}>
                  <IonText style={{ fontSize: 32, fontWeight: 'bold' }}>
                    €{plan.price}
                  </IonText>
                  <IonText color="medium" style={{ fontSize: 16 }}>
                    /{plan.period}
                  </IonText>
                </div>
                <IonText color="medium" style={{ fontSize: 14 }}>
                  {plan.description}
                </IonText>
              </IonCardHeader>

              <IonCardContent>
                <IonList style={{ background: 'transparent' }}>
                  {plan.features.map((feature, index) => (
                    <IonItem key={index} lines="none" style={{ '--padding-start': 0, '--inner-padding-end': 0 }}>
                      <IonIcon
                        icon={checkmarkCircle}
                        color="success"
                        style={{ marginRight: 12, fontSize: 18 }}
                      />
                      <IonLabel>
                        <IonText style={{ fontSize: 14 }}>{feature}</IonText>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>

                <IonButton
                  expand="block"
                  color={plan.color}
                  style={{ marginTop: 20 }}
                  disabled={currentPlan === plan.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe(plan);
                  }}
                >
                  {currentPlan === plan.id ? 'Plano Atual' : 'Escolher Plano'}
                </IonButton>
              </IonCardContent>
            </IonCard>
          ))}
        </div>

        {error && (
          <IonText color="danger">
            <p style={{ marginTop: 0 }}>{error}</p>
          </IonText>
        )}

        {/* FAQ Section */}
        <div style={{ marginTop: 32 }}>
          <IonText style={{ fontSize: 20, fontWeight: 'bold', display: 'block', marginBottom: 16 }}>
            ❓ Perguntas Frequentes
          </IonText>

          <IonCard style={{ margin: '8px 0' }}>
            <IonCardContent>
              <IonText style={{ fontWeight: 600 }}>Posso cancelar a qualquer momento?</IonText>
              <p style={{ margin: '8px 0', color: 'var(--ion-color-medium)' }}>
                Sim, você pode cancelar sua assinatura a qualquer momento sem taxas adicionais.
              </p>
            </IonCardContent>
          </IonCard>

          <IonCard style={{ margin: '8px 0' }}>
            <IonCardContent>
              <IonText style={{ fontWeight: 600 }}>Como funciona o período de teste?</IonText>
              <p style={{ margin: '8px 0', color: 'var(--ion-color-medium)' }}>
                Oferecemos 7 dias de teste gratuito para os planos pagos. Você pode cancelar antes do fim do período sem custos.
              </p>
            </IonCardContent>
          </IonCard>

          <IonCard style={{ margin: '8px 0' }}>
            <IonCardContent>
              <IonText style={{ fontWeight: 600 }}>Os descontos na loja são cumulativos?</IonText>
              <p style={{ margin: '8px 0', color: 'var(--ion-color-medium)' }}>
                Não, os descontos são aplicados ao preço final e não são cumulativos com outras promoções.
              </p>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Contact */}
        <div style={{ textAlign: 'center', padding: '32px 20px', backgroundColor: 'var(--ion-color-light)', borderRadius: 12, marginTop: 24 }}>
          <IonText style={{ fontSize: 16, color: 'var(--ion-color-medium)' }}>
            <p style={{ margin: 0 }}>
              Precisa de ajuda para escolher o plano ideal?<br />
              Entre em contato conosco: <strong>suporte@wareradōjō.com</strong>
            </p>
          </IonText>
        </div>
      </IonContent>

      <Navbar />
    </IonPage>
  );
};

export default Planos;