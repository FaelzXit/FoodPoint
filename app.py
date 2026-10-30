import json
from pathlib import Path

from flask import Flask, Response, jsonify, request, send_from_directory, stream_with_context

from ia import transmitir_resposta


app = Flask(__name__)
PASTA_APP = Path(__file__).resolve().parent


@app.route("/")
def pagina_login():
    return send_from_directory(PASTA_APP, "index.html")


@app.route("/api/ia", methods=["POST"])
def api_ia():
    dados = request.get_json(silent=True)
    pergunta = dados.get("pergunta") if isinstance(dados, dict) else None

    if not isinstance(pergunta, str) or not pergunta.strip():
        return jsonify({"erro": "A pergunta da análise está vazia."}), 400

    def eventos_da_resposta():
        try:
            for trecho in transmitir_resposta(pergunta.strip()):
                evento = {"tipo": "texto", "texto": trecho}
                yield f"data: {json.dumps(evento, ensure_ascii=False)}\n\n"
            yield 'data: {"tipo":"fim"}\n\n'
        except RuntimeError as erro:
            evento = {"tipo": "erro", "mensagem": str(erro)}
            yield f"data: {json.dumps(evento, ensure_ascii=False)}\n\n"
        except Exception:
            app.logger.exception("Falha ao transmitir a resposta do OpenRouter.")
            evento = {"tipo": "erro", "mensagem": "A conexão com a IA foi interrompida."}
            yield f"data: {json.dumps(evento, ensure_ascii=False)}\n\n"

    return Response(
        stream_with_context(eventos_da_resposta()),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.route("/<path:arquivo>")
def arquivos_foodpoint(arquivo):
    return send_from_directory(PASTA_APP, arquivo)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=False)
