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

formLogin.addEventListener("submit", async (evento) => {
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

    try {
        await FoodPoint.entrar(email, senha);
        // "Lembrar de mim" preenche apenas o e-mail, como no projeto original.
        try {
            if ($("lembrar-check").checked) {
                localStorage.setItem("foodpoint_email", email.trim().toLowerCase());
            } else {
                localStorage.removeItem("foodpoint_email");
            }
        } catch (_) { /* Login continua mesmo com armazenamento desativado. */ }
        window.location.assign("page-principal.html");
    } catch (erro) {
        mostrarToast(["SecurityError", "QuotaExceededError"].includes(erro.name)
            ? "Não foi possível salvar neste navegador. Confira as permissões e o espaço disponível."
            : erro.message, true);
    } finally {
        definirCarregando(botao, false);
    }
});

// ===================== CRIAR CONTA =====================

formSignup.addEventListener("submit", async (evento) => {
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

    try {
        await FoodPoint.cadastrar(nome, email, senha);
        mostrarToast("Conta criada com sucesso. Faça login para continuar.");
        formSignup.reset();
        $("login-email").value = email.trim().toLowerCase();
        $("login-senha").value = "";
        ativarAba("login");
    } catch (erro) {
        mostrarToast(["SecurityError", "QuotaExceededError"].includes(erro.name)
            ? "Não foi possível salvar neste navegador. Confira as permissões e o espaço disponível."
            : erro.message, true);
    } finally {
        definirCarregando(botao, false);
    }
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

    mostrarToast("A recuperação por e-mail ainda não está disponível.", true);
});

// ===================== INICIALIZAÇÃO =====================

limparErroAoDigitar();

try {
    const emailLembrado = localStorage.getItem("foodpoint_email");
    if (emailLembrado) {
        $("login-email").value = emailLembrado;
        $("lembrar-check").checked = true;
    }
} catch (_) { /* O preenchimento do e-mail é opcional. */ }
