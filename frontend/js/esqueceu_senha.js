document.getElementById('formEsqueceuSenha').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const mensagemDiv = document.getElementById('mensagem');
    
    // Feedback visual indicando processamento
    mensagemDiv.innerHTML = "Processando solicitação... Por favor, aguarde.";
    mensagemDiv.style.color = "blue"; 

    try {
        const response = await fetch('../../backend/auth/solicitar_recuperacao.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();

        if (data.sucesso) {
            let htmlMensagem = `<p style="color: green; font-weight: bold;">${data.mensagem}</p>`;
            
            // Renderiza o botão se o modo de teste (link_dev) estiver ativo
            if (data.link_dev) {
                htmlMensagem += `
                    <div style="margin-top: 15px; padding: 15px; background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 8px;">
                        <p style="color: #333; margin-bottom: 10px; font-size: 0.9em;">(Modo Teste) Clique abaixo para continuar:</p>
                        <a href="${data.link_dev}" style="background-color: #722F37; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                            Ir para Redefinição de Senha
                        </a>
                    </div>
                `;
            }
            
            mensagemDiv.innerHTML = htmlMensagem;
        } else {
            mensagemDiv.innerHTML = `<p style="color: red;">${data.mensagem}</p>`;
        }
    } catch (error) {
        mensagemDiv.innerHTML = '<p style="color: red;">Erro ao conectar com o servidor.</p>';
    }
});