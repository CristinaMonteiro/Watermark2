import requests
import json
from convert_image_into_Base64 import image_to_base64

image_path = "./example1.png"
secret = "ola"

# Converte a imagem para base64
base64_image = image_to_base64(image_path)

# Cria o payload
payload = {
    "image": base64_image,
    "secret": secret
}

# Envia para o endpoint
url = "http://localhost:5000/infer-torchserve"  # Ou onde estiver o Flask

response = requests.post(url, json=payload)

# Resultado
if response.ok:
    print("Resposta recebida:")
    print(response.json())
else:
    print("Erro:", response.status_code)
    print(response.text)
