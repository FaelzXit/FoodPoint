const modal = document.getElementById("modal");
const abrir = document.getElementById("button-flutuante-bot");
const fechar = document.getElementById("fechar");

// Função para fechar com animação suave
const fecharComAnimacao = () => {
    modal.classList.add("fechando"); // Adiciona a classe que engatilha a animação de saída
    
    // Espera 300ms (tempo da animação) para sumir com o modal de fato
    setTimeout(() => {
        modal.close();
        modal.classList.remove("fechando"); // Limpa a classe para a próxima vez que abrir
    }, 300); 
};

// Abre o modal
abrir.onclick = () => modal.showModal();

// Fecha o modal nos botões ou clicando fora
fechar.onclick = fecharComAnimacao;

modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        fecharComAnimacao();
    }
});


// Controle de navegação para a demonstração local. Não é segurança de servidor.
function conferirSessao() {
    if (!FoodPoint.usuarioAtual()) {
        document.body.style.visibility = "hidden";
        window.location.replace("index.html");
        return;
    }
    document.body.style.visibility = "visible";
}
conferirSessao();
window.addEventListener("pageshow", conferirSessao);
window.addEventListener("storage", conferirSessao);
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) conferirSessao();
});

const botaoSair = document.createElement("button");
botaoSair.type = "button";
botaoSair.textContent = "Sair";
botaoSair.className = "botao-secundario";
botaoSair.addEventListener("click", () => {
    try {
        FoodPoint.sair();
        window.location.replace("index.html");
    } catch (_) {
        alert("Não foi possível encerrar a sessão. Confira as permissões do navegador.");
    }
});
document.getElementById("user-area").appendChild(botaoSair);

const botaoRelatorio = document.getElementById("gerar-relatorio");
const resultadoIA = document.getElementById("resultado-ia");

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, (caractere) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[caractere]);
}

function formatarTextoMarkdown(texto) {
    const codigos = [];
    let formatado = escaparHTML(texto).replace(/`([^`]+)`/g, (_, codigo) => {
        const marcador = `CODIGOMARCADOR${codigos.length}FIM`;
        codigos.push(`<code>${codigo}</code>`);
        return marcador;
    });

    formatado = formatado
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/__(.+?)__/g, "<strong>$1</strong>")
        .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
        .replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1<em>$2</em>");

    codigos.forEach((codigo, indice) => {
        formatado = formatado.replace(`CODIGOMARCADOR${indice}FIM`, codigo);
    });
    return formatado;
}

function renderizarMarkdown(texto) {
    const linhas = String(texto).replace(/\r/g, "").split("\n");
    const html = [];
    let paragrafo = [];
    let lista = null;

    function fecharParagrafo() {
        if (paragrafo.length) {
            html.push(`<p>${formatarTextoMarkdown(paragrafo.join(" "))}</p>`);
            paragrafo = [];
        }
    }

    function fecharLista() {
        if (lista) {
            html.push(`</${lista}>`);
            lista = null;
        }
    }

    for (const linha of linhas) {
        const limpa = linha.trim();
        const titulo = limpa.match(/^(#{1,3})\s+(.+)$/);
        const itemNumerado = limpa.match(/^\d+[.)]\s+(.+)$/);
        const itemLista = limpa.match(/^[-*+]\s+(.+)$/);
        const citacao = limpa.match(/^>\s?(.*)$/);

        if (!limpa) {
            fecharParagrafo();
            fecharLista();
        } else if (titulo) {
            fecharParagrafo();
            fecharLista();
            const nivel = Math.min(titulo[1].length + 1, 4);
            html.push(`<h${nivel}>${formatarTextoMarkdown(titulo[2])}</h${nivel}>`);
        } else if (itemLista || itemNumerado) {
            fecharParagrafo();
            const tipoLista = itemNumerado ? "ol" : "ul";
            if (lista !== tipoLista) {
                fecharLista();
                lista = tipoLista;
                html.push(`<${lista}>`);
            }
            html.push(`<li>${formatarTextoMarkdown((itemLista || itemNumerado)[1])}</li>`);
        } else if (citacao) {
            fecharParagrafo();
            fecharLista();
            html.push(`<blockquote>${formatarTextoMarkdown(citacao[1])}</blockquote>`);
        } else if (/^(---+|\*\*\*+)$/.test(limpa)) {
            fecharParagrafo();
            fecharLista();
            html.push("<hr>");
        } else {
            fecharLista();
            paragrafo.push(limpa);
        }
    }

    fecharParagrafo();
    fecharLista();
    return html.join("");
}

async function mostrarRespostaEmFluxo(resposta) {
    if (!resposta.body) throw new Error("O navegador não conseguiu receber a resposta em fluxo.");

    const leitor = resposta.body.getReader();
    const decodificador = new TextDecoder();
    let buffer = "";
    let recebeuTexto = false;
    let mensagemErro = "";
    let terminou = false;

    function processarEvento(bloco) {
        const linhaDados = bloco.split("\n").find((linha) => linha.startsWith("data:"));
        if (!linhaDados) return;

        const evento = JSON.parse(linhaDados.slice(5).trim());
        if (evento.tipo === "texto") {
            resultadoIA.dataset.resposta = (resultadoIA.dataset.resposta || "") + evento.texto;
            resultadoIA.innerHTML = renderizarMarkdown(resultadoIA.dataset.resposta);
            resultadoIA.scrollTop = resultadoIA.scrollHeight;
            recebeuTexto = true;
        } else if (evento.tipo === "erro") {
            mensagemErro = evento.mensagem;
            terminou = true;
        } else if (evento.tipo === "fim") {
            terminou = true;
        }
    }

    while (!terminou) {
        const { value, done } = await leitor.read();
        buffer += decodificador.decode(value || new Uint8Array(), { stream: !done });
        buffer = buffer.replace(/\r\n/g, "\n");

        let separador = buffer.indexOf("\n\n");
        while (separador !== -1 && !terminou) {
            processarEvento(buffer.slice(0, separador));
            buffer = buffer.slice(separador + 2);
            separador = buffer.indexOf("\n\n");
        }

        if (done) break;
    }

    if (mensagemErro) {
        if (recebeuTexto) {
            resultadoIA.dataset.resposta += `\n\n${mensagemErro}`;
            resultadoIA.innerHTML = renderizarMarkdown(resultadoIA.dataset.resposta);
        }
        else throw new Error(mensagemErro);
    } else if (!recebeuTexto) {
        throw new Error("A IA retornou uma resposta vazia.");
    }
}

botaoRelatorio.addEventListener("click", async () => {
    botaoRelatorio.disabled = true;
    botaoRelatorio.textContent = "Gerando relatório…";
    resultadoIA.textContent = "";
    resultadoIA.dataset.resposta = "";

    try {
        const resposta = await fetch("/api/ia", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "text/event-stream",
            },
            body: JSON.stringify({
                pergunta: "Minha empresa está com gargalos na produção. O que devo fazer?",
            }),
        });

        if (!resposta.ok) {
            const dados = await resposta.json().catch(() => ({}));
            throw new Error(dados.erro || "Não foi possível gerar a resposta da IA.");
        }

        const tipoResposta = resposta.headers.get("content-type") || "";
        if (tipoResposta.includes("application/json")) {
            const dados = await resposta.json();
            if (!dados.resposta) {
                throw new Error(dados.erro || "A IA retornou uma resposta vazia.");
            }
            resultadoIA.dataset.resposta = dados.resposta;
            resultadoIA.innerHTML = renderizarMarkdown(dados.resposta);
            return;
        }

        resultadoIA.textContent = "";
        await mostrarRespostaEmFluxo(resposta);
    } catch (erro) {
        resultadoIA.textContent = erro instanceof TypeError
            ? "Não foi possível acessar a IA. Abra o FoodPoint em http://127.0.0.1:5001/."
            : erro.message;
    } finally {
        botaoRelatorio.disabled = false;
        botaoRelatorio.textContent = "Gerar relatório";
    }
});
