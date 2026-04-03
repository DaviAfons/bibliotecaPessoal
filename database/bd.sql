-- Tabela de Utilizadores
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    bio TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Livros (Já com as colunas de imagem e avaliação integradas)
CREATE TABLE IF NOT EXISTS livros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    ano_publicacao INT,
    status_leitura ENUM('lido', 'lendo', 'nao_lido') DEFAULT 'nao_lido',
    descricao TEXT,
    imagem VARCHAR(500) DEFAULT NULL, -- Aumentado para suportar URLs longas
    avaliacao INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX (titulo), -- Melhora a velocidade da pesquisa por título
    INDEX (autor)   -- Melhora a velocidade da pesquisa por autor
);

-- Tabela de Gêneros (Ex: Romance, Ficção, Terror)
CREATE TABLE IF NOT EXISTS generos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

-- Tabela Relacional (Muitos para Muitos)
CREATE TABLE IF NOT EXISTS livro_genero (
    livro_id INT NOT NULL,
    genero_id INT NOT NULL,

    PRIMARY KEY (livro_id, genero_id),

    FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE,
    FOREIGN KEY (genero_id) REFERENCES generos(id) ON DELETE CASCADE
);

INSERT INTO generos (nome) VALUES ('Romance'), ('Ficção Científica'), ('Fantasia'), ('Terror'), ('Biografia'), ('História');

ALTER TABLE usuarios ADD COLUMN foto_perfil VARCHAR(255) DEFAULT NULL;

ALTER TABLE livros ADD COLUMN favorito TINYINT(1) DEFAULT 0;

ALTER TABLE livros MODIFY COLUMN imagem LONGTEXT;


ALTER TABLE usuarios 
ADD COLUMN token_recuperacao VARCHAR(255) DEFAULT NULL,
ADD COLUMN token_expiracao DATETIME DEFAULT NULL;