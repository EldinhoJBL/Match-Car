# 🚗 MatchCar: Inteligência Analítica para Seminovos
## DealerData Castanhal — Wcar Veículos

![Status do Projeto](Em andamento)

O **MatchCar** é um ecossistema de recomendação inteligente desenvolvido especificamente para a **Wcar Veículos** (Castanhal/PA). O sistema utiliza arquitetura de Big Data e Inteligência Artificial para conectar o perfil socioeconómico do cliente ao veículo ideal em stock, otimizando a conversão de vendas e acelerando o giro de pátio.

---

## 🔗 [Link da Aplicação](Em desenvolvimento)

---

## ✨ Funcionalidades Principais

* **Recomendação Preditiva:** Algoritmo que identifica a melhor opção de seminovo com base no perfil do comprador (Renda, Profissão, Idade).
* **Justificativa por IA:** Argumentos de venda personalizados gerados pelo Gemini AI para auxiliar os consultores.
* **Gestão de Stock Real-time:** Dashboard administrativo restrito para controle total de ativos e monitorização de leads.
* **Interface Cliente Fluida:** Interface optimizada para captura de dados e conversão via WhatsApp.

## 🛠️ Stack Tecnológica

O projeto utiliza uma arquitetura híbrida para garantir escalabilidade e performance:

* **Inteligência Artificial:** Google Gemini AI (Motor de recomendações comportamentais).
* **Big Data:** Python & Apache Spark (Processamento massivo e análise exploratória).
* **Frontend & Interface:** React, TypeScript e Tailwind CSS (Desenvolvido via Lovable.dev).
* **Backend & Persistência:** Supabase (Base de dados PostgreSQL e Autenticação).
* **Infraestrutura:** Lovable (Hospedagem de alta performance).
* **Prototipagem:** Google Colab.

## 🧠 Arquitetura DealerData

Diferente de filtros de pesquisa convencionais, o MatchCar opera numa camada de inteligência analítica:
1.  **Ingestão:** Os dados do lead são capturados via interface React.
2.  **Processamento:** A lógica validada em Spark cruza as variáveis com as especificações técnicas do stock.
3.  **Inferência:** O Gemini AI analisa o *score* de afinidade e redige a recomendação ideal.
4.  **Entrega:** O lojista recebe um lead qualificado com a sugestão pronta para o fecho.

## 📁 Estrutura do Repositório

```text
├── src/               # Código-fonte da aplicação React/TypeScript
├── supabase/          # Migrações e políticas do banco de dados
├── public/            # Ativos estáticos e capturas de ecrã
├── .lovable/          # Histórico e instruções de automação
├── .env.example       # Modelo para variáveis de ambiente
└── README.md          # Documentação do projeto


👥 Equipe de Desenvolvimento (Grupo DealerData)








💻 Como Rodar Localmente
Clonar o repositório:

Bash
git clone [https://github.com/EldinhoJBL/car-advisor-pro.git](https://github.com/EldinhoJBL/car-advisor-pro.git)
Instalar Dependências:

Bash
npm install
Configurar Variáveis de Ambiente:
Crie um ficheiro .env com as suas chaves:

Plaintext
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
VITE_GEMINI_API_KEY=sua_chave_ia_aqui
Iniciar o Ambiente:

Bash
npm run dev
