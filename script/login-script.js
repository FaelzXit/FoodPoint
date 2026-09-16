// ===================== HELPERS =====================

const $ = (id) => document.getElementById(id);

function isEmailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}

function marcarErro(idCampo, temErro) {
    $(idCampo).classList.toggle("campo-invalida", temErro);
}

function limparErroAoDigitar() {
    document.querySelectorAll(".campo input").forEach((input) => {
        input.addEventListener("input", () => {
            input.closest(".campo").classList.remove("campo-invalida");
        });
    });
}

function mostrarToast(mensagem, isErro) {
    const toast = $("toast");
    $("toast-texto").textContent = mensagem;
    toast.classList.toggle("erro", !!isErro);
    toast.querySelector("i").className = isErro
        ? "fa-solid fa-circle-exclamation"
        : "fa-solid fa-circle-check";
    toast.classList.add("mostrar");
    clearTimeout(mostrarToast._t);
    mostrarToast._t = setTimeout(() => toast.classList.remove("mostrar"), 3200);
}

function definirCarregando(botao, carregando) {
    botao.classList.toggle("carregando", carregando);
    botao.disabled = carregando;
}

// ===================== ABAS: ENTRAR / CRIAR CONTA =====================

const tabLogin = $("tab-login");
const tabSignup = $("tab-signup");
const formLogin = $("form-login");
const formSignup = $("form-signup");

function ativarAba(aba) {
    const isLogin = aba === "login";
    tabLogin.classList.toggle("active", isLogin);
    tabSignup.classList.toggle("active", !isLogin);
    formLogin.classList.toggle("active", isLogin);
    formSignup.classList.toggle("active", !isLogin);
}

tabLogin.addEventListener("click", () => ativarAba("login"));
tabSignup.addEventListener("click", () => ativarAba("signup"));

// ===================== MOSTRAR/OCULTAR SENHA =====================

document.querySelectorAll(".toggle-senha").forEach((icone) => {
    icone.addEventListener("click", () => {
        const input = $(icone.dataset.target);
        const mostrando = input.type === "text";
        input.type = mostrando ? "password" : "text";
        icone.classList.toggle("fa-eye", mostrando);
        icone.classList.toggle("fa-eye-slash", !mostrando);
    });
});

// ===================== LOGIN =====================

formLogin.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const email = $("login-email").value;
    const senha = $("login-senha").value;

    const emailOk = isEmailValido(email);
    const senhaOk = senha.length >= 6;

    marcarErro("campo-login-email", !emailOk);
    marcarErro("campo-login-senha", !senhaOk);

    if (!emailOk || !senhaOk) {
        mostrarToast("Confira os campos destacados.", true);
        return;
    }

    const botao = $("btn-login");
    definirCarregando(botao, true);

    // Aqui entra a chamada real de autenticação (fetch/API).
    // Ao confirmar o login, o usuário é levado para o dashboard (index.html).
    setTimeout(() => {
        definirCarregando(botao, false);

        if ($("lembrar-check").checked) {
            localStorage.setItem("foodpoint_email", email);
        }

        mostrarToast("Login realizado. Redirecionando…");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 700);
    }, 900);
});

// ===================== CRIAR CONTA =====================

formSignup.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nome = $("signup-nome").value.trim();
    const email = $("signup-email").value;
    const senha = $("signup-senha").value;
    const confirma = $("signup-confirma").value;

    const nomeOk = nome.length > 1;
    const emailOk = isEmailValido(email);
    const senhaOk = senha.length >= 6;
    const confirmaOk = senhaOk && senha === confirma;

    marcarErro("campo-signup-nome", !nomeOk);
    marcarErro("campo-signup-email", !emailOk);
    marcarErro("campo-signup-senha", !senhaOk);
    marcarErro("campo-signup-confirma", !confirmaOk);

    if (!nomeOk || !emailOk || !senhaOk || !confirmaOk) {
        mostrarToast("Confira os campos destacados.", true);
        return;
    }

    const botao = $("btn-signup");
    definirCarregando(botao, true);

    // Aqui entra a chamada real de cadastro (fetch/API).
    setTimeout(() => {
        definirCarregando(botao, false);
        mostrarToast("Conta criada com sucesso. Faça login para continuar.");
        formSignup.reset();
        ativarAba("login");
    }, 1000);
});

// ===================== ESQUECI A SENHA (modal) =====================

const modalEsqueci = $("modal-esqueci");
const esqueciFormWrap = $("esqueci-form-wrap");
const esqueciSucesso = $("esqueci-sucesso");

$("abrir-esqueci").addEventListener("click", () => {
    esqueciFormWrap.classList.remove("esconder");
    esqueciSucesso.classList.remove("mostrar");
    $("esqueci-email").value = $("login-email").value || "";
    marcarErro("campo-esqueci-email", false);
    modalEsqueci.showModal();
});

$("fechar-esqueci").addEventListener("click", () => modalEsqueci.close());
$("fechar-esqueci-sucesso").addEventListener("click", () => modalEsqueci.close());

modalEsqueci.addEventListener("click", (evento) => {
    if (evento.target === modalEsqueci) modalEsqueci.close();
});

$("enviar-esqueci").addEventListener("click", () => {
    const email = $("esqueci-email").value;
    const emailOk = isEmailValido(email);

    marcarErro("campo-esqueci-email", !emailOk);
    if (!emailOk) return;

    const botao = $("enviar-esqueci");
    definirCarregando(botao, true);

    // Aqui entra o envio real do e-mail de recuperação (fetch/API).
    setTimeout(() => {
        definirCarregando(botao, false);
        esqueciFormWrap.classList.add("esconder");
        esqueciSucesso.classList.add("mostrar");
    }, 900);
});

// ===================== INICIALIZAÇÃO =====================

limparErroAoDigitar();

const emailLembrado = localStorage.getItem("foodpoint_email");
if (emailLembrado) {
    $("login-email").value = emailLembrado;
    $("lembrar-check").checked = true;
}
