import React, { useEffect, useState } from "react";
import { IonPage, IonContent, IonInput, IonButton, IonItem, IonAlert, IonDatetime, IonLabel } from "@ionic/react";
import { useAuth } from "../../AuthContext";
import authApi from "../../hooks/authApi";
import dojosApi from "../../hooks/dojosApi";
import { useHistory } from "react-router-dom";

type UserType = "athlete" | "responsavel" | "sensei";

const saveSignupDraft = (data: any) => {
  const { password, ...safeData } = data;
  const responsavelId = safeData.responsavelId || localStorage.getItem("responsavelId");
  localStorage.setItem("signupDraft", JSON.stringify({ ...safeData, responsavelId: responsavelId || "" }));
};

const Signup: React.FC = () => {
  const { Login } = useAuth();
  const { signup, calculateAge, inviteResponsavel } = authApi(Login);
  const { getDojos, createDojo, joinDojo } = dojosApi();
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
    responsavelId: "",
    userId: ""
  });

  const [cre_responsavel, setCre_Responsavel] = useState({
    username: "",
    email: "",
  });

  const [childrens, setChildrens] = useState([
    { username: "", birthDate: "" }
  ]);

  const [dojos, setDojos] = useState<any[]>([]);
  const [newDojo, setNewDojo] = useState({
    name: "",
    city: ""
  });

  useEffect(() => {
    if (pendingError) {
      setTimeout(() => {
        alert(pendingError);
        setPendingError(null);
      }, 50);
    }
  }, [pendingError]);

  useEffect(() => {
    const responsavelId = localStorage.getItem("responsavelId");

    if (responsavelId) {
      setCredentials(prev => ({
        ...prev,
        responsavelId
      }));

      setStep(5);
    }
  }, []);

  useEffect(() => {
    const fetchDojos = async () => {
      const res = await getDojos();
      if (res.success) {
        setDojos(res.dojos);
      }
    };

    fetchDojos();
  }, []);

  useEffect(() => {
    const draft = localStorage.getItem("signupDraft");

    if (draft) {
      const parsed = JSON.parse(draft);

      setCredentials(prev => ({
        ...prev,
        ...parsed
      }));
    }
  }, []);

  const handleChange = (field: keyof typeof credentials, value: string | null | undefined) => {
    setCredentials(prev => {
      const updated = { ...prev, [field]: value || "" };
      saveSignupDraft(updated);
      return updated;
    });
  };

  const handleChangeResponsavel = (field: keyof typeof cre_responsavel, value: string | null | undefined) => {
    setCre_Responsavel(prev => ({
      ...prev,
      [field]: value || ""
    }));
  };

  const handleChildrenChange = (index: number, field: string, value: string) => {
    const updated = [...childrens];
    updated[index] = { ...updated[index], [field]: value };
    setChildrens(updated);
  };

  const addChild = () => {
    setChildrens([...childrens, { username: "", birthDate: "" }]);
  };

  const removeChild = (index: number) => {
    if (childrens.length === 1) {
      alert("Deve haver pelo menos um filho");
      return;
    }
    setChildrens(childrens.filter((_, i) => i !== index));
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

  const validateChildren = () => {
    for (let i = 0; i < childrens.length; i++) {
      const child = childrens[i];

      if (!child.username.trim()) {
        alert(`Filho ${i + 1}: nome é obrigatório`);
        return false;
      }

      if (!child.birthDate) {
        alert(`Filho ${i + 1}: data de nascimento é obrigatória`);
        return false;
      }

      const birth = new Date(child.birthDate);
      const today = new Date();

      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      if (age >= 18) {
        alert(`Filho ${i + 1}: deve ser menor de 18 anos`);
        return false;
      }
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

  const handleSignup = async () => {
    if (!validateCommon()) return;
    if (credentials.type === 'responsavel') {
      if (!validateChildren()) return;
    }

    const finalPayload = {
      ...credentials,
      responsavelId:
        credentials.responsavelId || localStorage.getItem("responsavelId") || '',
      childrens:
        credentials.type === 'responsavel' ? childrens : []
    };

    const res = await signup(finalPayload);

    if (res.success) {
      const userId = res.user._id;

      if (res.user.type === "sensei" && newDojo.name) {
        const dojoRes = await createDojo({
          name: newDojo.name,
          city: newDojo.city,
          userId
        });

        if (dojoRes.success) {
          alert("Dojo criado!");
        } else {
          alert("Erro ao criar dojo");
        }
      }

      if (credentials.dojoId) {
        await joinDojo(credentials.dojoId, userId);
      }

      setShowAlert(true);

      localStorage.removeItem("signupDraft");
      localStorage.removeItem("responsavelId");

      setTimeout(() => history.push("/login"), 5000);
    }
  };

  const handleJoinDojo = async (dojoId: string) => {
    setCredentials(prev => ({
      ...prev,
      dojoId
    }));

    setStep(5);
  };

  const sendInviteToResponsavel = async () => {
    if (!cre_responsavel.email) {
      alert("Informe o email do responsável");
      return;
    }

    try {
      await inviteResponsavel(
        cre_responsavel.email,
        credentials.username
      );

      alert("Convite enviado ao responsável. Aguarde a confirmação.");
      setStep(99);
    } catch (err) {
      setPendingError("Erro ao enviar convite");
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
                setStep(2);
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
              <h2>Educantes</h2>

              {childrens.map((child, index) => (
                <div key={index}>
                  <IonItem>
                    <IonInput
                      placeholder="Nome"
                      value={child.username}
                      onIonInput={e =>
                        handleChildrenChange(index, "username", e.detail.value!)
                      }
                    />
                  </IonItem>

                  <IonItem>
                    <IonDatetime
                      presentation="date"
                      onIonChange={e =>
                        handleChildrenChange(
                          index,
                          "birthDate",
                          e.detail.value as string
                        )
                      }
                    />
                  </IonItem>

                  <IonButton color="danger" onClick={() => removeChild(index)}>
                    Remover
                  </IonButton>
                </div>
              ))}

              <IonButton onClick={addChild}>
                + Adicionar educante
              </IonButton>
              <IonButton onClick={() => { if (!validateChildren()) return; setStep(4) }}>
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
                  onIonInput={e => handleChangeResponsavel("username", e.detail.value)}
                />
              </IonItem>
              <IonItem className="input-line">
                <IonInput
                  type="email"
                  label="Email"
                  labelPlacement="floating"
                  value={cre_responsavel.email}
                  onIonInput={e => handleChangeResponsavel("email", e.detail.value)}
                />
              </IonItem>

              <IonButton expand="block" className="btn" onClick={sendInviteToResponsavel}>
                Enviar convite ao responsável
              </IonButton>
            </>
          )}

          {step === 3 && credentials.type === "sensei" && (
            <>
              <h1 className="title">Criação do Dojo</h1>
              <p>Adicione as informações do teu responsavel em baixo:</p>

              <IonItem>
                <IonInput
                  placeholder="Nome do Dojo"
                  value={newDojo.name}
                  onIonInput={(e) =>
                    setNewDojo({ ...newDojo, name: e.detail.value! })
                  }
                />
              </IonItem>
              <IonItem>
                <IonInput
                  placeholder="Cidade"
                  value={newDojo.city}
                  onIonInput={(e) =>
                    setNewDojo({ ...newDojo, city: e.detail.value! })
                  }
                />
              </IonItem>

              <IonButton expand="block" onClick={() => {
                if (!newDojo.name || !newDojo.city) {
                  alert("Preenche os dados do dojo");
                  return;
                }
                setStep(5);
              }}>
                Criar Dojo
              </IonButton>
              <IonButton expand="block" fill="outline" onClick={() => setStep(5)}>
                Fazer mais tarde
              </IonButton>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="title">Convite para entrar no Dojo</h1>

              {dojos.map((dojo) => (
                <IonButton
                  key={dojo._id}
                  expand="block"
                  onClick={() => handleJoinDojo(dojo._id)}
                >
                  {dojo.name} - {dojo.city}
                </IonButton>
              ))}

              <IonButton expand="block" className="btn" onClick={() => setStep(5)}>
                fazer mais tarde
              </IonButton>
            </>
          )}

          {/* STEP 5 - Informações Finais*/}
          {step === 5 && (
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

          {step === 99 && (
            <>
              <h1 className="title">Aguardando responsável</h1>
              <p>
                Um convite foi enviado para <b>{cre_responsavel.email}</b>.
                <br />
                Assim que ele aceitar, você poderá continuar o cadastro.
              </p>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Signup;