# 🚗 MatchCar: Inteligência Analítica para Seminovos
## DealerData Castanhal — Wcar Veículos

![Status do Projeto](https://img.shields.io/badge/Status-Em_Andamento-blue?style=flat-square)
[![Acessar Aplicação](https://img.shields.io/badge/Acessar_Aplicação-match--car.lovable.app-0052FF?style=flat-square&logo=vercel&logoColor=white)](https://match-car.lovable.app)

O **MatchCar** é um ecossistema de recomendação inteligente desenvolvido especificamente para a **Wcar Veículos** (Castanhal/PA). O sistema utiliza arquitetura de Big Data e Inteligência Artificial para conectar o perfil socioeconômico do cliente ao veículo ideal em estoque, otimizando a conversão de vendas e acelerando o giro de pátio.

---

## ✨ Funcionalidades Principais

* **Recomendação Preditiva:** Algoritmo de Machine Learning que identifica a melhor opção de seminovo com base no perfil do comprador (Renda, Profissão, Idade).
* **🎯 Lógica de Prioridade de Estoque:** Algoritmo inteligente que prioriza veículos do estoque físico real (Manual) da Wcar Veículos antes de exibir sugestões genéricas do sistema.
* **Justificativa por IA:** Argumentos de venda e *pitches* comerciais altamente personalizados gerados pelo Gemini AI para auxiliar os consultores.
* **Gestão de Estoque Real-time:** Dashboard administrativo restrito para controle total de ativos e monitoramento de leads.
* **Interface Cliente Fluida:** Interface otimizada para captura de dados e conversão via WhatsApp.

## 🛠️ Stack Tecnológica

O projeto utiliza uma arquitetura híbrida para garantir escalabilidade e performance:

* **Machine Learning & Inteligência Artificial:** `scikit-learn` (Modelo Random Forest Classifier para predição de categoria) e Google Gemini AI `gemini-1.5-flash` (Geração de argumentos de vendas).
* **Backend & API Engine:** Python, Flask e `pyngrok` (Criação da API e tunelamento para acesso externo).
* **Big Data & Dados:** Python, Apache Spark & Pandas (Processamento massivo e inteligência de dados).
* **Frontend & Interface:** React, TypeScript e Tailwind CSS (Desenvolvido via Lovable.dev).
* **Backend de Persistência:** Supabase (Base de dados PostgreSQL e Autenticação).
* **Infraestrutura:** Lovable (Hospedagem de alta performance).
* **Prototipagem:** Google Colab.

## 🧠 Arquitetura DealerData

Diferente de filtros de pesquisa convencionais, o MatchCar opera numa camada de inteligência analítica:
1. **Ingestão:** Os dados do lead (idade, renda, profissão) são capturados via interface React no Lovable.
2. **Processamento da Engine (API):** A API Flask recebe os dados e utiliza o modelo **Random Forest** (pré-treinado e normalizado com `StandardScaler` e `TfidfVectorizer`) para prever com precisão a categoria ideal de carro.
3. **Filtro de Prioridade:** O sistema varre o estoque e calcula pesos matemáticos para garantir que modelos de **Origem Manual** (pátio físico da loja) tenham prioridade máxima de exibição.
4. **Inferência Adaptativa:** O motor se conecta à API do Gemini AI para gerar um texto de vendas customizado para o perfil do cliente. O sistema possui resiliência com tratamento de erros (`try/except`) para garantir estabilidade caso a IA fique fora do ar.
5. **Entrega:** O lojista recebe um lead qualificado na tela com o veículo ideal e a sugestão de abordagem pronta para o fechamento via WhatsApp.

## 📁 Estrutura do Repositório

```text
├── src/               # Interface frontend (Aplicação React/TypeScript)
├── engine/            # API Flask (Motor de inteligência, Machine Learning e Spark)
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

### 4. Iniciar o Servidor Frontend
Inicie a aplicação em modo de desenvolvimento:

```bash
npm run dev
```

### 5. Executar a Engine de IA (Backend)
Abra o arquivo da API localizado na pasta `/engine` dentro do seu ambiente Python (ou Google Colab), configure o seu `NGROK_AUTH_TOKEN` e execute o script para disponibilizar o ponto de acesso `/api/recomendar`.

---

## 👥 Equipe de Desenvolvimento (Grupo DealerData)

Conheça os membros responsáveis pela engenharia e arquitetura do ecossistema:

* 🧑‍💻 **Elder Gomes**
* 🧑‍💻 **Erlan Moura**
* 🧑‍💻 **Halysson Silva**
* 🧑‍💻 **Vinicius Gabriel**
```
