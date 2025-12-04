import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { configurarAnimacoesUpload } from "./animations.js";
import "./upload.css"; 
import {saveAs} from "file-saver"
import { Player } from "@lottiefiles/react-lottie-player";




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


const UploadDocument = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState({ message: "", type: "" }); //vai alterar o css mediante o tipo de mensagem de erro
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [secretText, setSecretText] = useState("");


  const validFormats = ["image/jpeg", "image/png", "image/bmp"];
  const maxWidth = 2048;
  const maxHeight = 2048;

  //para fazer download da imagem com watermark
  const [loading, setLoading] = useState(false);

  //para ter acesso ao token_user que lhe permite assinar as imagens
  const userTokenStored = sessionStorage.getItem("token_user");

  const navigate = useNavigate();
  
  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      navigate("/");
    } else {
      configurarAnimacoesUpload();
    }
  }, [navigate]);

  const logImageAction = async ({ action, fileName, status, message }) => {
  const nif = sessionStorage.getItem("nif");
  if (!nif) {
    console.warn("NIF não encontrado na sessão.");
    return;
  }

  try {
    await fetch("http://localhost:5000/log-image-action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("access_token")}`
      },
      body: JSON.stringify({
        nif,
        action,
        fileName: fileName || "desconhecido",
        status,
        message,
      }),
    });
  } catch (err) {
    console.error("Erro ao registar log:", err);
  }
};


  const handleFileChange = (e) => {
    setError({ message: "", type: "" });
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    let pendingValidations = newFiles.length;
    const validNewFiles = [];

    newFiles.forEach((file) => {
      if (!validFormats.includes(file.type)) {
        const msg = `Formato inválido (${file.name}). Só JPG, PNG e BMP são permitidos.`;
        setError({message:msg, type:"error"});
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
          setError({message:msg, type:"error"});
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
        setError({message:msg, type:"error"});
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

  const handleApplyWatermark = async () => {
    if (selectedFiles.length === 0) {
      setError({ message: "Selecione pelo menos 1 imagem.", type: "error" });
      return;
    }

    //usar o token_user guardado no login
    const secretToUse = userTokenStored;
    if (!secretToUse) {
      setError({ message: "Token do utilizador não encontrado. Faça login novamente.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem("access_token");

      // Processar cada imagem sequencialmente
      for (const file of selectedFiles) {
        const base64 = await fileToBase64(file);

        const response = await fetch("http://localhost:5000/infer-torchserve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            image: base64,
            secret: secretToUse
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("Erro no backend:", result.error);
          logImageAction({
            action: "Marca d'água",
            fileName: file.name,
            status: "Erro",
            message: result.error || "Erro na inferência",
          });
          continue; // passa para a próxima imagem
        }

        if (!result.stego_image_base64) {
          setError({ message: `TorchServe não retornou a imagem processada: ${file.name}`, type: "error" });
          logImageAction({
            action: "Marca d'água",
            fileName: file.name,
            status: "Erro",
            message: "Imagem processada retornou vazia",
          });
          continue;
        }

        // Baixar a imagem estego
        const link = document.createElement("a");
        link.href = "data:image/png;base64," + result.stego_image_base64;
        link.download = `stego_${file.name}`;
        document.body.appendChild(link);
        link.click();
        link.remove();

        logImageAction({
          action: "Marca d'água",
          fileName: file.name,
          status: "Sucesso",
          message: "Imagem processada via TorchServe",
        });
      }

      setError({ message: "Marca d'água aplicada em todas as imagens!", type: "success" });

    } catch (err) {
      console.error("Erro ao chamar backend:", err);
      setError({ message: "Erro interno ao processar as imagens.", type: "error" });
    } finally {
      setLoading(false);
    }
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

  return (
    <div>
   {loading ? (
      // Overlay de Loading
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
    <div>
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
          <br></br>
      <div className="upload-wrapper">      
        <h2 className="title">Inserir marca d'água</h2>
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
            <p className="small-text">Envie arquivos para aplicar marca d'água</p>
            <h3>Arraste e Solte os arquivos aqui</h3>
            <p>Ou</p>
            <label className="upload-btn">
              <span className="plus">+</span> Carregar
              <input
                type="file"
                multiple
                name="file"
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
            <img src="/imgUpload-1.png" alt="Upload Illustration" />
          </div>
        </div>

          {error.message && (
            <div className={`custom-error ${error.type}`}>
              <span>{error.message}</span>
              <button className="close-error" onClick={() => setError({ message: "", type: "" })}>
                &times;
              </button>
            </div>
          )}


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

          {/*<label className="secret-label">
              Mensagem secreta:
              <input
                type="text"
                className="secret-input"
                value={secretText}
                onChange={(e) => setSecretText(e.target.value)}
                maxLength={7}
              />
            </label>*/}


            <button className="apply-btn" onClick={handleApplyWatermark}>
              Aplicar
            </button>

          </>

        )}
      </div>
    </div>
      )}
    </div>
  );
  
};

export default UploadDocument;
