document.addEventListener('DOMContentLoaded', () => {
    const bookGrid = document.querySelector('.book-grid');
    const userNameSpan = document.getElementById('userName');
    const formLivro = document.getElementById('formLivro');
    const inputBusca = document.getElementById('inputBusca');

    // Recupera dados do usuário do sessionStorage
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));
    if (usuario && userNameSpan) {
        userNameSpan.textContent = usuario.nome;
    }

    // --- FUNÇÕES DE CARREGAMENTO ---
    const carregarGenerosNoSelect = async () => {
        try {
            const response = await fetch('../../backend/livros/listar_generos.php');
            const generos = await response.json();
            const select = document.getElementById('generos'); 
            if (select) {
                select.innerHTML = '';
                generos.forEach(g => {
                    const option = document.createElement('option');
                    option.value = g.id;
                    option.textContent = g.nome;
                    select.appendChild(option);
                });
            }
        } catch (e) { console.error(e); }
    };

    const carregarEstatisticas = async () => {
        try {
            const response = await fetch('../../backend/livros/estatisticas.php');
            const stats = await response.json();
            const boxes = document.querySelectorAll('.stats .box h3');
            if(boxes.length >= 2) {
                boxes[0].textContent = stats.lidos || 0;
                boxes[1].textContent = stats.lendo || 0;
            }
        } catch (e) { console.error(e); }
    };

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
            bookGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nenhum livro encontrado.</p>';
            return;
        }

        bookGrid.innerHTML = livros.map(livro => {
            const estrelasHTML = Array.from({ length: 5 }, (_, i) => 
                `<i class="${i < (livro.avaliacao || 0) ? 'fas' : 'far'} fa-star"></i>`
            ).join('');

            const tagsGeneros = livro.generos_nomes 
                ? livro.generos_nomes.split(', ').map(g => `<span class="genre-tag">${g}</span>`).join('')
                : '';

            return `
                <div class="book-card" onclick="verDetalhes(${livro.id})">
                    <div class="capa-container">
                        <img src="${livro.imagem || 'https://via.placeholder.com/150x220?text=Sem+Capa'}" alt="Capa">
                    </div>
                    <div class="book-info">
                        <h4>${livro.titulo}</h4>
                        <p class="author-name">${livro.autor}</p>
                        <div class="genre-container">${tagsGeneros}</div>
                        <div style="color:var(--dourado)">${estrelasHTML}</div>
                        <div class="book-actions" onclick="event.stopPropagation()">
                            <select onchange="alterarStatus(${livro.id}, this.value)" class="status-select status-${livro.status_leitura}">
                                <option value="nao_lido" ${livro.status_leitura === 'nao_lido' ? 'selected' : ''}>Não Lido</option>
                                <option value="lendo" ${livro.status_leitura === 'lendo' ? 'selected' : ''}>Lendo</option>
                                <option value="lido" ${livro.status_leitura === 'lido' ? 'selected' : ''}>Lido</option>
                            </select>
                            <button onclick="removerLivro(${livro.id})" class="delete-btn">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
        }).join('');
    };

    // --- SUBMISSÃO (SALVAR/EDITAR) ---
    if (formLivro) {
        formLivro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editId = formLivro.dataset.editId;
            const url = editId ? '../../backend/livros/editar.php' : '../../backend/livros/adicionar.php';
            
            const radio = document.querySelector('input[name="rating"]:checked');
            const selectG = document.getElementById('generos');

            const dados = {
                titulo: document.getElementById('titulo').value,
                autor: document.getElementById('autor').value,
                ano: document.getElementById('ano').value,
                status: document.getElementById('status').value,
                descricao: document.getElementById('descricao').value,
                imagem: document.getElementById('imagem').value,
                avaliacao: radio ? radio.value : 0,
                generos: selectG ? Array.from(selectG.selectedOptions).map(o => o.value) : []
            };

            if (editId) dados.id = editId;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });
                const result = await response.json();
                if (result.success) {
                    fecharModal();
                    location.reload(); 
                } else {
                    alert('Erro: ' + result.message);
                }
            } catch (err) { alert('Erro no servidor'); }
        });
    }

    // Inicialização
    carregarGenerosNoSelect();
    carregarEstatisticas();
    carregarLivros();
});

// --- FUNÇÕES GLOBAIS (FORA DO DOMCONTENTLOADED) ---

window.abrirModal = () => {
    document.getElementById('modalLivro').style.display = 'flex';
};

window.fecharModal = () => {
    const form = document.getElementById('formLivro');
    form.reset();
    delete form.dataset.editId;
    document.getElementById('modalLivro').style.display = 'none';
};

window.verDetalhes = (id) => {
    // Busca o livro na lista carregada em memória
    const livro = window.meusLivros.find(l => l.id == id);
    
    if (livro) {
        // Muda o título do modal
        document.querySelector('.modal-header h3').innerHTML = '<i class="fas fa-edit"></i> Editar Livro';
        
        // Preenche os inputs de texto e selects simples
        document.getElementById('titulo').value = livro.titulo;
        document.getElementById('autor').value = livro.autor;
        document.getElementById('ano').value = livro.ano_publicacao || '';
        document.getElementById('status').value = livro.status_leitura;
        document.getElementById('descricao').value = livro.descricao || '';
        document.getElementById('imagem').value = livro.imagem || '';
        
        // Preenche a avaliação (Radio Buttons)
        document.querySelectorAll('input[name="rating"]').forEach(radio => {
            radio.checked = (radio.value == (livro.avaliacao || 0));
        });

        // --- LÓGICA DE GÊNEROS (NOVO) ---
        const selectGeneros = document.getElementById('generos');
        
        // 1. Limpa qualquer seleção anterior
        Array.from(selectGeneros.options).forEach(opt => opt.selected = false);

        // 2. Se o livro tiver IDs de gêneros (vindo do backend atualizado)
        if (livro.generos_ids) {
            // Converte a string "1,2,5" em array ['1', '2', '5']
            // O String() garante que não quebre se vier apenas um número
            const ids = String(livro.generos_ids).split(',');

            // 3. Percorre as opções do select e marca as que coincidem com os IDs
            Array.from(selectGeneros.options).forEach(opt => {
                // Comparamos string com string para evitar erros de tipo
                if (ids.includes(opt.value.toString())) {
                    opt.selected = true;
                }
            });
        }
        
        // Armazena o ID do livro no formulário para saber que é uma edição
        document.getElementById('formLivro').dataset.editId = id;
        
        // Exibe o modal
        window.abrirModal();
    }
};

window.removerLivro = async (id) => {
    if (confirm('Deseja remover este livro?')) {
        try {
            const response = await fetch(`../../backend/livros/excluir.php?id=${id}`);
            const result = await response.json();
            if(result.success) {
                location.reload(); 
            }
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
        if(result.success) {
            location.reload(); 
        }
    } catch (e) { console.error(e); }
};