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
