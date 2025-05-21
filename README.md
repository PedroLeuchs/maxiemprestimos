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

## Requisitos de Sistema

- [Docker](https://www.docker.com/get-started) e Docker Compose
- [Java 17+](https://adoptium.net/) (para desenvolvimento local do backend)
- [Node.js 18+](https://nodejs.org/) e NPM (para desenvolvimento local do frontend)
- [Angular CLI](https://angular.io/cli) (para desenvolvimento local do frontend)

## Configuração e Execução

### Usando Docker Compose (Recomendado)

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/maxi-emprestimos.git
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

### Desenvolvimento Local

#### Backend (Spring Boot)

1. Configure o PostgreSQL local ou via Docker:

   ```bash
   docker run --name postgres -e POSTGRES_PASSWORD=admin -e POSTGRES_USER=postgres -e POSTGRES_DB=emprestimos_db -p 5432:5432 -d postgres:latest
   ```

2. Execute o backend:
   ```bash
   cd maxiemprestimos
   ./gradlew bootRun
   ```

#### Frontend (Angular)

1. Instale as dependências:

   ```bash
   cd front-maxi-emprestimos
   npm install
   ```

2. Execute a aplicação em modo de desenvolvimento:

   ```bash
   npm start
   ```

3. Acesse http://localhost:4200 no navegador

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
- **Host**: localhost (desenvolvimento local) ou postgres (via Docker Compose)
- **Porta**: 5432

As tabelas são criadas automaticamente pelo Hibernate (`spring.jpa.hibernate.ddl-auto=update`).

## Desenvolvimento

### Comandos úteis

Backend:

```bash
./gradlew build      # Compilar o projeto
./gradlew test       # Executar testes
./gradlew bootJar    # Gerar JAR executável
```

Frontend:

```bash
ng build                 # Compilar o projeto
ng test                  # Executar testes
ng generate component    # Gerar novo componente
ng serve --port 4201     # Executar em porta alternativa
```

## Licença

Este projeto é licenciado sob a [Licença MIT](LICENSE).
