import React, { useState } from "react";
import { IonPage, IonContent, IonInput, IonButton, IonItem} from "@ionic/react";
import { useAuth } from "../../AuthContext";
import authApi from "../../hooks/authApi";
import { useHistory } from "react-router-dom";

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
      <IonContent>
        <div>
          <div>
            <h2>Bem Vindo de Volta!</h2>
          </div>
          <IonItem>
            <IonInput 
              label="Email" 
              labelPlacement="floating" 
              fill="solid" 
              value={credentials.email}
              onIonInput={(e) => handleChange('email', e.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonInput 
              label="Password" 
              labelPlacement="floating" 
              fill="solid" 
              value={credentials.password}
              onIonInput={(e) => handleChange('password', e.detail.value)}
            />
          </IonItem>
          <IonButton onClick={handleLogin}>
            Entrar
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;