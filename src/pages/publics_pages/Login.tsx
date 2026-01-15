import React, { useState } from "react";
import { IonPage, IonContent, IonInput, IonButton, IonItem} from "@ionic/react";
import { useAuth } from "../../AuthContext";
import authApi from "../../hooks/authApi";
import { useHistory } from "react-router-dom";
import '../StylesPages.css';

const Login: React.FC = () => {
  const { user, Login } = useAuth();
  const { login } = authApi(user, Login);
  const history = useHistory();
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  const goTo = (path: string) => {
    history.push(path);
  };

  const handleChange = (field: "email" | "password", value: string | null | undefined) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value || "",
    }));
  };

  const handleLogin = async () => {
    const result = await login(credentials);

    if (result.success && result.data.token) {
      goTo('/')
    } else {
      console.error(result.error);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="content" scrollY={false}>
        <div className="page">

          <div className="logo">Logo</div>
          <h1 className="title">Bem Vindo de Volta!</h1>

          <div className="inputs">
            <IonItem lines="none" className="input-line">
              <IonInput 
                label="Email" 
                labelPlacement="floating" 
                fill="solid" 
                value={credentials.email}
                onIonInput={(e) => handleChange('email', e.detail.value)}
              />
            </IonItem>
            <IonItem lines="none" className="input-line">
              <IonInput
                type="password" 
                label="Password"
                labelPlacement="floating"
                placeholder="********" 
                fill="solid" 
                value={credentials.password}
                onIonInput={(e) => handleChange('password', e.detail.value)}
              />
            </IonItem>
          </div>
          <IonButton className="btn" onClick={handleLogin}>
            Entrar
          </IonButton>
          <div className="forgot">
            Esqueçeu a palavra-passe?
          </div>
          <div className="signup">
            Não tens conta? <span>Criar agora</span>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;