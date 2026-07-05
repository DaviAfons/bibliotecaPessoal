document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleção de Elementos (Agrupado para clareza)
    const forms = {
        main: document.getElementById('cadastroForm'),
        senha: document.getElementById('senha'),
        confirmar: document.getElementById('confirmarSenha'),
        bio: document.getElementById('bio'),
        dataNasc: document.getElementById('dataNascimento')
    };

    const ui = {
        charCount: document.querySelector('.char-count'),
        strengthBar: document.querySelector('.strength-bar'),
        strengthText: document.querySelector('.strength-text span'),
        senhaMatch: document.getElementById('senhaMatch'),
        progressContainer: document.querySelector('.progress-steps'),
        steps: document.querySelectorAll('.step')
    };

    // 2. Configurações Iniciais de Data
    // Define a data máxima como hoje e a padrão como 18 anos atrás
    const hoje = new Date();
    if (forms.dataNasc) {
        forms.dataNasc.max = hoje.toISOString().split('T')[0];
        
        const dataPadrao = new Date();
        dataPadrao.setFullYear(hoje.getFullYear() - 18);
        forms.dataNasc.value = dataPadrao.toISOString().split('T')[0];
    }

    // 3. Funções de Utilidade
    
    // Alternar visibilidade da senha
    window.togglePassword = (fieldId) => {
        const field = document.getElementById(fieldId);
        const btn = field.nextElementSibling;
        const icon = btn.querySelector('i');
        const isPassword = field.type === 'password';
        
        field.type = isPassword ? 'text' : 'password';
        icon.classList.toggle('fa-eye', !isPassword);
        icon.classList.toggle('fa-eye-slash', isPassword);
    };

    // Força da Senha
    const updatePasswordStrength = () => {
        const pwd = forms.senha.value;
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;

        const configs = [
            { text: "muito fraca", color: "#c45a5a" },
            { text: "fraca", color: "#c45a5a" },
            { text: "média", color: "#d2691e" },
            { text: "forte", color: "#2d5016" },
            { text: "muito forte", color: "#2a7a2a" }
        ];

        const res = configs[strength];
        if (ui.strengthBar) {
            // Envia os valores dinâmicos para as variáveis CSS
            ui.strengthBar.style.setProperty('--bar-width', `${(strength / 4) * 100}%`);
            ui.strengthBar.style.setProperty('--bar-color', res.color);
            
            ui.strengthText.textContent = res.text;
            ui.strengthText.style.color = res.color;
        }
    };

    // Validação de coincidência de senhas
    const checkPasswordMatch = () => {
        const match = forms.senha.value === forms.confirmar.value;
        const isEmpty = forms.confirmar.value === '';
        
        if (ui.senhaMatch) {
            ui.senhaMatch.textContent = isEmpty ? '' : (match ? '✓ As senhas coincidem' : '✗ As senhas não coincidem');
            ui.senhaMatch.className = `validation-message ${match ? 'success' : 'error'}`;
        }
        
        forms.confirmar.classList.toggle('valid', match && !isEmpty);
        forms.confirmar.classList.toggle('invalid', !match && !isEmpty);
    };

    // Gestão da Biografia (Contador de caracteres)
    const updateBio = () => {
        if (forms.bio.value.length > 200) forms.bio.value = forms.bio.value.substring(0, 200);
        const count = forms.bio.value.length;
        if (ui.charCount) {
            ui.charCount.textContent = `${count}/200 caracteres`;
            ui.charCount.style.color = count > 190 ? '#c45a5a' : (count > 150 ? '#d2691e' : '#666666');
        }
    };

    // 4. Lógica da Barra de Progresso Dinâmica
    const updateDynamicProgress = () => {
        // Coleta os valores atuais
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const dataNasc = forms.dataNasc ? forms.dataNasc.value : '';
        const senha = forms.senha.value;
        const confirmar = forms.confirmar.value;
        const termos = document.getElementById('termos').checked;

        // Regras de validação para cada etapa
        const step1Valido = nome.length > 2 && email.includes('@') && email.includes('.') && dataNasc !== '';
        const step2Valido = step1Valido && senha.length >= 6 && senha === confirmar;
        const step3Valido = step2Valido && termos;

        let progressWidth = '15%'; // Estado inicial

        if (ui.steps && ui.steps.length > 2) {
            // Reseta as etapas visuais
            ui.steps[1].classList.remove('active');
            ui.steps[2].classList.remove('active');

            // Avança para a Etapa 2
            if (step1Valido) {
                progressWidth = '50%';
                ui.steps[1].classList.add('active');
            }
            
            // Avança para a Etapa 3
            if (step2Valido) {
                progressWidth = '85%';
                ui.steps[2].classList.add('active');
            }

            // Finaliza 100% da barra
            if (step3Valido) {
                progressWidth = '100%';
            }
        }

        // Aplica a largura na variável CSS da barra
        if (ui.progressContainer) {
            ui.progressContainer.style.setProperty('--progress', progressWidth);
        }
    };

    // 5. Submissão do Formulário (Integrado com o backend)
    window.cadastrar = async (event) => {
        event.preventDefault();
        
        const dados = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            dataNascimento: forms.dataNasc.value,
            senha: forms.senha.value,
            confirmar: forms.confirmar.value,
            bio: forms.bio.value.trim(),
            termos: document.getElementById('termos').checked
        };

        // Validações de segurança antes de enviar ao servidor
        if (!dados.nome || !dados.email || !dados.senha) return showNotification('Preencha os campos obrigatórios', 'error');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) return showNotification('Email inválido', 'error');
        if (dados.senha !== dados.confirmar) return showNotification('As senhas não coincidem', 'error');
        if (!dados.termos) return showNotification('É necessário aceitar os termos de uso', 'error');

        try {
            const response = await fetch('../../backend/auth/cadastro.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            const result = await response.json();

            if (result.success) {
                const modal = document.getElementById('successModal');
                if (modal) {
                    modal.classList.add('show');
                }
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            showNotification('Erro na comunicação com o servidor.', 'error');
        }
    };

    // 6. Event Listeners
    if (forms.senha) {
        forms.senha.addEventListener('input', () => { 
            updatePasswordStrength(); 
            checkPasswordMatch(); 
        });
    }
    if (forms.confirmar) forms.confirmar.addEventListener('input', checkPasswordMatch);
    if (forms.bio) forms.bio.addEventListener('input', updateBio);
    
    // Adiciona o gatilho da barra de progresso a todos os inputs do formulário
    const formInputs = document.querySelectorAll('#cadastroForm input, #cadastroForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', updateDynamicProgress);
        input.addEventListener('change', updateDynamicProgress);
    });
    
    // Chamadas iniciais para configurar o estado visual assim que a página carrega
    updateBio();
    updateDynamicProgress();
});

// ==========================================
// Funções Globais (Fora do DOMContentLoaded)
// ==========================================

// Notificação Global (Toast)
function showNotification(message, type = 'info') {
    const iconMap = { 
        success: 'check-circle', 
        error: 'exclamation-circle', 
        warning: 'exclamation-triangle', 
        info: 'info-circle' 
    };
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${iconMap[type]}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 400);
    }, 4000);
}

// Redirecionamento para Login
window.redirectToLogin = () => {
    window.location.href = '../../index.html';
};

// Listeners do Modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('successModal');
    if (!modal) return;

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    });
});