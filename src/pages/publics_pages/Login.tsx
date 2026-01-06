import React, { useEffect, useState } from "react";
import { IonPage, IonContent, IonInput, IonButton, IonItem} from "@ionic/react";
import { useAuth } from "../../AuthContext";
// import authApi from "../../hooks/authApi";
import { useHistory } from "react-router-dom";

const Login: React.FC = () => {
  const { user, Login } = useAuth();
  // const { login } = authApi(user, Login);
  const history = useHistory();
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });

  const handleChange = (field: "username" | "password", value: string | null | undefined) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value || "",
    }));
  };

  // const handleLogin = async () => {
  //   const result = await login(credentials);

  //   if (result.success && result.data.token) {
  //     history.push("/home");
  //   } else {
  //     console.error('Erro ao fazer login');
  //   }
  // };

  const goTo = (path: string) => {
    history.push(path);
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
              label="Username" 
              labelPlacement="floating" 
              fill="solid" 
              value={credentials.username}
              onIonInput={(e) => handleChange('username', e.detail.value)}
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
          <IonButton>
            Entrar
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;