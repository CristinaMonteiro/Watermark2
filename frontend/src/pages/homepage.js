import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./homepage.css";

const tools = [
  {
    title: "Inserir marca d'água",
    description: "Carregue ficheiros e insira uma marca d'água.",
    icon: "/qr-code-scan.png",
    link: "/upload",
  },
  {
    title: "Verificar marca d'água",
    description: "Carregue ficheiros e verifique se têm marca d'água.",
    icon: "/search.png",
    link: "/verify",
  },
];

const Homepage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      navigate("/"); // Redireciona para login se não houver token
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("nif");
    navigate("/");
  };

  return (
    <div>
      <div className="header">
        <div className="logo">
          <img src="logo-transparent.png" alt="logotipo" className="logo-img" onClick={() => navigate('/homepage')} style={{ cursor: 'pointer' }}/>
        </div>
          <button
          className="logout-button-upload" onClick={handleLogout}
          /*onClick={() => {
            sessionStorage.removeItem("nif");
            window.location.href = "/";
          }}*/
        >
          Sair
        </button>
      </div>
    
      <div className="homepage-wrapper">
      <h1 className="homepage-title">Ferramentas</h1>
      <p className="homepage-subtitle">
        Utilize ferramentas simples para inserir ou verificar marcas d'água em documentos PDF.
      </p>

      <div className="tools-grid">
        {tools.map((tool, index) => (
          <div className="tool-card" key={index}>
            <a href={tool.link} title={tool.title}>
              <div className="tool-icon">
                <img src={tool.icon} alt="Ícone" />
              </div>
              <h2 className="tool-title">{tool.title}</h2>
              <p className="tool-description">{tool.description}</p>
            </a>
          </div>
        ))}
      </div>

    </div>
  </div>
  );
};

export default Homepage;
