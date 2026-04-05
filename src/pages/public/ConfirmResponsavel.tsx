import { useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import authApi from "../../hooks/authApi";
import { useAuth } from "../../AuthContext";

const ConfirmResponsavel = () => {
  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token");
  const history = useHistory();
  const { Login } = useAuth();
  const { confirmResponsavelInvite } = authApi(Login);

  useEffect(() => {
    const confirm = async () => {
      try {
        const res = await confirmResponsavelInvite(token || "");
        const { responsavelId } = res.data;

        // Fica salvado temporariamente
        localStorage.setItem("responsavelId", responsavelId);

        alert("Convite aceito com sucesso!");
        history.push("/signup");
      } catch {
        alert("Convite inválido ou expirado");
      }
    };

    if (token) confirm();
  }, [token]);

  return null;
};

export default ConfirmResponsavel;