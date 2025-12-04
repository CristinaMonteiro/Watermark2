import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { configurarAnimacoesUpload } from "./animations.js";
import "./upload.css"; 
import { Player } from "@lottiefiles/react-lottie-player";


const VerifyDocument = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [resultsSecret, setResultsSecret] = useState([]); //variavel para guardar resultados do segredo, inicializada como array vazio
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const validFormats = ["image/jpeg", "image/png", "image/bmp"];
  const maxWidth = 2048;
  const maxHeight = 2048;

  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      navigate("/");
    } else {
      configurarAnimacoesUpload();
    }
  }, [navigate]);

  const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Adicionei esta linha para imprimir a string Base64 da imagem inserida no console
      console.log("Imagem em Base64:", reader.result);
      
      // O resto do código continua igual
      resolve(reader.result.split(',')[1]); // remove header
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

  const logImageAction = async ({ action, fileName, status, message }) => {
    try {
      const nif = sessionStorage.getItem("nif");
      if (!nif) {
        console.warn("NIF não encontrado na sessão.");
        return;
      }

      await fetch("http://localhost:5000/log-image-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("access_token")}`
        },
        body: JSON.stringify({
          nif,
          action,
          fileName,
          status,
          message,
        }),
      });
    } catch (err) {
      console.error("Erro ao registar log:", err);
    }
  };

  const handleFileChange = (e) => {
    setError(null);
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    let pendingValidations = newFiles.length;
    const validNewFiles = [];

    newFiles.forEach((file) => {
      if (!validFormats.includes(file.type)) {
        const msg = `Formato inválido (${file.name}). Só JPG, PNG e BMP são permitidos.`;
        setError(msg);
        logImageAction({
          action: "Upload",
          fileName: file.name,
          status: "Erro",
          message: msg,
        });
        pendingValidations--;
        if (pendingValidations === 0)
          setSelectedFiles((prev) => [...prev, ...validNewFiles]);
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (img.width > maxWidth || img.height > maxHeight) {
          const msg = `Imagem ${file.name} excede ${maxWidth}x${maxHeight} px.`;
          setError(msg);
          logImageAction({
            action: "Upload",
            fileName: file.name,
            status: "Erro",
            message: msg,
          });
        } else {
          validNewFiles.push(file);
          logImageAction({
            action: "Upload",
            fileName: file.name,
            status: "Sucesso",
            message: "Imagem validada e adicionada.",
          });
        }
        pendingValidations--;
        if (pendingValidations === 0)
          setSelectedFiles((prev) => [...prev, ...validNewFiles]);
      };
      img.onerror = () => {
        const msg = `Erro ao carregar imagem ${file.name}.`;
        setError(msg);
        logImageAction({
          action: "Upload",
          fileName: file.name,
          status: "Erro",
          message: msg,
        });
        pendingValidations--;
        if (pendingValidations === 0)
          setSelectedFiles((prev) => [...prev, ...validNewFiles]);
      };
      img.src = URL.createObjectURL(file);
    });

    if (inputRef.current) {
      inputRef.current.value = null;
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const file = selectedFiles[indexToRemove];
    logImageAction({
      action: "Remoção",
      fileName: file.name,
      status: "Sucesso",
      message: "Imagem removida pelo utilizador.",
    });

    setSelectedFiles((prev) =>
      prev.filter((_, idx) => idx !== indexToRemove)
    );
  };

  //verifica se tem marca d'água e se sim, qual é o segredo
   const handleVerifyWatermark = async () => {
    if (selectedFiles.length === 0) {
      setError("Selecione pelo menos uma imagem.");
      return;
    }

    setLoading(true); // Inicia o loading
    setError(null);
    setResultsSecret([]);

    const token = sessionStorage.getItem("access_token");

    for (const file of selectedFiles) {
      try {
        const base64 = await fileToBase64(file);

        const response = await fetch("http://localhost:5000/verify-torchserve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: base64 }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Erro ao verificar imagem");
        }

        setResultsSecret((prev) => [
          ...prev,
          {
            fileName: file.name,
            hasSecret: result.has_secret,
            secret: result.secret || null,
            owner:result.owner || null
          },
        ]);

        logImageAction({
          action: "Verificação",
          fileName: file.name,
          status: "Sucesso",
          message: result.has_secret
            ? `Segredo encontrado: ${result.secret}`
            : "Sem segredo encontrado",
        });
      } catch (err) {
        console.error("Erro na verificação:", err);
        setError("Erro ao verificar algumas imagens.");
        logImageAction({
          action: "Verificação",
          fileName: file.name,
          status: "Erro",
          message: err.message,
        });
      }
    }
    setLoading(false); // Termina o loading
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange({ target: { files: e.dataTransfer.files } });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("nif");
    navigate("/");
  };

  /*
  return (
    <div>
    {loading ? (
          // 🔹 Overlay de Loading
          <div className="loading-overlay">
            <Player
              src="https://lottie.host/d77f95a2-379c-458b-9ef4-18b17a8fb0ce/c5eyEGzO0Q.json"
              loop
              autoplay
              style={{ height: "300px", width: "300px" }}
            />
            <p>A aplicar marca d'água, aguarde...</p>
          </div>
        ) : (
        <div className="header">
          <div className="logo">
              <img src="logo-transparent.png" alt="logotipo" className="logo-img" onClick={() => navigate('/homepage')} style={{ cursor: 'pointer' }}/>
          </div>
            <button
            className="logout-button-upload"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
        
        
        <div className="upload-wrapper">
          <h2 className="title">Verificar marca d'água</h2>
          <div className="upload-container">
            <div
              className={`drop-zone ${dragOver ? "dragover" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <p className="small-text">Envie arquivos para verificar se possuem marca d'água</p>
              <h3>Arraste e Solte os arquivos aqui</h3>
              <p>Ou</p>
              <label className="upload-btn">
                <span className="plus">+</span> Carregar
                <input
                  type="file"
                  multiple
                  ref={inputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept=".jpg,.jpeg,.png,.bmp"
                />
              </label>
              <p className="file-types">
                <strong>Suporta ficheiros do tipo</strong><br />
                jpeg, png, bmp
              </p>
            </div>

            <div className="illustration">
              <img src="/imgVerify.jpg" alt="Upload Illustration" />
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {selectedFiles.length > 0 && (
            <>
              <ul className="file-list">
                {selectedFiles.map((file, index) => (
                  <li key={index}>
                    {file.name}
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveImage(index)}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>

              <button className="apply-btn" onClick={handleVerifyWatermark}>
                Verificar
              </button>
            </>
          )}

          {resultsSecret.length > 0 && (
              <div className="results">
                <h3>Resultados:</h3>
                <ul>
                  {resultsSecret.map((res, idx) => (
                    <li key={idx}>
                      <strong>{res.fileName}</strong>:{" "}
                      {res.hasSecret
                        ? `Segredo encontrado → ${res.secret}`
                        : "Nenhum segredo encontrado"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
          )}
    </div>
  );
};

export default VerifyDocument;*/

return (
    <div>
      {loading ? (
        <div className="loading-overlay">
          <Player
            src="https://lottie.host/42545334-bbfe-4894-a187-5bc1cd4d4476/KlPql6Sui4.json"
            loop
            autoplay
            style={{ height: "300px", width: "300px" }}
          />
          <p>Verificando marca d'água, aguarde...</p>
        </div>
      ) : (
        <div>
          <div className="header">
            <div className="logo">
              <img src="logo-transparent.png" alt="logotipo" className="logo-img" onClick={() => navigate("/homepage")} style={{ cursor: "pointer" }} />
            </div>
            <button className="logout-button-upload" onClick={handleLogout}>Sair</button>
          </div>

          <div className="upload-wrapper">
            <h2 className="title">Verificar marca d'água</h2>
            <div className="upload-container">
              <div
                className={`drop-zone ${dragOver ? "dragover" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <p className="small-text">Envie arquivos para verificar se possuem marca d'água</p>
                <h3>Arraste e Solte os arquivos aqui</h3>
                <p>Ou</p>
                <label className="upload-btn">
                  <span className="plus">+</span> Carregar
                  <input type="file" multiple ref={inputRef} onChange={handleFileChange} style={{ display: "none" }} accept=".jpg,.jpeg,.png,.bmp" />
                </label>
                <p className="file-types"><strong>Suporta ficheiros do tipo</strong><br />jpeg, png, bmp</p>
              </div>

              <div className="illustration">
                <img src="/imgVerify.jpg" alt="Upload Illustration" />
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            {selectedFiles.length > 0 && (
              <>
                <ul className="file-list">
                  {selectedFiles.map((file, index) => (
                    <li key={index}>
                      {file.name}
                      <button className="remove-btn" onClick={() => handleRemoveImage(index)}>&times;</button>
                    </li>
                  ))}
                </ul>

                <button className="apply-btn" onClick={handleVerifyWatermark}>Verificar</button>
              </>
            )}

            {resultsSecret.length > 0 && (
              <div className="results">
                <h3>Resultados:</h3>
                <ul>
                  {resultsSecret.map((res, idx) => (
                    <li key={idx}>
                      <strong>{res.fileName}</strong>: {res.hasSecret ? (
                        <>
                          Segredo encontrado → <strong>{res.secret}</strong>
                          {res.owner ? (
                            <>
                              <br />
                              <span className="owner-info">
                                Assinado por: <strong>{res.owner.email}</strong>
                              </span>
                            </>
                          ) : (
                            <><br /><span className="owner-info">Utilizador não encontrado na BD</span></>
                          )}
                        </>
                      ) : (
                        "Nenhum segredo encontrado"
                      )}

                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyDocument;