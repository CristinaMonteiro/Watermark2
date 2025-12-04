import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { configurarAnimacoes } from "./animations.js";
import { Player } from "@lottiefiles/react-lottie-player";


const Login = () => {
  //login
  const [nif, setNif] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  
  //register
  const [signUpNif, setSignUpNif] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [message, setMessage] = useState('');

  //to show/hide password
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    configurarAnimacoes(); // Chama a função de configuração de animações, com as animações dos circulos
    
    const token = sessionStorage.getItem("access_token");
    if(token){
      navigate("/homepage");
    }
  }, [navigate]);

  const handleSubmitLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nif, password }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("nif", nif);
        sessionStorage.setItem("token_user", data.token_user);
        navigate("/homepage");
      } else {
        setError(data.error || "Erro no login");
      }
    } catch (err) {
      setError("Erro na comunicação com o servidor");
    }
    
  };

  //para garantir que a palavra passe inserida pelo user é forte, chamado no função seguinte
  const isStrongPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmitRegister = async (e) => {
   e.preventDefault();

    if (!isStrongPassword(signUpPassword)) {
      setMessage("A password deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos.");
      return;
    }

    const data = { 
      nif: signUpNif,
      email: signUpEmail,
      password: signUpPassword,
    };

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        setTimeout(() => {
        document.getElementById("sign-in-btn").click(); // redireciona para a página de login apos criar conta com sucesso
      }, 1000);
      } else {
        setMessage(result.error || 'Erro no registo');
      }
    } catch (error) {
      setMessage('Erro na comunicação com o servidor');
      console.error(error);
    }
  };

  //para ir para o menu de recuperação de palavra passe
  const handleMenuRecuperarPass = () => {
    navigate("/recover-password");
  }

  //ocultar/mostrar palavra passe
  const handleShowPassword = () => {
    setShowPassword((prev) => !prev); 
  };


  return (
    <div className="container">
		<div className="forms-container">
			<div className="signin-signup">
				<form className="sign-in-form" onSubmit={handleSubmitLogin}>
					<h2 className="title">Login</h2>
					<div className="input-field">
						<i className="fas fa-user"></i>
						<input type="text" placeholder="NIF" value={nif} onChange={(e) => setNif(e.target.value.replace(/\D/g, "").slice(0,9))} required/>
					</div>
					<div className="input-field">
						<i className="fas fa-lock"></i>
						<input
              type={showPassword ? "text" : "password"}
              placeholder="Palavra-Passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={showPassword ? "eye.png" : "eye-slash.png"}
              alt={showPassword ? "Ocultar Palavra-Passe" : "Mostrar Palavra-Passe"}
              className="eye-icon"
              onClick={handleShowPassword}
              style={{ cursor: "pointer" }}
            />


					</div>
					<input type="submit" value="Login" className="btn solid" />
            <p className="message-text ps">
              <p onClick={handleMenuRecuperarPass} className="forgot-password">
                Esqueceu-se da palavra-passe?
              </p>
            </p>
          
          {error && <p className="messageError">{error}</p>}

					<p className="message-text">Ou faça a sua autenticação com Cartão Cidadão ou Chave Móvel Digital</p>
					<div className="gov-class">
            <button className="btnGov solid" onClick={() => window.location.href = 'https://www.autenticacao.gov.pt/'}>AUTENTICAÇÃO.GOV.PT</button>
					</div>
				</form>

        
				<form className="sign-up-form" onSubmit={handleSubmitRegister}>
					<h2 className="title">Criar Nova Conta</h2>
					<div className="input-field">
						<i className="fas fa-user"></i>
						<input type="text" placeholder="NIF" value={signUpNif} onChange={(e) => setSignUpNif(e.target.value.replace(/\D/g, "").slice(0,9))} required/>
					</div>
					<div className="input-field">
						<i className="fas fa-envelope"></i>
						<input type="email" placeholder="Email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required/>
					</div>
					<div className="input-field">
						<i className="fas fa-lock"></i>
						<input
              type={showPassword ? "text" : "password"}
              placeholder="Palavra-Passe"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
            />
            <img
              src={showPassword ? "eye-slash.png" : "eye.png"}
              alt={showPassword ? "Ocultar Palavra-Passe" : "Mostrar Palavra-Passe"}
              className="eye-icon"
              onClick={handleShowPassword}
              style={{ cursor: "pointer" }}
            />
          
          </div>
					<input type="submit" className="btn" value="Registar" />
          

          {error && <p className="messageError">{error}</p>}


					<p className="social-text">Ou se tem Cartão de Cidadão com códigos de autenticação ou Chave Móvel Digital</p>
					<div className="gov-class">
            <button className="btnGov solid" onClick={() => window.location.href = 'https://www.autenticacao.gov.pt/'}>AUTENTICAÇÃO.GOV.PT</button>
					</div> 
				</form>
			</div>
		</div>

		<div className="panels-container">
			<div className="panel left-panel">
				<div className="content">
					<h3>Novo aqui ?</h3>
					<p>
						Registe-se para poder aplicar marca d'água nos seus
            documentos
					</p>
					<button className="btn transparent-btn" id="sign-up-btn">
						Criar conta
					</button>
				</div>

        {/* CASO O SITE FIQUE LENTO VOU USAR ESTA IMAGEM EM VEZ DA ANIMAÇÃO*/}
        <img  src="imgLogin2.png" className="image" alt="" />
        {/*}
         <Player
          src="
          https://lottie.host/0720232e-dcf7-4ac9-b40d-e735c5fae87f/ZQioofFyw9.json"
          loop
          autoplay
          className="image"
          style={{ 
            height: '600px',
            width: '600px',
            transition: 'transform 0.9s ease-in-out',
            transitionDelay: '0.6s' 
          }}
        />*/}

			</div>
			<div className="panel right-panel">
				<div className="content">
					<h3>Já tem conta?</h3>
					<p>
						Faça login para aceder à sua conta e aplicar marca d'água nos seus
            documentos
					</p>
					<button className="btn transparent-btn" id="sign-in-btn">
						Login
					</button>
				</div>
          <img  src="imgLogin.png" className="image" alt="" />
			</div>
		</div>
	</div>

	
  );
};

export default Login;
