document.addEventListener('DOMContentLoaded', () => {
    const bookGrid = document.querySelector('.book-grid');
    const formLivro = document.getElementById('formLivro');
    const inputBusca = document.getElementById('inputBusca');

    // Elementos novos da imagem
    const inputFoto = document.getElementById('inputFoto');
    const previewImagem = document.getElementById('previewImagem');

    // --- 0. LÓGICA DE UPLOAD DE IMAGEM (NOVO) ---
    if (inputFoto) {
        inputFoto.addEventListener('change', function (evento) {
            const arquivo = evento.target.files[0];

            if (arquivo) {
                if (arquivo.size > 2 * 1024 * 1024) {
                    alert('Atenção: Imagens muito grandes podem deixar o sistema lento. Tente usar imagens menores.');
                }

                const leitor = new FileReader();
                leitor.onload = function (e) {
                    const resultadoBase64 = e.target.result;

                    // Mostra preview
                    if (previewImagem) {
                        previewImagem.src = resultadoBase64;
                        previewImagem.style.display = 'block';
                    }

                    // CORREÇÃO: Salva o Base64 no input hidden para enviar ao PHP
                    const hiddenImg = document.getElementById('imagem');
                    if (hiddenImg) {
                        hiddenImg.value = resultadoBase64;
                    }
                }
                leitor.readAsDataURL(arquivo);
            }
        });
    }

    // --- 1. CARREGAR DADOS DO USUÁRIO ---
    const carregarUsuarioNavbar = async () => {
        try {
            const response = await fetch('../../backend/auth/get_perfil.php');
            const data = await response.json();

            if (data.success) {
                const usuario = data.dados;
                const navNome = document.getElementById('navNome');
                const navAvatar = document.getElementById('navAvatar');
                const userNameSpan = document.getElementById('userName');

                if (navNome) navNome.textContent = usuario.nome.split(' ')[0];
                if (userNameSpan) userNameSpan.textContent = usuario.nome;

                if (navAvatar) {
                    navAvatar.src = usuario.foto_perfil
                        ? '../' + usuario.foto_perfil
                        : `https://ui-avatars.com/api/?name=${usuario.nome}&background=efe7dd&color=5a1a1b`;
                }
            }
        } catch (error) { console.error('Erro user:', error); }
    };

    // --- 2. CARREGAMENTO DE GÊNEROS (checkboxes) ---
    const carregarGenerosNoSelect = async () => {
        try {
            const response = await fetch('../../backend/livros/listar_generos.php');
            const generos = await response.json();
            const container = document.getElementById('generos-checkboxes');
            if (container) {
                container.innerHTML = '';
                generos.forEach(g => {
                    const label = document.createElement('label');
                    label.className = 'genero-checkbox-label';
                    label.innerHTML = `
                        <input type="checkbox" name="generos[]" value="${g.id}">
                        <span class="check-icon"><i class="fas fa-check" style="font-size:9px;"></i></span>
                        <span>${g.nome}</span>`;
                    container.appendChild(label);
                });
            }
        } catch (e) { console.error(e); }
    };

    // --- 3. ESTATÍSTICAS ---
    const carregarEstatisticas = async () => {
        try {
            const response = await fetch('../../backend/livros/estatisticas.php');
            const stats = await response.json();
            const boxes = document.querySelectorAll('.stats .box h3');
            if (boxes.length >= 2) {
                boxes[0].textContent = stats.lidos || 0;
                boxes[1].textContent = stats.lendo || 0;
            }
        } catch (e) { console.error(e); }
    };

    // --- 4. LISTAGEM DE LIVROS ---
    const carregarLivros = async () => {
        try {
            const response = await fetch('../../backend/livros/listar.php');
            const data = await response.json();

            if (data.success) {
                window.meusLivros = data.livros;
                renderizarLivros(data.livros);
            }
        } catch (e) { console.error(e); }
    };

    const renderizarLivros = (livros) => {
        if (!bookGrid) return;

        if (!livros || livros.length === 0) {
            const mensagem = inputBusca && inputBusca.value
                ? 'Nenhum livro encontrado.'
                : 'Nenhum livro encontrado. Adicione um novo!';
            bookGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--texto-claro);">${mensagem}</p>`;
            return;
        }

        bookGrid.innerHTML = livros.map(livro => {
            const estrelasHTML = Array.from({ length: 5 }, (_, i) =>
                `<i class="${i < (livro.avaliacao || 0) ? 'fas' : 'far'} fa-star"></i>`
            ).join('');

            const tagsGeneros = livro.generos_nomes
                ? livro.generos_nomes.split(', ').map(g => `<span class="genre-tag">${g}</span>`).join('')
                : '';

            const ehFavorito = livro.favorito == 1;

            // Se não tiver imagem, usa um placeholder
            const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='220' viewBox='0 0 150 220'%3E%3Crect width='150' height='220' fill='%23efe7dd'/%3E%3Ctext x='75' y='115' text-anchor='middle' font-size='13' fill='%235a1a1b' font-family='serif'%3ESem Capa%3C/text%3E%3C/svg%3E";

            let imagemSrc = PLACEHOLDER;

            if (livro.imagem && livro.imagem.trim() !== '') {
                // Se a imagem for um Base64, usamos ela diretamente
                if (livro.imagem.startsWith('data:image')) {
                    imagemSrc = livro.imagem;
                }
                // CORREÇÃO: Dois '../' para voltar à raiz do projeto e acessar a pasta uploads
                else {
                    imagemSrc = '../../' + livro.imagem;
                }
            }

            return `
                <div class="book-card" onclick="verDetalhes(${livro.id})">
                    <div class="capa-container">
                        <img src="${imagemSrc}" alt="Capa">
                    </div>
                    <div class="book-info">
                        <div style="display:flex; justify-content:space-between; align-items:start;">
                            <h4 style="margin-right: 10px;">${livro.titulo}</h4>
                            <button class="btn-favorito ${ehFavorito ? 'ativo' : ''}" 
                                    onclick="event.stopPropagation(); toggleFavorito(${livro.id})"
                                    title="${ehFavorito ? 'Remover' : 'Favoritar'}">
                                <i class="${ehFavorito ? 'fas' : 'far'} fa-heart"></i>
                            </button>
                        </div>

                        <p class="author-name">${livro.autor}</p>
                        <div class="genre-container">${tagsGeneros}</div>
                        <div style="color:var(--dourado)">${estrelasHTML}</div>
                        
                        <div class="book-actions" onclick="event.stopPropagation()">
                            <select onchange="alterarStatus(${livro.id}, this.value)" class="status-select status-${livro.status_leitura}">
                                <option value="nao_lido" ${livro.status_leitura === 'nao_lido' ? 'selected' : ''}>Não Lido</option>
                                <option value="lendo" ${livro.status_leitura === 'lendo' ? 'selected' : ''}>Lendo</option>
                                <option value="lido" ${livro.status_leitura === 'lido' ? 'selected' : ''}>Lido</option>
                            </select>
                            <button onclick="removerLivro(${livro.id})" class="delete-btn" title="Excluir">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
        }).join('');
    };

    // --- 5. PESQUISA ---
    if (inputBusca) {
        inputBusca.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            if (window.meusLivros) {
                const filtrados = window.meusLivros.filter(l =>
                    l.titulo.toLowerCase().includes(termo) || l.autor.toLowerCase().includes(termo)
                );
                renderizarLivros(filtrados);
            }
        });
    }

    // --- SUBMISSÃO ---
    if (formLivro) {
        formLivro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editId = formLivro.dataset.editId;
            const url = editId ? '../../backend/livros/editar.php' : '../../backend/livros/adicionar.php';

            const radio = document.querySelector('input[name="rating"]:checked');
            const inputImg = document.getElementById('imagem');

            const dados = {
                titulo: document.getElementById('titulo').value,
                autor: document.getElementById('autor').value,
                ano: document.getElementById('ano').value,
                status: document.getElementById('status').value,
                descricao: document.getElementById('descricao').value,
                imagem: inputImg ? inputImg.value : '',
                avaliacao: radio ? radio.value : 0,
                generos: Array.from(document.querySelectorAll('#generos-checkboxes input[type="checkbox"]:checked')).map(cb => cb.value)
            };

            if (editId) dados.id = editId;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });
                
                const textResult = await response.text();

                try {
                    const result = JSON.parse(textResult);
                    if (result.success) {
                        fecharModal();
                        location.reload();
                    } else {
                        alert('Erro do servidor: ' + result.message);
                    }
                } catch (jsonError) {
                    console.error('Resposta inválida do servidor:', textResult);
                    alert('Erro inesperado. Verifique a consola (F12) para detalhes.');
                }

            } catch (err) { alert('Erro na conexão com o servidor'); }
        });
    }

    // Inicialização
    carregarUsuarioNavbar();
    carregarGenerosNoSelect();
    carregarEstatisticas();
    carregarLivros();

    // --- LISTENERS DE UI ---
    const navbarToggle = document.getElementById('navbarToggle');
    if (navbarToggle) {
        navbarToggle.addEventListener('click', () => {
            document.getElementById('navMenu').classList.toggle('active');
        });
    }

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = '../../index.html';
        });
    }

    const btnNovoLivro = document.getElementById('btnNovoLivro');
    if (btnNovoLivro) {
        btnNovoLivro.addEventListener('click', () => window.abrirModal());
    }

    const btnFecharModal = document.getElementById('btnFecharModal');
    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', () => window.fecharModal());
    }
});

// --- FUNÇÕES GLOBAIS ---
window.toggleFavorito = async (id) => {
    try {
        await fetch('../../backend/livros/favoritar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        location.reload();
    } catch (e) { console.error(e); }
};

window.abrirModal = () => {
    const modal = document.getElementById('modalLivro');
    if (modal) modal.style.display = 'flex';
};

window.fecharModal = () => {
    const form = document.getElementById('formLivro');
    const preview = document.getElementById('previewImagem');
    const inputFoto = document.getElementById('inputFoto');
    const hiddenImg = document.getElementById('imagem');

    if (form) {
        form.reset();
        delete form.dataset.editId;
        document.querySelector('.modal-header h3').innerHTML = '<i class="fas fa-book-medical"></i> Novo Livro';
        
        document.querySelectorAll('#generos-checkboxes input[type="checkbox"]').forEach(cb => cb.checked = false);
    }

    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
    if (inputFoto) inputFoto.value = '';
    if (hiddenImg) hiddenImg.value = '';

    const modal = document.getElementById('modalLivro');
    if (modal) modal.style.display = 'none';
};

window.verDetalhes = (id) => {
    const livro = window.meusLivros.find(l => l.id == id);
    if (livro) {
        document.querySelector('.modal-header h3').innerHTML = '<i class="fas fa-edit"></i> Editar Livro';
        document.getElementById('titulo').value = livro.titulo;
        document.getElementById('autor').value = livro.autor;
        document.getElementById('ano').value = livro.ano_publicacao || '';
        document.getElementById('status').value = livro.status_leitura;
        document.getElementById('descricao').value = livro.descricao || '';

        // --- Lógica de Imagem ao Editar (CORRIGIDA) ---
        const hiddenImg = document.getElementById('imagem');
        const preview = document.getElementById('previewImagem');

        if (hiddenImg) hiddenImg.value = livro.imagem || '';

        if (preview) {
            if (livro.imagem && livro.imagem.trim() !== '') {
                if (livro.imagem.startsWith('data:image')) {
                    preview.src = livro.imagem;
                } else {
                    // Dois '../' para voltar à raiz do projeto e carregar a pasta uploads
                    preview.src = '../../' + livro.imagem;
                }
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        }
        // ---------------------------------

        document.querySelectorAll('input[name="rating"]').forEach(radio => {
            radio.checked = (radio.value == (livro.avaliacao || 0));
        });

        const selectGeneros = document.getElementById('generos-checkboxes');
        if (selectGeneros) {
            selectGeneros.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            if (livro.generos_ids) {
                const ids = String(livro.generos_ids).split(',');
                selectGeneros.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    if (ids.includes(cb.value.toString())) cb.checked = true;
                });
            }
        }
        document.getElementById('formLivro').dataset.editId = id;
        window.abrirModal();
    }
};

window.removerLivro = async (id) => {
    if (confirm('Deseja remover este livro?')) {
        try {
            const response = await fetch(`../../backend/livros/excluir.php?id=${id}`);
            const result = await response.json();
            if (result.success) location.reload();
        } catch (e) { alert("Erro ao apagar"); }
    }
};

window.alterarStatus = async (id, novoStatus) => {
    try {
        const response = await fetch('../../backend/livros/atualizar_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, status: novoStatus })
        });
        const result = await response.json();
        if (result.success) location.reload();
    } catch (e) { console.error(e); }
};