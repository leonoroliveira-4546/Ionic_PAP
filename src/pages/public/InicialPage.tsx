import React from "react";
import { IonPage, IonContent, IonButton} from "@ionic/react";
import { auth, googleProvider } from "../../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import authApi from "../../hooks/authApi";
import '../StylesPages.css';

const InicialPage: React.FC = () => {
  const { Login } = useAuth();
  const { login } = authApi(Login);
  const history = useHistory();

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      const idToken = await result.user.getIdToken();
      const apiResult = await login(idToken);

      if (apiResult.success) {
        history.push('/home');
      } else {
        console.error(apiResult.error);
      }
    } catch (error: any) {
      console.error("Erro no login: ", error.message);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="content" scrollY={false}>
        <div className="page">

          {/* LOGO */}
          <div className="logo">Logo</div>

          <h1 className="title">Bem-vindo ao seu dojo</h1>
          <p className="subtitle">
            Uma plataforma para gerir dojos e aproximar senseis, atletas e responsáveis.
          </p>

          <IonButton expand="block" className="btn" onClick={() => history.push("/login")}>
            Iniciar Sessão
          </IonButton>

          <IonButton expand="block" fill="outline" className="btn-outline" onClick={() => history.push("/signup")}>
            Criar Conta
          </IonButton>

          <p className="social-text">Ou entre via</p>

          <div className="social-container">
            <div className="social-btn google" onClick={loginWithGoogle}>
              G
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default InicialPage;