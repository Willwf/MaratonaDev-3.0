// Configurando o servidor
const express = require('express');
const server = express();
require('dotenv/config');

// Configurar o servidor para apresentar arquivos estáticos
server.use(express.static('public'))

// Habilitar body do formulário
server.use(express.urlencoded({ extended: true }));

// Configurar a conexão com o banco de dados
const Pool = require('pg').Pool;
require('dotenv/config');

const db = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE
});

// Configurando a template engine
const nunjucks = require('nunjucks');
nunjucks.configure('./', {
  express: server,
  noCache: true, // boolean ou booleano. Aceita 2 valores: verdadeiro ou falso
});

// Configurar a apresentação da página
server.get('/', function (req, res) {

  db.query("SELECT * FROM doador ORDER BY id DESC LIMIT 2", function (err, result) {
    if (err) return res.send("Erro no banco de dados");

    const donors = result.rows;
    return res.render('index.html', { donors });
  })

});

server.post('/', function (req, res) {
  // Pegar dados do formulário.
  const name = req.body.name;
  const email = req.body.email;
  const blood = req.body.blood;

  // Se o name igual a vazio
  // OU o email igual a vazio
  // OU o blood igual a vazio
  if (name === "" || email === "" || blood === "") {
    return res.send('Todos os campos são obrigatórios.');
  }

  // Coloco valores dentro do banco de dados.
  const query =
    `INSERT INTO donors ("name", "email", "blood")
    VALUES ($1, $2, $3)`

  const values = [name, email, blood];


  db.query(query, values, function (err) {
    // fluxo de erro
    if (err) return res.send("Erro no banco de dados.");

    // fluxo ideal
    return res.redirect('/');
  });
});

// Ligar o servidor e permitir o acesso na porta 3000
server.listen(3000, function () {
  console.log('Iniciei o servidor.');
});