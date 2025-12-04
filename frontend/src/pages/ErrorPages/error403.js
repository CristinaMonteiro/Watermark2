import React from "react";
import { useNavigate } from "react-router-dom";

const Error403 = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>403</h1>
      <p style={styles.message}>Acesso proibido</p>
      <button style={styles.button} onClick={() => navigate("/")}>
        Voltar para o login
      </button>
    </div>
  );
};


const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "20px",
  },
  title: {
    fontSize: "8rem",
    margin: 0,
    color: "#e74c3c",
  },
  message: {
    fontSize: "1.5rem",
    marginBottom: "2rem",
    color: "#333",
  },
  button: {
    padding: "12px 24px",
    fontSize: "1rem",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

export default Error403;
