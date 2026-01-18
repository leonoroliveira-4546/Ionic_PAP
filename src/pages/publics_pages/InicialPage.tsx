import React from "react";
import { IonPage, IonContent, IonInput, IonButton, IonItem} from "@ionic/react";
import { useHistory } from "react-router-dom";
import '../StylesPages.css';

const InicialPage: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen className="content" scrollY={false}>
        <div className="page">

          {/* LOGO */}
          <div className="logo">Logo</div>

          <h1 className="title">Bem-vindo ao seu dojo digital</h1>
          <p className="subtitle">
            Uma plataforma para gerir dojos e aproximar senseis, atletas e responsáveis.
          </p>

          <IonButton expand="block" className="btn">
            Iniciar Sessão
          </IonButton>

          <IonButton expand="block" fill="outline" className="btn-outline">
            Criar Conta
          </IonButton>

          <p className="social-text">Ou entre via</p>

          <div className="social-container">
            <div className="social-btn google">
              G
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default InicialPage;