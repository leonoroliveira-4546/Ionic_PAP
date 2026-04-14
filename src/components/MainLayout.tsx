import { IonFooter, IonToolbar, IonButton, IonIcon } from '@ionic/react';
import { home, people, chatbubble, personCircleOutline, cartOutline, cartSharp } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <IonFooter>
      <IonToolbar style={{ display: 'flex', justifyContent: 'space-around' }}>
        
        <IonButton 
          routerLink="/home"
          fill={location.pathname === '/home' ? 'solid' : 'clear'}
          className='nav-button'
        >
          <IonIcon icon={home} />
        </IonButton>

        <IonButton 
          routerLink="/comunidade"
          fill={location.pathname === '/comunidade' ? 'solid' : 'clear'}
          className='nav-button'
        >
          <IonIcon icon={people} />
        </IonButton>

        <IonButton 
          routerLink="/shop"
          fill={location.pathname === '/shop' ? 'solid' : 'clear'}
          className='nav-button'
        >
          <IonIcon icon={cartSharp} />
        </IonButton>

        <IonButton 
          routerLink="/chat"
          fill={location.pathname === '/chat' ? 'solid' : 'clear'}
          className='nav-button'
        >
          <IonIcon icon={chatbubble} />
        </IonButton>

        <IonButton 
          routerLink="/perfil"
          fill={location.pathname === '/perfil' ? 'solid' : 'clear'}
          className='nav-button'
        >
          <IonIcon icon={personCircleOutline} />
        </IonButton>

        <IonButton 
          routerLink="/ranking"
          fill={location.pathname === '/ranking' ? 'solid' : 'clear'}
          className='nav-button'
        >
          <IonIcon icon={personCircleOutline} />
        </IonButton>

        <IonButton 
          routerLink="/predicoes"
          fill={location.pathname === '/predicoes' ? 'solid' : 'clear'}
          className='nav-button'
        >
          <IonIcon icon={personCircleOutline} />
        </IonButton>

        <IonButton 
          routerLink="/planos"
          fill={location.pathname === '/planos' ? 'solid' : 'clear'}
          className='nav-button'
        >
          <IonIcon icon={personCircleOutline} />
        </IonButton>
        
        <IonButton 
          routerLink="/educacional"
          fill={location.pathname === '/educacional' ? 'solid' : 'clear'}
          className='nav-button'
        >
          <IonIcon icon={personCircleOutline} />
        </IonButton>

      </IonToolbar>
    </IonFooter>
  );
};

export default Navbar;