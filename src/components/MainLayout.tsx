import { IonFooter, IonToolbar, IonButton, IonIcon } from '@ionic/react'
import { home, people, chatbubble, personCircleOutline, cartSharp, trophyOutline, flashOutline, listOutline, bookOutline, shieldCheckmarkOutline } from 'ionicons/icons'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const Navbar: React.FC = () => {
  const location = useLocation()
  const { user } = useAuth()
  const isAdmin = user?.type === 'admin'
  const isPraticinador = user?.type === 'praticinador'

  return (
    <IonFooter>
      <IonToolbar className="navbar-toolbar">
        
        {!isAdmin && !isPraticinador && (
          <IonButton 
            routerLink="/home"
            fill={location.pathname === '/home' ? 'solid' : 'clear'}
            className='nav-button'
          >
            <IonIcon icon={home} />
          </IonButton>
        )}

        {!isPraticinador && (
          <IonButton 
            routerLink="/comunidade"
            fill={location.pathname === '/comunidade' ? 'solid' : 'clear'}
            className='nav-button'
          >
            <IonIcon icon={people} />
          </IonButton>
        )}

        <IonButton 
          routerLink="/shop"
          fill={location.pathname === '/shop' ? 'solid' : 'clear'}
          className='nav-button'
        >
          <IonIcon icon={cartSharp} />
        </IonButton>

        {!isAdmin && !isPraticinador && (
          <IonButton 
            routerLink="/chat"
            fill={location.pathname === '/chat' ? 'solid' : 'clear'}
            className='nav-button'
          >
            <IonIcon icon={chatbubble} />
          </IonButton>
        )}

        <IonButton 
          routerLink="/perfil"
          fill={location.pathname === '/perfil' ? 'solid' : 'clear'}
          className='nav-button'
        >
          <IonIcon icon={personCircleOutline} />
        </IonButton>

        {!isPraticinador && (
          <IonButton 
            routerLink="/ranking"
            fill={location.pathname === '/ranking' ? 'solid' : 'clear'}
            className='nav-button'
          >
            <IonIcon icon={trophyOutline} />
          </IonButton>
        )}

        {!isAdmin && !isPraticinador && (
          <IonButton 
            routerLink="/predicoes"
            fill={location.pathname === '/predicoes' ? 'solid' : 'clear'}
            className='nav-button'
          >
            <IonIcon icon={flashOutline} />
          </IonButton>
        )}

        <IonButton 
          routerLink="/planos"
          fill={location.pathname === '/planos' ? 'solid' : 'clear'}
          className='nav-button'
        >
          <IonIcon icon={listOutline} />
        </IonButton>

        {!isPraticinador && (
          <IonButton 
            routerLink="/educacional"
            fill={location.pathname === '/educacional' ? 'solid' : 'clear'}
            className='nav-button'
          >
            <IonIcon icon={bookOutline} />
          </IonButton>
        )}

        {isAdmin && (
          <IonButton 
            routerLink="/admin"
            fill={location.pathname === '/admin' ? 'solid' : 'clear'}
            className='nav-button'
          >
            <IonIcon icon={shieldCheckmarkOutline} />
          </IonButton>
        )}
      </IonToolbar>
    </IonFooter>
  )
}

export default Navbar