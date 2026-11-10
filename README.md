# AvaliWeb 🌐

## Tópicos

- [Descrição](#descricao)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Funcionalidades](#funcionalidades)
- [Critérios de Avaliação](#criterios-de-avaliacao)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Requisitos do Sistema](#requisitos-do-sistema)
- [Instalação](#instalacao)
- [Como Utilizar](#como-utilizar)
- [Sistema de Pontuação](#sistema-de-pontuacao)
- [Relatório de Avaliação](#relatorio-de-avaliacao)
- [Testes e Validação](#testes-e-validacao)
- [Segurança e Armazenamento de Dados](#seguranca-e-armazenamento-de-dados)
- [Limitações](#limitacoes)
- [Desenvolvedor](#desenvolvedor)
- [Licença](#licenca)

---

<a id="descricao"></a>
## 📖 Descrição

O **AvaliWeb** é uma extensão para navegadores baseados em Chromium, desenvolvida para realizar avaliações automatizadas de interfaces web. A ferramenta analisa páginas da web a partir de critérios relacionados à acessibilidade, usabilidade, design e responsividade.

O projeto tem como objetivo auxiliar desenvolvedores e profissionais de tecnologia na identificação de possíveis problemas em interfaces, apresentando resultados organizados por categoria, evidências encontradas e recomendações de melhoria.

A extensão permite realizar avaliações tanto na página aberta na aba atual do navegador quanto por meio de uma URL informada pelo usuário.

O AvaliWeb foi desenvolvido como projeto acadêmico, aplicando conceitos de desenvolvimento de software, avaliação de interfaces e experiência do usuário (UX).

---

<a id="arquitetura-do-sistema"></a>
## 🏗 Arquitetura do Sistema

O AvaliWeb foi desenvolvido como uma extensão de navegador utilizando Manifest V3 e organizado em módulos responsáveis pela interface, comunicação com o navegador e execução dos critérios de avaliação.

O funcionamento geral pode ser representado pelas seguintes etapas:

```text
Usuário
   │
   ▼
Interface da Extensão
   │
   ├── Análise da página atual
   │
   └── Análise por URL informada
           │
           ▼
     Service Worker
           │
           ▼
     Injeção dos scripts
           │
           ▼
     Módulos de avaliação
           │
           ├── Acessibilidade
           ├── Usabilidade
           ├── Design
           └── Responsividade
           │
           ▼
     Processamento dos resultados
           │
           ▼
     Relatório de avaliação
           │
           ▼
     Exibição ao usuário
```

Na análise por URL, a extensão utiliza uma aba temporária para carregar a página informada, executar a avaliação e obter os resultados. Após a conclusão do processo, a aba temporária é removida.

---

<a id="funcionalidades"></a>
## ⚙ Funcionalidades

- **Análise da página atual:** avalia a interface da página aberta na aba ativa do navegador.
- **Análise por URL:** permite informar um endereço HTTP ou HTTPS para realizar a avaliação.
- **Avaliação automatizada:** executa os 32 critérios definidos no projeto, sem necessidade de selecionar critérios individualmente.
- **Avaliação por categorias:** organiza os resultados em acessibilidade, usabilidade, design e responsividade.
- **Pontuação:** apresenta notas individuais para os critérios e médias para as categorias.
- **Identificação de problemas:** apresenta evidências e elementos relacionados aos resultados encontrados.
- **Recomendações:** fornece orientações para auxiliar na correção dos problemas identificados.
- **Relatório detalhado:** reúne os resultados da análise em uma visualização organizada.
- **Impressão e exportação:** permite utilizar a janela de impressão do navegador para salvar o relatório em PDF.

---

<a id="criterios-de-avaliacao"></a>
## 📋 Critérios de Avaliação

O AvaliWeb possui **32 critérios de avaliação**, distribuídos em quatro categorias.

| Categoria | Identificação | Quantidade |
|---|---|---:|
| Acessibilidade | A01 a A16 | 16 |
| Usabilidade | U01 a U07 | 7 |
| Design | D01 a D05 | 5 |
| Responsividade | R01 a R04 | 4 |
| **Total** | | **32** |

Os critérios foram definidos para verificar diferentes aspectos das interfaces web, considerando características que podem ser analisadas de forma automatizada.

---

<a id="tecnologias-utilizadas"></a>
## 🛠 Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| **Estrutura da extensão** | Chrome Extensions Manifest V3 |
| **Front-end** | HTML, CSS e JavaScript |
| **Integração com o navegador** | Chrome Extensions API |
| **Execução e comunicação** | Service Worker e scripts injetados |
| **Armazenamento** | Chrome Storage API |
| **Desenvolvimento** | Visual Studio Code |
| **Versionamento** | Git e GitHub |

---

<a id="requisitos-do-sistema"></a>
## 💻 Requisitos do Sistema

- **Google Chrome** ou navegador compatível com extensões baseadas em Chromium e Manifest V3.
- **Conexão com a internet** para acessar e avaliar páginas hospedadas na web.
- **Sistema operacional** compatível com o navegador utilizado.
- Permissão para instalar e executar extensões no navegador.

**Ambiente utilizado nos testes do projeto:**

- Windows 10 Pro 22H2.
- Google Chrome 157.0.8103.39 (64 bits).

---

<a id="instalacao"></a>
## 🚀 Instalação

Para instalar a extensão localmente, siga as etapas abaixo:

### 1. Clonar o repositório

```bash
git clone https://github.com/luizrodrigox/AvaliWeb.git
```

### 2. Entrar na pasta do projeto

```bash
cd AvaliWeb
```

### 3. Abrir o gerenciador de extensões

No Google Chrome, acesse:

```text
chrome://extensions/
```

### 4. Ativar o modo do desenvolvedor

Ative a opção **Modo do desenvolvedor**, localizada no canto superior direito da página de extensões.

### 5. Carregar a extensão

1. Clique em **Carregar sem compactação**.
2. Localize a pasta raiz do projeto AvaliWeb, onde está localizado o arquivo `manifest.json`.
3. Selecione essa pasta.
4. Aguarde o carregamento da extensão.

Após a instalação, o ícone do AvaliWeb estará disponível na área de extensões do navegador.

---

<a id="como-utilizar"></a>
## 🖱 Como Utilizar

O AvaliWeb oferece duas formas de iniciar uma avaliação.

### Analisar a página atual

1. Acesse a página web que deseja avaliar.
2. Clique no ícone da extensão AvaliWeb.
3. Solicite a análise da página atual.
4. Aguarde a execução dos critérios.
5. Visualize os resultados gerais apresentados.
6. Consulte os resultados detalhados a partir do relatório. 

### Analisar por URL

1. Clique no ícone da extensão AvaliWeb.
2. Informe o endereço da página que deseja avaliar.
3. Solicite a análise.
4. Aguarde o carregamento da página e a execução dos critérios.
5. Visualize os resultados gerais apresentados.
6. Consulte os resultados detalhados a partir do relatório.

O endereço informado deve utilizar os protocolos HTTP ou HTTPS e estar acessível pelo navegador.

---

<a id="sistema-de-pontuacao"></a>
## 📊 Sistema de Pontuação

O sistema apresenta notas individuais para cada critério e calcula uma média para cada categoria avaliada.

A média de cada categoria é calculada a partir das notas dos critérios correspondentes, com resultado apresentado com uma casa decimal.

**Observação:** quando um critério não encontra elementos aplicáveis na página analisada, pode receber pontuação 10. Portanto, essa nota não deve ser interpretada isoladamente como uma garantia de conformidade ou qualidade da interface.

---

<a id="relatorio-de-avaliacao"></a>
## 📄 Relatório de Avaliação

Ao concluir uma análise, o AvaliWeb apresenta um relatório contendo:

- Pontuação geral organizada por categorias.
- Resultados individuais dos critérios.
- Evidências identificadas durante a avaliação.
- Elementos da página relacionados aos resultados.
- Recomendações para possíveis melhorias.

O relatório pode ser impresso ou salvo em PDF por meio da funcionalidade de impressão do navegador. Para isso, selecione **Salvar como PDF** na janela de impressão do Google Chrome.

---

<a id="testes-e-validacao"></a>
## 🧪 Testes e Validação

Durante o desenvolvimento, os 32 critérios foram testados individualmente em três cenários distintos:

| Cenário | Descrição |
|---|---|
| **Correto** | Página preparada para atender ao critério avaliado. |
| **Incorreto** | Página preparada para apresentar uma situação que não atende ao critério. |
| **Vazio** | Página sem elementos aplicáveis ao critério avaliado. |

Ao todo, foram utilizados **96 cenários de teste**, correspondentes aos 32 critérios avaliados nos três cenários.

Também foram realizados testes dos dois fluxos de análise:

- Avaliação da página aberta na aba atual.
- Avaliação por URL informada pelo usuário, incluindo endereços válidos e inválidos ou inacessíveis.

Os testes foram repetidos após os ajustes necessários, verificando se os resultados apresentados correspondiam ao comportamento esperado.

---

<a id="seguranca-e-armazenamento-de-dados"></a>
## 🔐 Segurança e Armazenamento de Dados

O AvaliWeb não utiliza um servidor próprio ou banco de dados remoto para processar e armazenar os resultados das avaliações.

As principais características são:

- **Armazenamento local:** utiliza a Chrome Storage API para armazenar os dados da última análise.
- **Sem histórico completo:** a extensão não mantém um histórico de todas as avaliações realizadas.
- **Sem conta de usuário:** não exige cadastro ou autenticação para utilização.
- **Processamento pela extensão:** os resultados da avaliação não são enviados para um servidor próprio do projeto.

Ao avaliar uma URL, o navegador precisa acessar o endereço informado para carregar a página. Assim, as requisições normais necessárias para acessar o site continuam ocorrendo.

---

<a id="limitacoes"></a>
## ⚠ Limitações

O AvaliWeb realiza verificações automatizadas com base nos critérios implementados. Dessa forma, seus resultados devem ser utilizados como apoio à avaliação das interfaces, e não como substituição de uma análise especializada.

Alguns aspectos de acessibilidade, usabilidade e experiência do usuário dependem de avaliação manual, testes com tecnologias assistivas e participação de usuários reais.

Além disso, a pontuação apresentada representa o resultado das verificações realizadas pela ferramenta e não constitui uma certificação formal de conformidade.

---

<a id="desenvolvedor"></a>
## 👨‍💻 Desenvolvedor

**Luiz Rodrigo Melo de Freitas Junior**

- GitHub: [@luizrodrigox](https://github.com/luizrodrigox)
- LinkendIn: [Luiz Rodrigo](https://www.linkedin.com/in/luiz-rodrigo-868311230/)

---

<a id="licenca"></a>
## 📄 Licença

Este projeto está licenciado sob a **MIT License**.

Você pode usar, copiar, modificar e distribuir o projeto, desde que mantenha os avisos de direitos autorais e a licença original.
