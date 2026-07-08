#!/usr/bin/env python3
"""
server.py
Sprint 3 (correção): a API do JDoodle bloqueia chamadas diretas do
navegador (CORS) — ela foi feita para ser chamada de servidor pra
servidor, não de dentro de uma página web. Sem isso, o botão "Executar"
nunca funcionaria a partir do navegador.

Este servidor substitui o `python3 -m http.server` simples por um que
também sabe responder em POST /api/compile: ele recebe a requisição do
navegador (mesma origem, sem problema de CORS), repassa pro JDoodle
*do lado do servidor* (onde CORS não existe — é uma regra só de
navegador) e devolve o resultado pro front-end.

IMPORTANTE: isto ainda não é o "proxy que esconde a chave" ideal
descrito em docs/api.md — as credenciais continuam vindo do navegador
do professor (localStorage) e passam por este servidor local a caminho
do JDoodle. Isso resolve o bloqueio técnico de CORS, mas não resolve
sozinho o trade-off de segurança (documentado em docs/api.md): quando
este projeto for publicado (GitHub Pages, Sprint 6+), este script não
roda mais — vai ser preciso uma função serverless de verdade hospedada
em algum lugar (Cloudflare Workers, Vercel, etc.) fazendo o mesmo papel.

Uso: python3 server.py [porta]  (porta padrão: 8080)
"""

import json
import sys
import urllib.request
import urllib.error
from http.server import HTTPServer, SimpleHTTPRequestHandler

JDOODLE_EXECUTE_URL = "https://api.jdoodle.com/v1/execute"


class CodeLabRequestHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/compile":
            self.send_error(404, "Rota nao encontrada")
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body_raw = self.rfile.read(content_length)

        try:
            payload = json.loads(body_raw)
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Corpo da requisicao invalido (JSON esperado)."})
            return

        request = urllib.request.Request(
            JDOODLE_EXECUTE_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (compatible; CodeLabEDU/1.0)",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                response_body = response.read()
                self._send_raw_json(response.status, response_body)
        except urllib.error.HTTPError as err:
            error_body = err.read()
            self._send_error_as_json(err.code, error_body)
        except urllib.error.URLError as err:
            self._send_json(502, {"error": f"Falha ao contactar o JDoodle: {err.reason}"})
        except TimeoutError:
            self._send_json(504, {"error": "Tempo de compilacao esgotado."})

    def _send_error_as_json(self, status, raw_bytes):
        try:
            json.loads(raw_bytes)
            self._send_raw_json(status, raw_bytes)
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._send_json(status, {
                "error": f"O JDoodle recusou a requisicao (HTTP {status}). "
                         "Confira se o Client ID/Secret estao corretos e se a conta "
                         "ainda tem execucoes disponiveis hoje."
            })

    def _send_json(self, status, data):
        self._send_raw_json(status, json.dumps(data).encode("utf-8"))

    def _send_raw_json(self, status, raw_bytes):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(raw_bytes)))
        self.end_headers()
        self.wfile.write(raw_bytes)

    def log_message(self, format, *args):
        super().log_message(format, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    server = HTTPServer(("0.0.0.0", port), CodeLabRequestHandler)
    print(f"CodeLab EDU servindo em http://localhost:{port}  (Ctrl+C para parar)")
    print("Proxy de compilacao ativo em POST /api/compile (resolve o bloqueio de CORS do JDoodle)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nEncerrando...")
        server.server_close()


if __name__ == "__main__":
    main()
