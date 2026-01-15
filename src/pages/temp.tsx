import React from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonItem
} from "@ionic/react";
import "./publics_pages/temp.css";

const Temp: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen className="login-content" scrollY={false}>
        <div className="page">

          {/* LOGO */}
          <div className="logo">Logo</div>

          {/* TÍTULO */}
          <h1 className="title">Welcome Back!</h1>

          {/* INPUTS */}
          <div className="inputs">
            <IonItem lines="none" className="input-line">
              <IonInput
                label="Username"
                labelPlacement="floating"
                value="Jhondoe"
              />
            </IonItem>

            <IonItem lines="none" className="input-line">
              <IonInput
                type="password"
                label="Password"
                labelPlacement="floating"
                placeholder="********"
              />
            </IonItem>
          </div>

          {/* BOTÃO */}
          <IonButton className="login-btn">
            Login Now
          </IonButton>

          {/* FORGOT */}
          <div className="forgot">
            Forgot Password ?
          </div>

          {/* RODAPÉ */}
          <div className="signup">
            Don’t have an account? <span>Sign Up</span>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Temp;
