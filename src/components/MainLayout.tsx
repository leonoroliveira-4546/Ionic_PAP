import { IonFooter, IonToolbar, IonButton, IonIcon } from '@ionic/react';
import { home, people } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <IonFooter>
      <IonToolbar style={{ display: 'flex', justifyContent: 'space-around' }}>
        
        <IonButton 
          routerLink="/home"
          fill={location.pathname === '/home' ? 'solid' : 'clear'}
        >
          <IonIcon icon={home} />
        </IonButton>

        <IonButton 
          routerLink="/comunidade"
          fill={location.pathname === '/comunidade' ? 'solid' : 'clear'}
        >
          <IonIcon icon={people} />
        </IonButton>

      </IonToolbar>
    </IonFooter>
  );
};

export default Navbar;