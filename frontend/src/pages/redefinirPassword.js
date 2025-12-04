import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./redefinirPassword.css";

const RedefinePassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false); //para mostrar "palavra passe"
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); //para mostrar "confirmar palavra passe"
    const [startedConfirmPassword, setStartedConfirmPassword] = useState(false); //para identificar quando o user começa a escrever no campo "Confirmar Palavra-Passe" e fazer desaparecer o "password check"


    const navigate = useNavigate();
    const location = useLocation(); //ALTERAçÃO 
    const queryParams = new URLSearchParams(location.search);  //ALTERAçÃO 
    const token = queryParams.get("token"); // 🔐 token da URL  //ALTERAçÃO 

  //para ir buscar o email do user e apresentar na pagina
  useEffect(() => {
    if (!token) {
      navigate("/404");
      return;
    }
  

    fetch("http://localhost:5000/user-data", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, 
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.email) setUserEmail(data.email);
      })
      .catch((err) => console.error("Erro:", err));
  }, [token]);

  const isStrongPassword = (password) => {
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isValid = hasLength && hasUppercase && hasNumber && hasSpecial;

    let strength = 0;
    if (hasLength) strength++;
    if (hasUppercase) strength++;
    if (hasNumber) strength++;
    if (hasSpecial) strength++;

    let strengthClass = "";
    let strengthText = "";
    let strengthColor = "#aaa";

    if (password.length > 0) {
      switch (strength) {
        case 1:
          strengthClass = "weak";
          strengthText = "Palavra-Passe Fraca";
          strengthColor = "#ff3e3e";
          break;
        case 2:
          strengthClass = "medium";
          strengthText = "Palavra-Passe Média";
          strengthColor = "#ffb83e";
          break;
        case 3:
        case 4:
          strengthClass = "strong";
          strengthText = "Palavra-Passe Forte";
          strengthColor = "#3eff8f";
          break;
        default:
          strengthClass = "weak";
          strengthText = "Palavra-Passe Muito Fraca";
          strengthColor = "#ff3e3e";
      }
    }
      return  {
        isValid,
        hasLength,
        hasUppercase,
        hasNumber,
        hasSpecial,
        strengthClass,
        strengthText,
        strengthColor,
      };
  };
    const {
      isValid,
      hasLength,
      hasUppercase,
      hasNumber,
      hasSpecial,
      strengthClass,
      strengthText,
      strengthColor,
    } = isStrongPassword(newPassword);


  const handleSubmit = async (e) => {
    
        e.preventDefault();
        setError("");
        setSuccessMessage("");
    if (!isValid) {
      setError("A password deve ter no mínimo 8 caracteres, incluindo maiúsculas, números e símbolos.");
      return;
  }

    if (newPassword !== confirmPassword) {
      setError("As passwords não coincidem.");
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setError(
        "A password deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos."
      );
      return;
    }

    if (!token){
      setError("Token invalido ou ausente"); //ALTERAçÃO
      return;
    }

    try {
      // Exemplo: envia só a nova password (no backend deve obter quem é o user via token de recuperação)
      const response = await fetch("http://localhost:5000/reset_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          "Palavra-passe alterada com sucesso! A ser redirecionado para login..."
        );
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setError(data.error || "Erro ao alterar a palavra-passe.");
      }
    } catch (err) {
      setError("Erro na comunicação com o servidor.");
    }
  };

  //ocultar-mostrar nova palavra passe
  const handleShowPassword = () => {
    setShowPassword((prev) => !prev); 
  };

  //ocultar-mostrar confirmar palavra passe
  const handleShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };


 
  return (
        <div className="container-redefine-password">
          <div className="card-redefine-password">
                <h2>Redefinir Palavra-Passe</h2>
                <br></br>
                <p>Introduza a nova palavra-passe 
                {userEmail ? ` ${userEmail}`: " (a carregar email)"}</p>
                
                <form onSubmit={handleSubmit} className="form-redefine-password">
                  <div className="nova-pass">
                    <i className="fas fa-user"></i>

                    <input
                      type={showPassword ? "text":"password"}
                      placeholder="Nova Palavra-Passe"
                      value={newPassword}
                      className="redefine-password-input"
                      required
                      onChange={(e) => {setNewPassword(e.target.value);
                      if(e.target.value === ""){
                        setStartedConfirmPassword(false);
                      }
                    }}
                      
                      />
                      <img
                      src={showPassword ? "eye.png" : "eye-slash.png"}
                      alt={showPassword ? "Ocultar Palavra-Passe" : "Mostrar Palavra-Passe"}
                      className="eye-icon"
                      onClick={handleShowPassword}
                      style={{ cursor: "pointer" }}
                      />
                  </div>
                      
                  {/*so mostra este campo quando os criterios da pass forem cumpridos*/}
                  {hasLength && hasUppercase && hasNumber && hasSpecial && (

                    <div className="confirmar-pass">
                      <i className="fas fa-user"></i>
                      <input
                      type={showConfirmPassword ? "text":"password"}
                      placeholder="Confirmar Palavra-Passe"
                      value={confirmPassword}
                      className="redefine-password-input"
                      required
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if(e.target.value.length > 0){
                          setStartedConfirmPassword(true);
                        } else{
                          setStartedConfirmPassword(false);
                        }
                      }}
                      
                      />

                      <img
                        src={showConfirmPassword ? "eye.png" : "eye-slash.png"}
                        alt={showConfirmPassword ? "Ocultar Palavra-Passe" : "Mostrar Palavra-Passe"}
                        className="eye-icon"
                        onClick={handleShowConfirmPassword}
                        style={{ cursor: "pointer" }}
                      />

                    </div>
                  )}

                  {/*so mostra este campo enquanto os criterios da pass não forem cumpridos*/}
                  {(!startedConfirmPassword || !(hasLength && hasUppercase && hasNumber && hasSpecial)) && (

                    <div className="password-strength">
                      <br></br><br></br>
                      <h2>Critérios Palavra-Passe</h2>
                      <div className={`meter-bar ${strengthClass}`}></div>
                      <p className="strength-text" style={{ color: strengthColor }}>{strengthText}</p>

                      <ul className="requirements">
                        <li className={hasLength ? "valid" : ""}>Pelo menos 8 caracteres</li>
                        <li className={hasUppercase ? "valid" : ""}>Conter uma ou mais letras maiúsculas</li>
                        <li className={hasNumber ? "valid" : ""}>Conter um ou mais números</li>
                        <li className={hasSpecial ? "valid" : ""}>Conter caracteres especiais</li>
                      </ul>
                    </div>
                  )}
                    
                      <button type="submit" className="btn solid">
                      Redefinir Palavra-passe
                      </button>
                </form>
                {error && <p className="error-message">{error}</p>}
                {successMessage && (
                    <p className="success-message">{successMessage}</p>
                )}
            </div>
        </div>
  );
};

export default RedefinePassword;