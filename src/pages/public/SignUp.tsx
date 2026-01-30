import React, { useEffect, useState } from "react";
import { IonPage, IonContent, IonInput, IonButton, IonItem, IonAlert, IonDatetime, IonLabel } from "@ionic/react";
import { useAuth } from "../../AuthContext";
import authApi from "../../hooks/authApi";
import { useHistory } from "react-router-dom";

type UserType = "athlete" | "responsavel" | "sensei";

const Signup: React.FC = () => {
  const { Login } = useAuth();
  const { signup, calculateAge } = authApi(Login);
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

  const [cre_responsavel, setCre_Responsavel] = useState({
    username: "",
    email: "",
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

  const handleChangeR = (field: keyof typeof cre_responsavel, value: string | null | undefined) => {
    setCre_Responsavel(prev => ({
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

  const calculate_age = async () => {
    const res = await calculateAge(credentials.birthDate);

    if (res.data < 13) {
      alert('Atletas com menos de 13 anos devem ser cadastrados por um responsável.')
      setStep(1)
    } else if (res.data < 18) {
      setStep(3) 
    } else {
      setStep(4)
    }
  };

  const sendEmailForR = async () => {
    const res = await signup(credentials);

    if (res) {
      setShowAlert(true);
      setTimeout(() => history.push("/login"), 7000);
    } else {
      setPendingError("Erro ao registrar");
    }
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
      <IonContent fullscreen className="content">

        <IonAlert
          isOpen={showAlert}
          header="Confirme o seu email"
          message="Registro realizado com sucesso! Verifique sua caixa de entrada."
          buttons={["OK"]}
          onDidDismiss={() => setShowAlert(false)}
        />

        <div className="login-container">

          {/* STEP 1 — Tipo */}
          {step === 1 && (
            <>
              <h1 className="title">Criar conta</h1>
              <p className="subtitle">Escolha o tipo de conta que deseja criar</p>

              <IonButton expand="block" onClick={() => {
                handleChange("type", "athlete");
                setStep(2);
              }} className="btn">
                Atleta
              </IonButton>

              <IonButton expand="block" onClick={() => {
                handleChange("type", "responsavel");
                setStep(4); //futuramente passar para etapa dois
              }} className="btn-outline">
                Responsável
              </IonButton>

              <IonButton expand="block" onClick={() => {
                handleChange("type", "sensei");
                setStep(2);
              }} className="btn-outline">
                Sensei
              </IonButton>
            </>
          )}

          {/* STEP 2 — Atleta */}
          {step === 2 && credentials.type === "athlete" && (
            <>
              <h1 className="title">Dados do atleta</h1>

              <div className="inputs">
                <IonItem className="input-line">
                  <IonLabel>Data de nascimento</IonLabel>
                  <IonDatetime
                    presentation="date"
                    onIonChange={e =>
                      handleChange(
                        "birthDate",
                        typeof e.detail.value === "string" ? e.detail.value : ""
                      )
                    }
                  />
                </IonItem>
              </div>

              <IonButton expand="block" className="btn" onClick={() => calculate_age()}>
                Próximo
              </IonButton>
            </>
          )}

          {/* STEP 2 — Sensei */}
          {step === 2 && credentials.type === "sensei" && (
            <>
              <h1 className="title">Dados do sensei</h1>

              <IonButton expand="block" onClick={() => { setStep(3); }} className="btn-outline">
                Criar Dojo Agora
              </IonButton>

              <IonButton expand="block" className="btn" onClick={() => setStep(4)}>
                fazer mais tarde
              </IonButton>
            </>
          )}

          {/* STEP 2 — Responsavel */}
          {step === 2 && credentials.type === "responsavel" && (
            <>
              <h1 className="title">Dados do responsavel</h1>

              <IonItem className="input-line">
                <label>Quantos são para inscrever?</label>
                <IonInput
                  type="number"
                />
              </IonItem>

              {/* Campos para cada criança com username e seu aniversarios */}

              <IonButton expand="block" className="btn" onClick={() => setStep(3)}>
                Próximo
              </IonButton>
            </>
          )}

          {/* STEP 3 — Atleta */}
          {step === 3 && credentials.type === "athlete" && (
            <>
              <h1 className="title">Dados do Atleta</h1>
              <p>Adicione as informações do teu responsavel em baixo:</p>

              <IonItem className="input-line">
                <IonInput
                  label="Username"
                  labelPlacement="floating"
                  value={cre_responsavel.username}
                  onIonInput={e => handleChangeR("username", e.detail.value)}
                />
              </IonItem>
              <IonItem className="input-line">
                <IonInput
                  type="email"
                  label="Email"
                  labelPlacement="floating"
                  value={cre_responsavel.email}
                  onIonInput={e => handleChangeR("email", e.detail.value)}
                />
              </IonItem>

              <IonButton expand="block" className="btn" onClick={() => setStep(3)}>
                Próximo
              </IonButton>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="title">Convite para entrar no Dojo</h1>

              {/* Aqui onde tera a mostra os dojos existentes 
                que depois dara para fazer pedido */}

              <IonButton expand="block" className="btn" onClick={() => setStep(4)}>
                fazer mais tarde
              </IonButton>
            </>
          )}

          {/* STEP 4 - Informações Finais*/}
          {step === 4 && (
            <>
              <h1 className="title">Criar conta</h1>

              <div className="inputs">
                <IonItem className="input-line">
                  <IonInput
                    label="Username"
                    labelPlacement="floating"
                    value={credentials.username}
                    onIonInput={e => handleChange("username", e.detail.value)}
                  />
                </IonItem>

                <IonItem className="input-line">
                  <IonInput
                    type="email"
                    label="Email"
                    labelPlacement="floating"
                    value={credentials.email}
                    onIonInput={e => handleChange("email", e.detail.value)}
                  />
                </IonItem>

                <IonItem className="input-line">
                  <IonInput
                    type="password"
                    label="Senha"
                    labelPlacement="floating"
                    value={credentials.password}
                    onIonInput={e => handleChange("password", e.detail.value)}
                  />
                </IonItem>
              </div>

              <IonButton expand="block" className="btn" onClick={handleSignup}>
                Registrar
              </IonButton>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Signup;