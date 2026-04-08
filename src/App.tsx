import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import React from 'react';
import { AuthProvider } from './AuthContext';

import Home from './pages/private/Home/Home';
import Login from './pages/public/Login';
import Signup from './pages/public/SignUp';
import PrivateRoute from './components/PrivadeRoute';
import InicialPage from './pages/public/InicialPage';
import Comunidade from './pages/private/Comunidade/Comunidade';
import DetalhesPost from './pages/private/Comunidade/temporario/DetailsPost';
import Chat from './pages/private/Chat/Chat';
import ConfirmResponsavel from './pages/public/ConfirmResponsavel';
import ProfileSettings from './pages/private/ProfileSettings';
import Shop from './pages/private/loja';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  return(
    <AuthProvider>
      <InnerApp/>
    </AuthProvider>
  )
};

const InnerApp: React.FC = () => {
  return(
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Rotas públicas */}
          <Route exact path='/login' component={Login}/>
          <Route exact path='/' component={InicialPage}/>
          <Route exact path='/signup' component={Signup}/>
          <Route exact path='/signup/confirm-responsavel' component={ConfirmResponsavel}/>

          {/* Rotas privadas */}
          <PrivateRoute exact path='/home' component={Home}/>
          <PrivateRoute exact path='/comunidade' component={Comunidade}/>
          <PrivateRoute exact path='/comunidade/post/:id' component={DetalhesPost}/>
          <PrivateRoute exact path='/chat' component={Chat}/>
          <PrivateRoute exact path='/perfil' component={ProfileSettings}/>
          <PrivateRoute exact path='/shop' component={Shop}/>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  )
}

export default App;