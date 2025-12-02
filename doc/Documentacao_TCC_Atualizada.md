UNIVERSIDADE FEDERAL DO PARANÁ

BRUNO BRUGNEROTTO DE LARA
GABRIEL FRANCELINO VOIDALESKI
PEDRO HENRIQUE LOPES

APPUNTURE

CURITIBA
2025

AUTORES
BRUNO BRUGNEROTTO DE LARA
GABRIEL FRANCELINO VOIDALESKI
PEDRO HENRIQUE LOPES

ESPECIFICAÇÃO TÉCNICA DO SISTEMA

O Appunture é um sistema multiplataforma de suporte à acupuntura composto por um aplicativo móvel offline-first, desenvolvido em React Native com Expo, um backend robusto em Java 17 com Spring Boot 3.2 e um painel administrativo web em React. A arquitetura utiliza Google Firestore como banco de dados principal e SQLite para persistência local no mobile, integrando autenticação via Firebase e um módulo de Inteligência Artificial Generativa (Spring AI + Google Gemini) para assistência clínica contextualizada.

Orientador(a): Prof(a). Dr(a). Paulo Sobreira Moraes

CURITIBA
2025

RESUMO

O aplicativo Appunture tem como objetivo oferecer suporte técnico, educativo e visual para profissionais e estudantes da área de acupuntura, promovendo uma prática mais segura, padronizada e alinhada às exigências legais e sanitárias brasileiras. Em um cenário marcado pela ausência de regulamentação federal clara, disputas entre conselhos profissionais e formação heterogênea, o Appunture surge como uma solução inovadora que facilita o acesso a informações de qualidade sobre os pontos de acupuntura corporal.

A plataforma foi desenvolvida para Android, iOS e Web, apresentando um modelo anatômico interativo baseado em um atlas de 15 visualizações vetoriais (SVG) de alta fidelidade, organizadas por meridianos e vistas (frontal e posterior). O sistema conta com funcionalidades de busca avançada, detalhes técnicos de 361 pontos, e um assistente inteligente integrado que utiliza Inteligência Artificial Generativa para correlacionar sintomas e sugerir protocolos baseados em evidências.

A prática da acupuntura envolve desafios complexos, como a subjetividade diagnóstica da Medicina Tradicional Chinesa (MTC), a necessidade de protocolos rigorosos de biossegurança e a fiscalização insuficiente. O Appunture contribui diretamente nesses pontos ao fornecer informações padronizadas, baseadas em diretrizes da Organização Mundial da Saúde (OMS).

O desenvolvimento seguiu uma arquitetura híbrida com estratégia "offline-first", garantindo acesso total aos dados mesmo sem conexão à internet, com sincronização automática quando online. Para garantir a precisão dos dados anatômicos, foi desenvolvida uma ferramenta proprietária de mapeamento de pontos, assegurando a exatidão das coordenadas em relação às estruturas corporais.

Palavras-chave: Acupuntura, Appunture, MTC, Práticas Integrativas, Saúde, Biossegurança, Inteligência Artificial, Spring AI.

ABSTRACT

The Appunture application aims to provide technical, educational, and visual support for professionals and students in the field of acupuncture. The platform features an interactive anatomical model based on a high-fidelity atlas of 15 vector views (SVG), organized by meridians. The system includes advanced search functionalities, technical details of 361 points, and an intelligent assistant powered by Generative AI (Spring AI + Google Gemini) to correlate symptoms and suggest evidence-based protocols.

Developed with a hybrid "offline-first" architecture using React Native and Java Spring Boot, the application ensures full data access even without internet connection, with automatic synchronization. To ensure anatomical accuracy, a proprietary point mapping tool was developed to precisely locate acupuncture points on the digital atlas.

Keywords: Acupuncture, Appunture, TCM, Integrative Health, Biosafety, Artificial Intelligence, Spring AI.

SUMÁRIO

1 INTRODUÇÃO
1.1 OBJETIVOS
2 FUNDAMENTAÇÃO TEÓRICA
3 MOTIVAÇÕES
4 TECNOLOGIAS E ARQUITETURA DO SISTEMA
4.1 Visão Geral da Arquitetura
4.2 Arquitetura Híbrida (Offline + Online)
4.3 Stack Tecnológico Detalhado
4.4 Inteligência Artificial e Assistência Clínica
4.5 Ferramentas de Desenvolvimento e Mapeamento
5 METODOLOGIA
6 APRESENTAÇÃO DO SISTEMA
7 CONSIDERAÇÕES FINAIS

---

1 INTRODUÇÃO

(Texto mantido conforme original, focado na contextualização da acupuntura no Brasil e a necessidade de ferramentas digitais).

1.1 OBJETIVOS

O principal objetivo deste projeto é desenvolver e implementar o aplicativo Appunture, uma ferramenta digital educativa e interativa voltada à prática da acupuntura.

Entre os objetivos específicos, destacam-se:

● Visualização Didática e Interativa dos Pontos: Oferecer um atlas anatômico digital composto por 15 visualizações vetoriais (SVG) de alta resolução, cobrindo vistas frontais e posteriores e todos os meridianos principais, permitindo interação precisa e responsiva.
● Assistência Clínica com Inteligência Artificial: Implementar um módulo de IA Generativa (RAG - Retrieval-Augmented Generation) utilizando Spring AI e Google Gemini, capaz de interpretar perguntas complexas sobre sintomas e tratamentos, fornecendo respostas contextualizadas com a base de dados técnica do sistema.
● Apoio à Formação Multiprofissional: Disponibilizar conteúdos adaptados aos diferentes níveis de formação.
● Organização Estruturada de Informações Terapêuticas: Base de dados completa dos 361 pontos clássicos e pontos extras.
● Sincronização de Dados e Suporte Offline: Arquitetura "Offline-First" robusta, permitindo operação plena sem internet.
● Ferramenta de Mapeamento de Precisão: Desenvolvimento de uma ferramenta web interna para mapeamento manual e validação das coordenadas de todos os pontos de acupuntura sobre os mapas vetoriais.
● Gestão e Atualização de Conteúdo via Painel Administrativo Web.

---

2 FUNDAMENTAÇÃO TEÓRICA

(Texto mantido conforme original sobre Acessibilidade, Tecnologias Digitais e Comparativos).

---

3 MOTIVAÇÕES

(Texto mantido conforme original sobre Regulamentação, Formação, Segurança e Diagnóstico).

---

4 TECNOLOGIAS E ARQUITETURA DO SISTEMA

Este capítulo apresenta o stack tecnológico utilizado no desenvolvimento do Appunture, detalhando a arquitetura do sistema, as tecnologias empregadas e as decisões técnicas que fundamentam a implementação da solução.

4.1 Visão Geral da Arquitetura

O Appunture foi desenvolvido seguindo uma arquitetura híbrida distribuída, composta por:

- Aplicativo Móvel (React Native + Expo): Interface principal "Offline-First".
- API Backend (Java + Spring Boot): Servidor de aplicação e Inteligência Artificial.
- Interface Web Administrativa (React): Gestão de conteúdo.
- Ferramentas de Apoio (Python/HTML): Scripts de migração e ferramenta de mapeamento.

  4.2 Arquitetura Híbrida (Offline + Online)

  4.2.1 Funcionamento Offline Completo
  O aplicativo móvel utiliza SQLite para armazenar localmente todos os dados de pontos, meridianos e sintomas, garantindo performance instantânea e independência de rede. O sistema de cache MMKV gerencia estados de sessão e preferências.

  4.2.2 Sincronização Inteligente
  Sincronização bidirecional automática quando há conexão, atualizando a base local com novos dados do servidor (Firestore) e enviando dados do usuário (favoritos, anotações) para a nuvem.

  4.3 Stack Tecnológico Detalhado

  4.3.1 Frontend Mobile (React Native + Expo)

- React Native 0.72+ com Expo SDK 49+.
- Expo Router para navegação baseada em arquivos.
- Renderização de SVGs otimizada para o atlas anatômico.

  4.3.2 Backend API (Java + Spring Boot)

- Java 17 LTS e Spring Boot 3.2+.
- Spring AI: Framework para integração com modelos de IA.
- Spring Security + Firebase Auth: Segurança robusta.
- Firestore: Banco de dados NoSQL principal.

  4.3.3 Banco de Dados

- SQLite (Local): Persistência no dispositivo móvel.
- Google Cloud Firestore (Remoto): Base de dados centralizada e escalável.

  4.4 Inteligência Artificial e Assistência Clínica

Diferente de abordagens tradicionais baseadas apenas em palavras-chave, o Appunture implementa um sistema de RAG (Retrieval-Augmented Generation) no backend:

- Modelo: Google Gemini 1.5 Flash via Spring AI.
- Funcionamento: O sistema intercepta a pergunta do usuário, busca contexto relevante na base de dados (pontos e sintomas relacionados) e envia um prompt enriquecido para o modelo de IA.
- Benefício: Respostas clinicamente precisas, baseadas nos dados validados do sistema, reduzindo alucinações e aumentando a confiabilidade.

  4.5 Ferramentas de Desenvolvimento e Mapeamento

Para garantir a precisão da localização dos pontos, foi desenvolvida uma ferramenta interna ("Point Mapper"):

- Interface Web para visualização dos 15 SVGs do atlas.
- Sistema de coordenadas percentuais para garantir responsividade em diferentes tamanhos de tela.
- Scripts Python para integração e validação dos dados gerados no banco de dados principal.

---

5 METODOLOGIA

5.1 METODOLOGIA DE DESENVOLVIMENTO
Utilização de Scrum com sprints semanais.

5.2 MODELAGEM DO PROJETO
A modelagem de dados considera a estrutura documental do Firestore sincronizada com tabelas relacionais do SQLite.

5.3 Atlas Anatômico Digital
O sistema de mapas corporais foi estruturado em 15 camadas vetoriais (SVG), divididas por meridianos e vistas (Frontal e Posterior), permitindo:

- Zoom sem perda de qualidade.
- Interação precisa (toque) em áreas pequenas.
- Carga sob demanda das imagens para otimizar memória.

---

6 APRESENTAÇÃO DO SISTEMA

6.1 Arquitetura do Sistema
(Diagramas atualizados).

6.2 AUTENTICAÇÃO E SEGURANÇA
Login via Firebase Auth, com suporte a biometria no dispositivo móvel.

6.3 FUNCIONALIDADES PRINCIPAIS
6.3.1 Mapa Anatômico Interativo: Navegação fluida entre os 12 meridianos principais e vasos extraordinários.
6.3.2 Detalhes dos Pontos: Fichas completas com localização, função, indicação e precauções.
6.3.3 Assistente IA: Chatbot integrado para tirar dúvidas clínicas e sugerir correlações.
6.3.4 Modo Offline: Acesso total sem internet.

6.4 PAINEL ADMINISTRATIVO WEB
Permite o cadastro de novos pontos e a gestão da base de conhecimento que alimenta a IA.

---

7 CONSIDERAÇÕES FINAIS

O Appunture representa um avanço significativo na tecnologia aplicada à acupuntura, unindo a tradição milenar da MTC com tecnologias de ponta como Inteligência Artificial Generativa e arquiteturas móveis modernas. A solução atende à demanda por ferramentas confiáveis, seguras e acessíveis, contribuindo para a qualificação profissional e segurança do paciente no Brasil.
