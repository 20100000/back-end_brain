# Brain - Back-End API (Teste Técnico)

Este é o repositório da API REST (Back-End) desenvolvida para o teste técnico da **Brain** pelo desenvolvedor **Tiago Honorio**. A aplicação gerencia e persistente todas as regras de negócio exigidas no teste para produtores rurais, propriedades e culturas agrícolas através de um banco de dados relacional isolado.

## 🚀 Objetivo do Projeto

O objetivo principal deste projeto é fornecer uma API escalável e blindada contra falhas para suportar a operação do ecossistema agrícola da Brain Agriculture, atendendo aos seguintes critérios:
- **Modelo Relacional Correto:** Banco estruturado em 3 tabelas independentes (`rural_producers`, `farms` e `farm_crops`) eliminando colunas multivaloradas de safras e cultivos.
- **Validações de Domínio Estritas:** Algoritmos matemáticos de higienização e validação de dígitos verificadores de CPF e CNPJ integrados aos DTOs.
- **Segurança de Negócio:** Validação matemática impeditiva que bloqueia inserções ou atualizações onde a soma das áreas aráveis e de vegetação nativa exceda a área total da fazenda.
- **Endpoints de Inteligência:** Rotas analíticas e agregadas otimizadas com comandos nativos do PostgreSQL (`COUNT`, `SUM` e `GROUP BY`) para alimentar os gráficos de pizza e indicadores do Front-End.

---

## 🛠️ Tecnologias Utilizadas

- **NestJS (v10):** Framework Node.js progressivo para a construção de aplicações corporativas eficientes.
- **Sequelize ORM & sequelize-typescript:** Mapeamento objeto-relacional tipado e estruturado.
- **PostgreSQL 15:** Banco de dados relacional de alta performance rodando em container.
- **Class-Validator & Class-Transformer:** Validação em tempo real dos payloads de entrada (DTOs).
- **Jest & ts-jest:** Framework para desenvolvimento baseado em testes automatizados (TDD).
- **Swagger (OpenAPI):** Documentação interativa e auto-gerada dos endpoints da API.
- **Docker & Docker Compose:** Containerização e orquestração completa da esteira de infraestrutura.

---
   v        
## 📂 Organização Arquitetural de Diretórios

O projeto foi refatorado adotando uma estrutura modular:

```text
src/
├── config/          # Arquivos de credenciais de ambientes e parâmetros do Sequelize
├── database/        # Arquivos de migrations ordenados de forma sequencial para o banco
├── modules/         # Módulos de domínio isolados da aplicação
│   ├── farm/        # Controllers, services, DTOs e entidades de propriedades rurais
│   ├── farm-crops/  # Gerenciamento individual e isolado de cultivos agrícolas
│   ├── rural-producers/ # Regras cadastrais e validadores de CPF/CNPJ de produtores
│   └── tests/       # Suíte centralizada de Testes Unitários de todos os módulos
├── app.module.ts    # Inicialização central do framework e injeção do Sequelize global
└── main.ts          # Inicialização da API, ativação global de Pipes e liberação de CORS
```

---

## ⚙️ Passo a Passo para Iniciar a Aplicação

### 1. Clonar o Repositório
Abra o seu terminal e clone a pasta do projeto back-end:
```bash
git clone https://github.com/20100000/back-end_brain.git
cd back-end_brain
```

### 2. Iniciar os Containers (Banco + API)
Certifique-se de que o Docker esteja ativo na sua máquina. Execute o comando abaixo para construir a imagem, baixar o PostgreSQL, configurar as variáveis de ambiente estruturadas e levantar a aplicação:
```bash
docker compose up --build
```
*Nota: O contêiner está configurado para executar as migrações (`npx sequelize-cli db:migrate`) de forma automática antes do NestJS subir, garantindo a criação das tabelas estruturais de forma instantânea.*

### 3. Executar migração manual
```bash
docker exec -it brain_nestjs_api npx sequelize-cli db:migrate
```
*Nota: Caso no build não criar banco de dados e tabelas execute comando acima.*

---

## 🌐 Como Acessar a Documentação Interativa (Swagger)

Com os contêineres iniciados com sucesso, a documentação OpenAPI gerada pelo Swagger estará disponível para testes em:
👉 **http://localhost:3000/api**

Através desta interface, é possível testar manualmente todas as rotas de `GET`, `POST`, `PATCH` e `DELETE` do sistema.

---

## 🏃 Como Executar a Suíte de Testes Unitários (Jest / TDD)

Os testes cobrem 100% dos fluxos de sucesso e exceção de todos os módulos, testando as somas matemáticas de áreas e rejeições de documentos falsos. Para disparar os testes de dentro do contêiner ativo, abra uma nova janela do terminal e execute:

```bash
docker exec -it brain_nestjs_api npm run test
```
Caso queira rodar os testes isolando especificamente o rastro do diretório de módulos estruturado, execute:
```bash
docker exec -it brain_nestjs_api npx jest modules/tests
```

---
---

## 🤖 Esteira de Integração Contínua (CI) & Políticas de Merge

Para garantir a estabilidade do ecossistema e impedir que códigos que violem as regras de negócio entrem no histórico principal, o repositório conta com uma pipeline automatizada via **GitHub Actions** (`.github/workflows/ci.yml`).

### 🔒 Critérios Obrigatórios para Realizar Merge (`dev` → `main`)
A branch `main` está protegida contra commits diretos. Qualquer alteração ou nova funcionalidade desenvolvida na branch `dev` só poderá ser integrada à branch principal se cumprir rigorosamente as seguintes etapas:

1. **Abertura de Pull Request (PR):** Toda integração de código deve ser feita obrigatoriamente abrindo um Pull Request direcionado à branch `main`.
2. **Execução Automatizada da Suíte (Jest):** Assim que o PR é aberto, o GitHub Actions dispara um servidor temporário e executa automaticamente o comando `npm run test` em nuvem.
3. **Status Check Obrigatório:** O botão de **Merge** ficará bloqueado em vermelho caso qualquer um dos testes unitários (como a validação matemática de hectares ou os algoritmos de CPF/CNPJ) falhe. A esteira precisa retornar com sucesso (status verde) para liberar a ramificação.

---


## 💻 Integração com o Front-End

Para visualizar o painel gerencial web completo, consumindo e enviando dados para este servidor, acesse e inicialize o repositório do Front-End React em:
🔗 **https://github.com/20100000/front-end_brain**

