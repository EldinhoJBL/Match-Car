# 🚗 MatchCar: Inteligência Analítica para Seminovos
## DealerData Castanhal — Wcar Veículos

![Status do Projeto](https://img.shields.io/badge/Status-Em_Andamento-blue?style=flat-square)
[![Acessar Aplicação](https://img.shields.io/badge/Acessar_Aplicação-match--car.lovable.app-0052FF?style=flat-square&logo=vercel&logoColor=white)](https://match-car.lovable.app)

O **MatchCar** é um ecossistema de recomendação inteligente desenvolvido especificamente para a **Wcar Veículos** (Castanhal/PA). O sistema utiliza arquitetura de Big Data e Inteligência Artificial para conectar o perfil socioeconômico do cliente ao veículo ideal em estoque, otimizando a conversão de vendas e acelerando o giro de pátio.

---

## ✨ Funcionalidades Principais

* **Recomendação Preditiva:** Algoritmo que identifica a melhor opção de seminovo com base no perfil do comprador (Renda, Profissão, Idade).
* **Justificativa por IA:** Argumentos de venda personalizados gerados pelo Gemini AI para auxiliar os consultores.
* **Gestão de Estoque Real-time:** Dashboard administrativo restrito para controle total de ativos e monitoramento de leads.
* **Interface Cliente Fluida:** Interface otimizada para captura de dados e conversão via WhatsApp.

## 🛠️ Stack Tecnológica

O projeto utiliza uma arquitetura híbrida para garantir escalabilidade e performance:

* **Inteligência Artificial & API:** Google Gemini AI (Motor de recomendações comportamentais e geração de relatórios).
* **Big Data & Engine:** Python, Apache Spark & FastAPI/Flask (Processamento massivo e inteligência de dados).
* **Frontend & Interface:** React, TypeScript e Tailwind CSS (Desenvolvido via Lovable.dev).
* **Backend & Persistência:** Supabase (Base de dados PostgreSQL e Autenticação).
* **Infraestrutura:** Lovable (Hospedagem de alta performance).
* **Prototipagem:** Google Colab.

## 🧠 Arquitetura DealerData

Diferente de filtros de pesquisa convencionais, o MatchCar opera numa camada de inteligência analítica:
1. **Ingestão:** Os dados do lead são capturados via interface React.
2. **Processamento:** A **Engine (API)** do sistema processa os dados com base na lógica validada em Spark, cruzando o comportamento do usuário com o estoque real.
3. **Inferência:** O motor da API se conecta ao Gemini AI para analisar o *score* de afinidade e redigir a justificativa ideal de venda.
4. **Entrega:** O lojista recebe um lead qualificado com a sugestão pronta para o fechamento.

## 📁 Estrutura do Repositório

```text
├── src/               # Interface frontend (Aplicação React/TypeScript)
├── engine/            # API do projeto (Motor de inteligência, processamento e Spark)
├── supabase/          # Migrações e políticas do banco de dados PostgreSQL
├── public/            # Ativos estáticos e capturas de tela
├── .lovable/          # Histórico e instruções de automação do Lovable
├── .env.example       # Modelo para variáveis de ambiente
└── README.md          # Documentação do projeto
```

---

## 💻 Como Rodar Localmente

Siga as instruções abaixo para configurar e executar o projeto no seu ambiente de desenvolvimento.

### 1. Clonar o Repositório
Abra o seu terminal e execute os comandos abaixo para baixar o código e entrar na pasta do projeto:

```bash
git clone [https://github.com/EldinhoJBL/car-advisor-pro.git](https://github.com/EldinhoJBL/car-advisor-pro.git)
cd car-advisor-pro
```

### 2. Instalar Dependências (Frontend)
Com o Node.js instalado na sua máquina, instale os pacotes necessários da interface:

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo chamado `.env` na raiz do projeto e configure as suas chaves de API e banco de dados:

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
VITE_GEMINI_API_KEY=sua_chave_ia_aqui
```

### 4. Iniciar o Servidor
Inicie a aplicação em modo de desenvolvimento:

```bash
npm run dev
```

---

## 👥 Equipe de Desenvolvimento (Grupo DealerData)

Conheça os membros responsáveis pela engenharia e arquitetura do ecossistema:

* 🧑‍💻 **Elder Gomes**
* 🧑‍💻 **Erlan Moura**
* 🧑‍💻 **Halysson Silva**
* 🧑‍💻 **Vinicius Gabriel**
```
