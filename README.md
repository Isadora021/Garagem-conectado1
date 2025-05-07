# Garagem Inteligente Unificada

Este projeto demonstra a evolução de uma aplicação de gerenciamento de garagem ("Garagem Inteligente"), integrando-a com uma fonte de dados externa simulada (JSON local) para detalhes veiculares e com a API real (OpenWeatherMap) para previsão do tempo detalhada (múltiplos dias), auxiliando no planejamento de viagens.

O foco principal é a aplicação prática de requisições assíncronas (fetch, async/await), manipulação de dados JSON complexos e atualização dinâmica da interface do usuário (DOM), com uma discussão importante sobre segurança de chaves de API.

## Funcionalidades

1.  **Gerenciamento Básico da Garagem:**
    *   Adicionar novos veículos (Placa, Modelo, Marca, Ano, Cor).
    *   Visualizar a lista de veículos cadastrados.
    *   Remover veículos da garagem.
    *   Persistência dos dados usando LocalStorage.

2.  **Detalhes Extras do Veículo (API Simulada):**
    *   Um botão "Ver Detalhes Extras" é exibido para cada veículo na garagem.
    *   Ao clicar, a aplicação busca informações adicionais (Valor FIPE, Recall, Próxima Revisão, Dica) de um arquivo JSON local (`dados_veiculos_api.json`) usando `fetch`.
    *   A interface exibe mensagens de "Carregando...", os detalhes encontrados, ou mensagens de erro/não encontrado.

3.  **Planejador de Viagem com Previsão do Tempo Detalhada (API Real - OpenWeatherMap):**
    *   Uma seção dedicada permite ao usuário digitar o nome de uma cidade de destino.
    *   Ao clicar em "Verificar Clima" (ou pressionar Enter), a aplicação consulta o endpoint **"5 day / 3 hour forecast"** da API OpenWeatherMap para obter a previsão do tempo para os próximos dias.
    *   Os dados recebidos (previsões a cada 3 horas) são processados para gerar um resumo diário (temperatura mínima, máxima, descrição geral e ícone representativo).
    *   A interface exibe "Buscando previsão...", a previsão detalhada dia a dia, ou mensagens de erro (cidade não encontrada, chave de API inválida, etc.).

## Tecnologias Utilizadas

*   HTML5
*   CSS3 (com Flexbox e Grid para layout, incluindo design responsivo para a previsão)
*   JavaScript (ES6+):
    *   Manipulação do DOM
    *   Programação Orientada a Objetos (Classe `Veiculo`)
    *   LocalStorage para persistência de dados
    *   Requisições Assíncronas (`fetch`, `async/await`)
    *   Manipulação de JSON (incluindo processamento de arrays complexos)
    *   Tratamento de Erros (`try...catch`)

## Como Executar

1.  Clone este repositório:
    ```bash
    git clone <url-do-repositorio>
    cd <diretorio-do-projeto>
    ```
2.  **IMPORTANTE: Configurar a Chave da API OpenWeatherMap:**
    *   **Obtenha sua chave:**
        *   Acesse [https://openweathermap.org/](https://openweathermap.org/).
        *   Crie uma conta gratuita (pode precisar confirmar o e-mail).
        *   Vá para a seção "API keys" no seu painel de usuário.
        *   Copie a sua "Default" API key (ou crie uma nova se necessário).
    *   **Adicione a chave ao código:**
        *   Abra o arquivo `script.js`.
        *   Encontre a linha que contém: `const OPENWEATHER_API_KEY = "SUA_CHAVE_COPIADA_AQUI";`
        *   Substitua `"SUA_CHAVE_COPIADA_AQUI"` (ou o valor atual, como `"b135fb2ad23b177010dd70f5cd1cfff0"`) pela sua chave pessoal que você copiou do OpenWeatherMap.
    *   **⚠️ AVISO DE SEGURANÇA CRÍTICO ⚠️:**
        *   Colocar chaves de API diretamente no código JavaScript do lado do cliente (frontend) é **extremamente inseguro** para aplicações reais. Qualquer pessoa pode ver sua chave inspecionando o código fonte da página no navegador.
        *   **PARA ESTE EXERCÍCIO DIDÁTICO, esta abordagem simplificada é usada com o entendimento de que é uma má prática em produção.**
        *   **A maneira correta e segura** envolve o uso de um **backend (servidor)** que atua como um *proxy*. Seu frontend faria uma requisição para o seu próprio backend, e o backend (onde a chave da API está armazenada de forma segura, por exemplo, em variáveis de ambiente) faria a chamada para a API externa (OpenWeatherMap). Outra alternativa são *Serverless Functions*.
        *   Certifique-se de que o arquivo `.env` (se você o utiliza para guardar a chave localmente durante o desenvolvimento com um servidor Node.js) esteja listado no seu `.gitignore` para não enviá-lo acidentalmente para o GitHub. No entanto, para este projeto puramente frontend, a chave precisa estar no `script.js` para funcionar diretamente no navegador, reforçando a natureza didática e o alerta de segurança.

3.  Abra o arquivo `index.html` em seu navegador web.

## Estrutura do Projeto

*   `index.html`: Estrutura principal da página.
*   `style.css`: Estilização da página.
*   `script.js`: Lógica da aplicação, incluindo gerenciamento da garagem e chamadas às APIs.
*   `dados_veiculos_api.json`: Arquivo local com dados simulados de veículos.
*   `README.md`: Este arquivo.
*   `.gitignore`: Especifica arquivos a serem ignorados pelo Git.
*   `.env` (exemplo): Usado para variáveis de ambiente em contextos de backend (não lido diretamente pelo JS do navegador neste projeto).

## JSDoc (Documentação no Código)

As principais funções em `script.js` (como `Veiculo`, `buscarDetalhesVeiculoAPI`, `buscarPrevisaoDetalhada`, `processarDadosForecast`, `exibirPrevisaoDetalhadaUI`, etc.) incluem comentários no formato JSDoc para explicar seus parâmetros, o que fazem e o que retornam.