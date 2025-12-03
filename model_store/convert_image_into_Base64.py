import base64
import os

def image_to_base64(image_path: str) -> str:
    """
    Converte uma imagem de um caminho de arquivo especificado para uma string Base64.

    Args:
        image_path (str): O caminho completo para o arquivo da imagem.

    Returns:
        str: A string Base64 da imagem, decodificada para UTF-8.

    Raises:
        FileNotFoundError: Se o arquivo da imagem não for encontrado.
        Exception: Para outros erros durante a leitura ou codificação do arquivo.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"O arquivo da imagem não foi encontrado: {image_path}")

    try:
        with open(image_path, "rb") as image_file:
            # Lê o conteúdo binário da imagem
            image_bytes = image_file.read()
            # Codifica os bytes para Base64 e depois decodifica para string UTF-8
            base64_string = base64.b64encode(image_bytes).decode('utf-8')
            return base64_string
    except Exception as e:
        print(f"Ocorreu um erro ao converter a imagem para Base64: {e}")
        raise

# --- Como usar ---
if __name__ == "__main__":
    my_image_path = "abacus_261.jpg" 


    # 3. Chame a função para converter
    try:
        base64_output = image_to_base64(my_image_path)
        print("\n--- Imagem convertida para Base64 ---")
        print("Parte inicial da string Base64 (completa pode ser muito longa):")
        print(base64_output[:100] + "...") # Imprime apenas os primeiros 100 caracteres
        print(f"\nTamanho total da string Base64: {len(base64_output)} caracteres")

        # Opcional: Salvar a string Base64 em um arquivo de texto para uso fácil
        output_txt_file = "image_base64.txt"
        with open(output_txt_file, "w") as f:
            f.write(base64_output)
        print(f"String Base64 salva em '{output_txt_file}'")

    except FileNotFoundError as e:
        print(e)
    except Exception as e:
        print(f"Erro inesperado: {e}")