# TCC Appunture - Modelo abnTeX2 UFPR

## Estrutura do Projeto

Este projeto contém a documentação do TCC **APPUNTURE: Sistema Multiplataforma de Suporte à Acupuntura** formatado segundo as normas ABNT utilizando o modelo abnTeX2 customizado para a UFPR.

## Arquivos do Projeto

```
tcc-appunture/
├── main.tex                 # Arquivo principal (compilar este)
├── 00-dados.tex            # Dados do trabalho (título, autor, resumo, etc.)
├── 00-pacotes.tex          # Pacotes LaTeX necessários
├── 00-pretextual.tex       # Elementos pré-textuais
├── UFPR.sty                # Estilo UFPR
├── referencias.bib         # Referências bibliográficas
├── cap01-introducao.tex    # Capítulo 1 - Introdução
├── cap02-fundamentacao.tex # Capítulo 2 - Fundamentação Teórica
├── cap03-motivacoes.tex    # Capítulo 3 - Motivações
├── cap04-tecnologias.tex   # Capítulo 4 - Tecnologias e Arquitetura
├── cap05-metodologia.tex   # Capítulo 5 - Metodologia
├── cap06-apresentacao.tex  # Capítulo 6 - Apresentação do Sistema
├── cap07-consideracoes.tex # Capítulo 7 - Considerações Finais
├── apendices.tex           # Apêndices
├── anexos.tex              # Anexos
├── fig/                    # Pasta para figuras
└── metadados/              # Pasta para ficha catalográfica e termo de aprovação
```

## Instruções para Compilação

### No Overleaf

1. Faça upload de todos os arquivos para um novo projeto no Overleaf
2. Certifique-se de que o compilador está configurado para **pdfLaTeX**
3. Configure o processador de bibliografia para **Biber**
4. Compile o arquivo `main.tex`

### Localmente

1. Certifique-se de ter uma distribuição LaTeX instalada (TeX Live, MiKTeX)
2. Execute os seguintes comandos:

```bash
pdflatex main.tex
biber main
pdflatex main.tex
pdflatex main.tex
```

## Configurações Importantes

### Arquivo 00-dados.tex

Edite este arquivo para personalizar:

- Título do trabalho
- Nomes dos autores
- Nome do orientador
- Resumo e Abstract
- Palavras-chave
- Agradecimentos
- Configurações das partes do documento (Sim/Nao)

### Adicionando Figuras

1. Coloque os arquivos de imagem na pasta `fig/`
2. Use o comando `\figura` para inserir figuras:

```latex
\figura
{TÍTULO DA FIGURA}           % Título
{0.8}                        % Largura (% da linha)
{fig/nome-arquivo.png}       % Caminho da figura
{Os autores (2025)}          % Fonte
{label-figura}               % Label para referência
{}                           % Nota (opcional)
{}                           % Legenda (opcional)
```

### Referenciando Elementos

- Figuras: `\autoref{fig:label-figura}`
- Tabelas: `\autoref{tab:label-tabela}`
- Quadros: `\autoref{qua:label-quadro}`
- Capítulos: `\autoref{cha:label-capitulo}`
- Seções: `\autoref{sec:label-secao}`

### Citações

- Citação indireta: `\citeonline{autor2023}`
- Citação direta: `\cite{autor2023}`

## Elementos Opcionais

No arquivo `00-dados.tex`, configure `Sim` ou `Nao` para:

- `\terCapa` - Capa
- `\terFolhaRosto` - Folha de rosto
- `\terTermoAprovacao` - Termo de aprovação
- `\terDedicatoria` - Dedicatória
- `\terFichaCatalografica` - Ficha catalográfica
- `\terEpigrafe` - Epígrafe
- `\terAgradecimentos` - Agradecimentos
- `\terErrata` - Errata
- `\terListaFiguras` - Lista de figuras
- `\terListaQuadros` - Lista de quadros
- `\terListaTabelas` - Lista de tabelas
- `\terSiglasAbrev` - Lista de siglas
- `\terSimbolos` - Lista de símbolos
- `\terResumos` - Resumos
- `\terSumario` - Sumário
- `\terApendice` - Apêndices
- `\terAnexo` - Anexos

## Autores

- Bruno Brugnerotto de Lara
- Gabriel Francelino Voidaleski
- Pedro Henrique Lopes

**Orientador:** Prof. Dr. Paulo Sobreira Moraes

**Universidade Federal do Paraná - 2025**

## Referências

- [abnTeX2](https://www.abntex.net.br/)
- [Modelo UFPR abnTeX2](https://github.com/eekBR/ufpr-abntex/)
