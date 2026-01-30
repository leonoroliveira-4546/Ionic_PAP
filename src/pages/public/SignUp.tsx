import React, { useEffect, useState } from "react";
import { IonPage, IonContent, IonInput, IonButton, IonItem, IonAlert, IonDatetime, IonLabel } from "@ionic/react";
import { useAuth } from "../../AuthContext";
import authApi from "../../hooks/authApi";
import { useHistory } from "react-router-dom";

type UserType = "athlete" | "responsavel" | "sensei";

const Signup: React.FC = () => {
  const { Login } = useAuth();
  const { signup } = authApi(Login);
  const history = useHistory();

  const [step, setStep] = useState(1);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const [credentials, setCredentials] = useState({
    type: "" as UserType,
    username: "",
    email: "",
    password: "",
    birthDate: "",
    dojoId: "",
    responsavelId: ""
  });

  useEffect(() => {
    if (pendingError) {
      setTimeout(() => {
        alert(pendingError);0
        setPendingError(null);
      }, 50);
    }
  }, [pendingError]);

  const handleChange = (field: keyof typeof credentials, value: string | null | undefined) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value || ""
    }));
  };

  const validateCommon = () => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!emailRegex.test(credentials.email)) {
      alert("Por favor, insira um email válido.");
      return false;
    }

    if (credentials.password.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres.");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateCommon()) return;

    const res = await signup(credentials);

    if (res) {
      setShowAlert(true);
      setTimeout(() => history.push("/login"), 7000);
    } else {
      setPendingError("Erro ao registrar");
    }
  };

  return (
    <IonPage className="signup-page">
      <IonContent fullscreen>

        <IonAlert
          isOpen={showAlert}
          header="Confirme o seu email"
          message="Registro realizado com sucesso! Verifique sua caixa de entrada."
          buttons={["OK"]}
          onDidDismiss={() => setShowAlert(false)}
        />

        <div className="signup-wrapper">
          <div className="login-container">

            {/* STEP 1 — Tipo */}
            {step === 1 && (
              <>
                <h2>Que tipo de conta você quer criar?</h2>

                <IonButton expand="block" onClick={() => {
                  handleChange("type", "athlete");
                  setStep(2);
                }}>
                  Atleta
                </IonButton>

                <IonButton expand="block" onClick={() => {
                  handleChange("type", "responsavel");
                  setStep(3);
                }}>
                  Responsável
                </IonButton>

                <IonButton expand="block" onClick={() => {
                  handleChange("type", "sensei");
                  setStep(2);
                }}>
                  Sensei
                </IonButton>
              </>
            )}

            {/* STEP 2 — Dados específicos */}
            {step === 2 && credentials.type === "athlete" && (
              <>
                <h2>Dados do Atleta</h2>

                <IonItem>
                  <IonLabel position="stacked">Data de nascimento</IonLabel>
                  <IonDatetime
                    presentation="date"
                    onIonChange={e =>
                      handleChange("birthDate", typeof e.detail.value === "string" ? e.detail.value : "")
                    }
                  />
                </IonItem>

                <IonItem>
                  <IonInput
                    label="Dojo ID (opcional)"
                    labelPlacement="floating"
                    value={credentials.dojoId}
                    onIonInput={e =>
                      handleChange("dojoId", e.detail.value)
                    }
                  />
                </IonItem>

                <IonItem>
                  <IonInput
                    label="Responsável (se menor)"
                    labelPlacement="floating"
                    value={credentials.responsavelId}
                    onIonInput={e =>
                      handleChange("responsavelId", e.detail.value)
                    }
                  />
                </IonItem>

                <IonButton expand="block" onClick={() => setStep(3)}>
                  Próximo
                </IonButton>
              </>
            )}

            {step === 2 && credentials.type === "sensei" && (
              <>
                <h2>Dados do Sensei</h2>

                <IonItem>
                  <IonInput
                    label="Dojo ID"
                    labelPlacement="floating"
                    value={credentials.dojoId}
                    onIonInput={e =>
                      handleChange("dojoId", e.detail.value)
                    }
                  />
                </IonItem>

                <IonButton expand="block" onClick={() => setStep(3)}>
                  Próximo
                </IonButton>
              </>
            )}

            {/* STEP 3 — Dados comuns */}
            {step === 3 && (
              <>
                <h2>Crie sua conta</h2>

                <IonItem>
                  <IonInput
                    label="Username"
                    labelPlacement="floating"
                    value={credentials.username}
                    onIonInput={e =>
                      handleChange("username", e.detail.value)
                    }
                  />
                </IonItem>

                <IonItem>
                  <IonInput
                    type="email"
                    label="Email"
                    labelPlacement="floating"
                    value={credentials.email}
                    onIonInput={e =>
                      handleChange("email", e.detail.value)
                    }
                  />
                </IonItem>

                <IonItem>
                  <IonInput
                    type="password"
                    label="Password"
                    labelPlacement="floating"
                    value={credentials.password}
                    onIonInput={e =>
                      handleChange("password", e.detail.value)
                    }
                  />
                </IonItem>

                <IonButton expand="block" onClick={handleSignup}>
                  Registrar
                </IonButton>
              </>
            )}

          </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Signup;