//animações js para o circulo 

export function configurarAnimacoes() {
  const sign_in_btn = document.querySelector("#sign-in-btn");
  const sign_up_btn = document.querySelector("#sign-up-btn");
  const container = document.querySelector(".container");

  sign_up_btn.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
  });

  sign_in_btn.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
  });
}

export function configurarAnimacoesUpload() {

  const dropZone = document.querySelector(".drop-zone");

  if (!dropZone) return;

  const dummyClient = {
    post(callback) {
      dropZone.classList.add("uploading");

      setTimeout(() => {
        dropZone.classList.remove("uploading");
        callback?.();
      }, 1500);
    },
  };

    dummyClient.post(() => {
  });
  
}
