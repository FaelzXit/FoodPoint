"""Cliente do OpenRouter usado pelo backend do FoodPoint."""

import os
import json
from pathlib import Path

import requests
from dotenv import load_dotenv


PASTA_FOODPOINT = Path(__file__).resolve().parent
ARQUIVO_CHAVE_LOCAL = PASTA_FOODPOINT / ".env" / "chave.env"
ARQUIVO_CHAVE_OPENROUTER = (
    PASTA_FOODPOINT.parent / "open-router-IA_TESTE" / ".env" / "chave.env"
)
if ARQUIVO_CHAVE_LOCAL.is_file():
    load_dotenv(ARQUIVO_CHAVE_LOCAL)
elif ARQUIVO_CHAVE_OPENROUTER.is_file():
    load_dotenv(ARQUIVO_CHAVE_OPENROUTER)

URL_OPENROUTER = "https://openrouter.ai/api/v1/chat/completions"
MODELO = os.getenv(
    "OPENROUTER_MODEL",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
)
INSTRUCOES = (
    "Responda em português brasileiro somente com recomendações práticas. Não faça "
    "resumo, introdução nem conclusão. Comece com um título Markdown curto e dê "
    "no máximo três recomendações em lista; cada uma deve ter uma frase curta. "
    "Use **negrito** ou *itálico* apenas para destacar o essencial. Baseie-se "
    "somente nas informações recebidas, não invente dados e não mostre raciocínio interno."
)


def transmitir_resposta(pergunta):
    """Consulta o modelo e entrega cada trecho assim que chega do OpenRouter."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError(
            "Não encontrei OPENROUTER_API_KEY. Confira o arquivo local da chave."
        )

    payload = {
        "model": MODELO,
        "stream": True,
        "max_tokens": 200,
        "messages": [
            {"role": "system", "content": INSTRUCOES},
            {"role": "user", "content": pergunta},
        ],
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        resposta = requests.post(
            URL_OPENROUTER,
            headers=headers,
            json=payload,
            stream=True,
            timeout=60,
        )
    except requests.RequestException as erro:
        raise RuntimeError(
            "Não foi possível conectar ao OpenRouter. Confira a internet e tente novamente."
        ) from erro

    if not resposta.ok:
        try:
            detalhes = resposta.json().get("error", {}).get("message")
        except (ValueError, AttributeError):
            detalhes = None
        if not detalhes:
            detalhes = f"O OpenRouter respondeu com status {resposta.status_code}."
        raise RuntimeError(str(detalhes))

    recebeu_conteudo = False
    for linha_bruta in resposta.iter_lines():
        if not linha_bruta:
            continue

        linha = linha_bruta.decode("utf-8", errors="replace").strip()
        if not linha.startswith("data:"):
            continue

        trecho = linha[len("data:"):].strip()
        if trecho == "[DONE]":
            break

        try:
            bloco = json.loads(trecho)
        except json.JSONDecodeError:
            continue

        if "error" in bloco:
            erro = bloco["error"]
            mensagem = (
                erro.get("message", "Falha ao gerar a resposta.")
                if isinstance(erro, dict)
                else str(erro)
            )
            raise RuntimeError(mensagem)

        escolhas = bloco.get("choices", [])
        if escolhas:
            texto = escolhas[0].get("delta", {}).get("content")
            if texto:
                recebeu_conteudo = True
                yield texto

    if not recebeu_conteudo:
        raise RuntimeError("O OpenRouter retornou uma resposta vazia.")
