document.getElementById('formEsqueceuSenha').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.innerHTML = "Enviando e-mail... Por favor, aguarde.";
    mensagemDiv.style.color = "blue"; 

    try {
        const response = await fetch('../../backend/auth/solicitar_recuperacao.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();

        // Agora apenas verificamos se deu sucesso e mostramos a mensagem que o PHP enviou
        if (data.sucesso) {
            mensagemDiv.innerHTML = `<p style="color: green; font-weight: bold;">${data.mensagem}</p>`;
        } else {
            mensagemDiv.innerHTML = `<p style="color: red;">${data.mensagem}</p>`;
        }
    } catch (error) {
        mensagemDiv.innerHTML = '<p style="color: red;">Erro ao conectar com o servidor.</p>';
    }
});