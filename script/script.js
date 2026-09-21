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
