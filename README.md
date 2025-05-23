# Maxi Empréstimos

Sistema de gerenciamento de empréstimos que permite o cadastro de clientes e controle de operações de empréstimo.

## Visão Geral do Projeto

O sistema Maxi Empréstimos é uma aplicação completa para gerenciamento de operações de empréstimo, composta por:

- **Backend**: API REST desenvolvida em Java com Spring Boot
- **Frontend**: Interface de usuário desenvolvida em Angular 19 com Material Design
- **Banco de Dados**: PostgreSQL para armazenamento de dados

### Principais Funcionalidades

- Cadastro e gerenciamento de clientes
- Registro e controle de empréstimos
- Cálculo de juros e parcelas

## Configuração e Execução

### Docker Compose

1. Clone o repositório:

   ```bash
   git clone https://github.com/PedroLeuchs/maxiemprestimos.git
   cd maxi-emprestimos
   ```

2. Execute o projeto com Docker Compose:

   ```bash
   docker-compose up -d
   ```

3. Acesse:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8080
   - Banco de dados: localhost:5432 (PostgreSQL)

## Estrutura do Projeto

### Backend (Spring Boot)

- `maxiemprestimos/`: Pasta raiz do projeto backend
  - `src/main/java/com/back/maxiemprestimos/`: Código-fonte Java
  - `src/main/resources/`: Arquivos de configuração
  - `build.gradle`: Dependências e configurações de build

### Frontend (Angular)

- `front-maxi-emprestimos/`: Pasta raiz do projeto frontend
  - `src/app/`: Código-fonte Angular
    - `clients/`: Módulo de gerenciamento de clientes
    - `emprestimos/`: Módulo de gerenciamento de empréstimos
    - `services/`: Serviços compartilhados
    - `shared/`: Componentes compartilhados

## Configuração do Banco de Dados

O sistema utiliza PostgreSQL com as seguintes configurações padrão:

- **Database**: emprestimos_db
- **Usuário**: postgres
- **Senha**: admin
- **Host**: postgres (via Docker Compose)
- **Porta**: 5432

As tabelas são criadas automaticamente pelo Hibernate (`spring.jpa.hibernate.ddl-auto=update`).

