# CUIDA - Back-end Web

Este é o back-end do projeto CUIDA, desenvolvido para a versão web da plataforma. Ele gerencia a autenticação e o cadastro tanto de funcionários quanto de cidadãos (pacientes), servindo como a API principal para a aplicação.

---

## 🚀 Tecnologias Utilizadas

* **Node.js**: Ambiente de execução JavaScript.
* **Express**: Framework web para construir a API.
* **bcryptjs**: Biblioteca para criptografia segura de senhas.
* **jsonwebtoken (JWT)**: Para gerar tokens de acesso e autenticar usuários.
* **Nodemon**: Ferramenta para reinício automático do servidor durante o desenvolvimento.

## 📁 Estrutura do Projeto

O back-end segue a seguinte estrutura, facilitando a organização e a integração:

Markdown

# CUIDA - Back-end Web

Este é o back-end do projeto CUIDA, desenvolvido para a versão web da plataforma. Ele gerencia a autenticação e o cadastro tanto de funcionários quanto de cidadãos (pacientes), servindo como a API principal para a aplicação.

---

## 🚀 Tecnologias Utilizadas

* **Node.js**: Ambiente de execução JavaScript.
* **Express**: Framework web para construir a API.
* **bcryptjs**: Biblioteca para criptografia segura de senhas.
* **jsonwebtoken (JWT)**: Para gerar tokens de acesso e autenticar usuários.
* **Nodemon**: Ferramenta para reinício automático do servidor durante o desenvolvimento.

## 📁 Estrutura do Projeto

O back-end segue a seguinte estrutura, facilitando a organização e a integração:

/backend
├─── src/
│    ├─── controllers/
│    │    └─── authController.js     # Lógica de negócio para login/cadastro de funcionários.
│    │    └─── publicController.js   # Lógica de negócio para login/cadastro de cidadãos.
│    ├─── models/
│    │    └─── funcionario.js        # Modelo de dados para funcionários.
│    │    └─── cidadao.js            # Modelo de dados para cidadãos.
│    ├─── routes/
│    │    └─── authRoutes.js         # Endpoints para funcionários.
│    │    └─── publicRoutes.js       # Endpoints para cidadãos.
│    ├─── db/
│    │    └─── db.js                 # Lógica de persistência em arquivo JSON.
│    │    └─── mock_db.json          # O "banco de dados" de mentira.
│    └─── server.js                 # Ponto de entrada da aplicação.
├─── .env                          # Variáveis de ambiente.
├─── package.json                  # Dependências e scripts do projeto.
└─── package-lock.json



## ⚙️ Como Executar o Projeto

Para rodar o projeto completo, você precisa iniciar o back-end e o front-end em terminais separados.

### 1. Iniciar o Back-end

1.  Abra o terminal na pasta `backend`.
2.  Instale as dependências com `npm install`.
3.  Inicie o servidor com `npm run dev`.

### 2. Iniciar o Front-end

1.  Abra um **segundo terminal** na pasta raiz do projeto (fora de `backend`).
2.  Instale as dependências com `npm install`.
3.  Inicie a aplicação com `npm run dev`.

## 🎯 Endpoints da API

O back-end expõe os seguintes endpoints:

### **Para Funcionários:**
* **`POST /api/auth/cadastro`**
    * **Descrição**: Cadastra um novo funcionário.
    * **Corpo da Requisição**:
        ```json
        {
          "nome": "string",
          "email": "string",
          "password": "string",
          "matricula": "string",
          "departamento": "string",
          "cargo": "string"
        }
        ```
* **`POST /api/auth/login`**
    * **Descrição**: Autentica um funcionário.
    * **Corpo da Requisição**:
        ```json
        {
          "email": "string",
          "password": "string"
        }
        ```

### **Para Cidadãos:**
* **`POST /api/publico/cadastro-cidadao`**
    * **Descrição**: Cadastra um novo cidadão (paciente).
    * **Corpo da Requisição**:
        ```json
        {
          "nome": "string",
          "idade": "string",
          "endereco": "string",
          "cpf": "string",
          "rg": "string",
          "email": "string",
          "telefone": "string",
          "carteirinha": "string",
          "tipoSanguineo": "string",
          "medicamentosRestritos": "string",
          "diagnosticos": "string",
          "password": "string"
        }
        ```
* **`POST /api/publico/login-cidadao`**
    * **Descrição**: Autentica um cidadão (paciente).
    * **Corpo da Requisição**:
        ```json
        {
          "email": "string",
          "password": "string"
        }
        ```

---

O back-end está pronto para ser testado e integrado com a aplicação web.