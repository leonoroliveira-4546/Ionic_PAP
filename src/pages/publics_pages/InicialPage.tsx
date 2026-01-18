import React from "react";
import { IonPage, IonContent, IonInput, IonButton, IonItem} from "@ionic/react";
import { useHistory } from "react-router-dom";
import '../StylesPages.css';
import { auth, googleProvider } from "../../firebaseConfig";
import { signInWithPopup } from "firebase/auth";

const InicialPage: React.FC = () => {
  const history = useHistory();

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Usuário:", result.user);
      history.push("/home");
    } catch (error) {
      console.error("Erro no login:", error);
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