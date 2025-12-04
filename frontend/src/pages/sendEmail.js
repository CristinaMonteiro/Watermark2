import React, { useState } from "react";
import "./sendEmail.css";

const RecoverPasswordSendEmail = () => {
  const [nif, setNif] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:5000/send_mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nif }) // envia o NIF para o backend
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Foi enviado um email para redefinir a sua palavra-passe.");
      } else {
        setError(data.error || "Erro ao enviar email.");
      }
    } catch (err) {
      setError("Erro na comunicação com o servidor.");
    }
  };

  return (
    <div className="container-recover-nif">
      <div className="card-recover-nif">
        <h2>Recuperar Palavra-Passe</h2>
        <p>Insira o seu NIF para receber um email com instruções sobre como redefinir a sua palavra-passe.</p>
        <br></br>
        <form onSubmit={handleSubmit} className="form-recover-nif">
          <input
            type="text"
            placeholder="NIF"
            value={nif}
            onChange={(e) => setNif(e.target.value)}
            className="recover-nif-input"
            required
          />

          <button type="submit" className="btn solid">
            Enviar Email
          </button>

					<p>Ou faça a recuperação com Cartão Cidadão ou Chave Móvel Digital</p>
					<div className="gov-class">
            <button className="btnGov solid" onClick={() => window.location.href = 'https://www.autenticacao.gov.pt/'}>AUTENTICAÇÃO.GOV.PT</button>
					</div>

        </form>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default RecoverPasswordSendEmail;
