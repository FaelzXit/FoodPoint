// Demonstração acadêmica: os dados ficam SOMENTE neste navegador e endereço.
// O usuário pode alterar o localStorage. Isto não protege dados privados.
const FoodPoint = (() => {
    const CONTAS = 'foodpoint_contas_v1';
    const SESSAO = 'foodpoint_sessao_v1';
    const normalizarEmail = email => email.trim().toLowerCase();

    function lerContas() {
        const contas = JSON.parse(localStorage.getItem(CONTAS) || '[]');
        if (!Array.isArray(contas) || contas.some(conta =>
            !conta || typeof conta.email !== 'string' ||
            typeof conta.salt !== 'string' || typeof conta.senhaHash !== 'string')) {
            throw new Error('Os cadastros locais estão inválidos.');
        }
        return contas;
    }

    // Evita guardar a senha original: salva um hash calculado com PBKDF2.
    async function calcularHash(senha, salt) {
        if (!globalThis.crypto?.subtle) {
            throw new Error('Abra o projeto pelo Live Server (localhost) ou por HTTPS.');
        }
        const encoder = new TextEncoder();
        const chave = await crypto.subtle.importKey(
            'raw', encoder.encode(senha), 'PBKDF2', false, ['deriveBits']
        );
        const resultado = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 210000, hash: 'SHA-256' },
            chave, 256
        );
        return Array.from(new Uint8Array(resultado), byte => byte.toString(16).padStart(2, '0')).join('');
    }

    async function cadastrar(nome, email, senha) {
        email = normalizarEmail(email);
        if (lerContas().some(conta => conta.email === email)) {
            throw new Error('Este e-mail já está cadastrado. Entre com sua senha.');
        }
        const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)),
            byte => byte.toString(16).padStart(2, '0')).join('');
        const senhaHash = await calcularHash(senha, salt);
        const contas = lerContas();
        if (contas.some(conta => conta.email === email)) {
            throw new Error('Este e-mail já está cadastrado.');
        }
        // Um objeto para cada cadastro, salvo na lista do localStorage.
        contas.push({ nome: nome.trim(), email, salt, senhaHash });
        localStorage.setItem(CONTAS, JSON.stringify(contas));
    }

    async function entrar(email, senha) {
        // Uma tentativa recusada não reutiliza um login anterior nesta aba.
        sessionStorage.removeItem(SESSAO);
        const conta = lerContas().find(conta => conta.email === normalizarEmail(email));
        if (!conta || await calcularHash(senha, conta.salt) !== conta.senhaHash) {
            throw new Error('E-mail ou senha incorretos. Se não tem uma conta, crie uma.');
        }
        sessionStorage.setItem(SESSAO, JSON.stringify({
            email: conta.email, expira: Date.now() + 8 * 60 * 60 * 1000
        }));
    }

    function usuarioAtual() {
        try {
            const sessao = JSON.parse(sessionStorage.getItem(SESSAO) || 'null');
            if (!sessao || typeof sessao.expira !== 'number' || sessao.expira <= Date.now()) return null;
            return lerContas().find(conta => conta.email === sessao.email) || null;
        } catch (_) { return null; }
    }

    function sair() { sessionStorage.removeItem(SESSAO); }
    return { cadastrar, entrar, usuarioAtual, sair };
})();
