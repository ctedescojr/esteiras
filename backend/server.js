const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;
const JWT_SECRET = 'seu_segredo_super_secreto'; // Em um projeto real, use uma variável de ambiente

app.use(cors());
app.use(express.json());

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Conectado ao banco de dados.');
});

// Criar tabelas se não existirem
db.serialize(() => {
  // Tabela de administradores
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`, (err) => {
    if (err) console.error(err.message);
    else {
      // Inserir um admin padrão se a tabela estiver vazia
      const insert = 'INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)';
      bcrypt.hash('admin', 10, (err, hash) => {
        if (err) return console.error(err.message);
        db.run(insert, ['admin', hash]);
      });
    }
  });

  // Tabelas para os custos
  db.run(`CREATE TABLE IF NOT EXISTS custos_gerais (
    id INTEGER PRIMARY KEY,
    correiaPorMetro REAL,
    chapaPorM2 REAL,
    perfilEstruturaPorMetro REAL,
    projetoPorHora REAL,
    montagemPorHora REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS motores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    preco REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS opcionais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    preco REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orcamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT,
    dados TEXT,
    total REAL
  )`);

  // Popular tabelas com dados iniciais se estiverem vazias
  db.get('SELECT COUNT(*) as count FROM custos_gerais', (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO custos_gerais VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(1, 150.75, 320.50, 95.20, 120.00, 80.00);
      stmt.finalize();
    }
  });

  db.get('SELECT COUNT(*) as count FROM motores', (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO motores (nome, preco) VALUES (?, ?)');
      stmt.run('Motor Weg 1cv', 1200.00);
      stmt.run('Motor Weg 2cv', 1850.00);
      stmt.run('Motor SEW 1cv', 2100.00);
      stmt.finalize();
    }
  });

  db.get('SELECT COUNT(*) as count FROM opcionais', (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO opcionais (nome, preco) VALUES (?, ?)');
      const opcionaisIniciais = [
        { nome: 'Mancais', preco: 350.00 },
        { nome: 'Usinagem suportes', preco: 500.00 },
        { nome: 'Usinagem eixos', preco: 650.00 },
        { nome: 'Rolete Inferior', preco: 280.00 },
        { nome: 'Proteções', preco: 450.00 },
        { nome: 'Pé articulado (un)', preco: 85.00 },
        { nome: 'Rodízios (un)', preco: 120.00 },
        { nome: 'Fixações gerais', preco: 200.00 },
        { nome: 'Tratamento superficial', preco: 700.00 },
        { nome: 'Pintura', preco: 600.00 },
      ];
      opcionaisIniciais.forEach(op => stmt.run(op.nome, op.preco));
      stmt.finalize();
    }
  });
});


// Middleware para verificar o token JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Token inválido
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // Não autorizado
  }
};

// Rota de Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM admins WHERE username = ?';
  db.get(sql, [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!result) return res.status(401).json({ error: 'Senha incorreta' });

      const accessToken = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ accessToken });
    });
  });
});

// Rota para buscar todos os custos (pública)
app.get('/costs', (req, res) => {
  const costs = {};
  db.get('SELECT * FROM custos_gerais WHERE id = 1', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    Object.assign(costs, row);
    db.all('SELECT * FROM motores', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      costs.motores = rows;
      db.all('SELECT * FROM opcionais', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        costs.opcionais = rows;
        res.json(costs);
      });
    });
  });
});

// Rota para salvar um orçamento (pública)
app.post('/orcamentos', (req, res) => {
  const { dados, total } = req.body;
  const sql = 'INSERT INTO orcamentos (data, dados, total) VALUES (?, ?, ?)';
  const data = new Date().toISOString();
  db.run(sql, [data, JSON.stringify(dados), total], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Rota para buscar orçamentos (protegida)
app.get('/orcamentos', authenticateJWT, (req, res) => {
  const sql = 'SELECT * FROM orcamentos ORDER BY data DESC';
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Rota para atualizar custos_gerais (protegida)
app.put('/costs/gerais', authenticateJWT, (req, res) => {
  const { correiaPorMetro, chapaPorM2, perfilEstruturaPorMetro, projetoPorHora, montagemPorHora } = req.body;
  const sql = `UPDATE custos_gerais SET 
    correiaPorMetro = ?, 
    chapaPorM2 = ?, 
    perfilEstruturaPorMetro = ?, 
    projetoPorHora = ?, 
    montagemPorHora = ? 
    WHERE id = 1`;
  db.run(sql, [correiaPorMetro, chapaPorM2, perfilEstruturaPorMetro, projetoPorHora, montagemPorHora], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Custos gerais atualizados com sucesso' });
  });
});

// Rotas para CRUD de motores e opcionais (protegidas)
['motores', 'opcionais'].forEach(tabela => {
  // Criar
  app.post(`/${tabela}`, authenticateJWT, (req, res) => {
    const { nome, preco } = req.body;
    const sql = `INSERT INTO ${tabela} (nome, preco) VALUES (?, ?)`;
    db.run(sql, [nome, preco], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
  });
  // Atualizar
  app.put(`/${tabela}/:id`, authenticateJWT, (req, res) => {
    const { nome, preco } = req.body;
    const sql = `UPDATE ${tabela} SET nome = ?, preco = ? WHERE id = ?`;
    db.run(sql, [nome, preco, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Item atualizado com sucesso' });
    });
  });
  // Deletar
  app.delete(`/${tabela}/:id`, authenticateJWT, (req, res) => {
    const sql = `DELETE FROM ${tabela} WHERE id = ?`;
    db.run(sql, [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Item deletado com sucesso' });
    });
  });
});


app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
