// --- Seletores do DOM ---
const formVeiculo = document.getElementById('form-veiculo');
const listaVeiculosDiv = document.getElementById('lista-veiculos');
const inputPlaca = document.getElementById('placa');
const inputModelo = document.getElementById('modelo');
const inputMarca = document.getElementById('marca');
const inputAno = document.getElementById('ano');
const inputCor = document.getElementById('cor');

const inputDestino = document.getElementById('destino-viagem');
const btnVerificarClima = document.getElementById('verificar-clima-btn');
const divPrevisaoResultado = document.getElementById('previsao-tempo-resultado');

// --- Estado da Aplicação (Garagem) ---
let garagem = [];

// --- API Key OpenWeatherMap ---
// ========================================================================
// ATENÇÃO: ARMAZENAR A API KEY DIRETAMENTE NO CÓDIGO FRONTEND É INSEGURO!
// Em uma aplicação real, a chave NUNCA deve ficar exposta aqui.
// A forma correta envolve um backend (Node.js, Serverless) atuando como proxy.
// Para FINS DIDÁTICOS nesta atividade, vamos usá-la aqui temporariamente.
// ========================================================================
const OPENWEATHER_API_KEY = "b135fb2ad23b177010dd70f5cd1cfff0"; // <-- SUBSTITUA PELA SUA CHAVE REAL (SE DIFERENTE)

// --- Funções da Garagem (Base) ---

/**
 * @class Veiculo
 * @description Representa um veículo na garagem.
 * @param {string} placa - A placa do veículo (usada como ID).
 * @param {string} modelo - O modelo do veículo.
 * @param {string} marca - A marca do veículo.
 * @param {number} ano - O ano de fabricação.
 * @param {string} cor - A cor do veículo.
 */
class Veiculo {
    constructor(placa, modelo, marca, ano, cor) {
        if (!placa || !/^[A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{2}$/.test(placa)) {
            throw new Error("Formato de placa inválido.");
        }
        this.id = placa.toUpperCase();
        this.placa = placa.toUpperCase();
        this.modelo = modelo;
        this.marca = marca;
        this.ano = parseInt(ano);
        this.cor = cor;
    }
}

/**
 * Carrega os veículos do LocalStorage ao iniciar.
 */
function carregarVeiculos() {
    const veiculosSalvos = localStorage.getItem('garagem');
    if (veiculosSalvos) {
        garagem = JSON.parse(veiculosSalvos).map(v => new Veiculo(v.placa, v.modelo, v.marca, v.ano, v.cor));
    }
    renderizarGaragem();
}

/**
 * Salva o estado atual da garagem no LocalStorage.
 */
function salvarVeiculos() {
    localStorage.setItem('garagem', JSON.stringify(garagem));
}

/**
 * Adiciona um novo veículo à garagem.
 * @param {Event} event - O evento de submit do formulário.
 */
function adicionarVeiculo(event) {
    event.preventDefault();
    try {
        const novoVeiculo = new Veiculo(
            inputPlaca.value.trim(),
            inputModelo.value.trim(),
            inputMarca.value.trim(),
            inputAno.value,
            inputCor.value.trim()
        );
        if (garagem.some(v => v.id === novoVeiculo.id)) {
            alert(`Erro: Veículo com a placa ${novoVeiculo.placa} já existe na garagem.`);
            return;
        }
        garagem.push(novoVeiculo);
        salvarVeiculos();
        renderizarGaragem();
        formVeiculo.reset();
        inputPlaca.focus();
    } catch (error) {
        alert(`Erro ao adicionar veículo: ${error.message}`);
    }
}

/**
 * Remove um veículo da garagem.
 * @param {string} idVeiculo - A placa (ID) do veículo a ser removido.
 */
function removerVeiculo(idVeiculo) {
    if (confirm(`Tem certeza que deseja remover o veículo com placa ${idVeiculo}?`)) {
        garagem = garagem.filter(veiculo => veiculo.id !== idVeiculo);
        salvarVeiculos();
        renderizarGaragem();
    }
}

/**
 * Renderiza a lista de veículos na interface.
 */
function renderizarGaragem() {
    listaVeiculosDiv.innerHTML = '';
    if (garagem.length === 0) {
        listaVeiculosDiv.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhum veículo na garagem.</p>';
        return;
    }
    garagem.forEach(veiculo => {
        const card = document.createElement('div');
        card.className = 'veiculo-card';
        card.dataset.id = veiculo.id;
        card.innerHTML = `
            <h3>${veiculo.modelo} (${veiculo.marca})</h3>
            <p><strong>Placa:</strong> ${veiculo.placa}</p>
            <p><strong>Ano:</strong> ${veiculo.ano}</p>
            <p><strong>Cor:</strong> ${veiculo.cor}</p>
            <div class="detalhes-extras-content" id="detalhes-${veiculo.id}" style="display: none;"></div>
            <div>
                <button class="ver-detalhes-btn">Ver Detalhes Extras</button>
                <button class="remover-btn">Remover</button>
            </div>
        `;
        card.querySelector('.remover-btn').addEventListener('click', () => removerVeiculo(veiculo.id));
        card.querySelector('.ver-detalhes-btn').addEventListener('click', handleVerDetalhesClick);
        listaVeiculosDiv.appendChild(card);
    });
}

// --- Parte 1: Integração com API Simulada (Detalhes Veiculares) ---

/**
 * Busca detalhes extras de um veículo na API simulada local.
 * @async
 * @param {string} identificadorVeiculo - A placa (ID) do veículo.
 * @returns {Promise<object|null>} Uma Promise que resolve com o objeto de detalhes do veículo ou null.
 * @throws {Error} Lança um erro se o fetch falhar.
 */
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
    const url = './dados_veiculos_api.json';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro HTTP ${response.status} ao buscar ${url}`);
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError(`Resposta recebida não é JSON! Tipo: ${contentType}`);
        }
        const data = await response.json();
        return data.find(v => v.id === identificadorVeiculo.toUpperCase()) || null;
    } catch (error) {
        console.error("Falha ao buscar/processar detalhes do veículo da API simulada:", error);
        throw error;
    }
}

/**
 * Manipulador de evento para o clique no botão "Ver Detalhes Extras".
 * @async
 * @param {Event} event - O evento de clique.
 */
async function handleVerDetalhesClick(event) {
    const button = event.target;
    const card = button.closest('.veiculo-card');
    if (!card) return;
    const veiculoId = card.dataset.id;
    const detalhesDiv = card.querySelector(`#detalhes-${veiculoId}`);
    if (!veiculoId || !detalhesDiv) return;

    if (detalhesDiv.style.display === 'block' && !detalhesDiv.classList.contains('loading') && !detalhesDiv.classList.contains('error')) {
        detalhesDiv.style.display = 'none';
        button.textContent = "Ver Detalhes Extras";
        return;
    }

    detalhesDiv.innerHTML = 'Carregando detalhes...';
    detalhesDiv.className = 'detalhes-extras-content loading';
    detalhesDiv.style.display = 'block';
    button.disabled = true;
    button.textContent = "Carregando...";

    try {
        const detalhes = await buscarDetalhesVeiculoAPI(veiculoId);
        if (detalhes) {
            detalhesDiv.innerHTML = `
                <p><strong>Valor FIPE:</strong> ${detalhes.valorFipe || 'N/D'}</p>
                <p><strong>Recall Pendente:</strong> ${detalhes.recallPendente ? `<span style="color:red; font-weight:bold;">SIM</span>` : 'Não'}</p>
                ${detalhes.recallPendente && detalhes.recallDescricao ? `<p><em>Recall: ${detalhes.recallDescricao}</em></p>` : ''}
                <p><strong>Próxima Revisão:</strong> ${detalhes.proximaRevisao ? new Date(detalhes.proximaRevisao + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/D'}</p>
                <p><strong>Dica:</strong> ${detalhes.dicaManutencao || 'Nenhuma dica disponível.'}</p>
            `;
            detalhesDiv.className = 'detalhes-extras-content';
            button.textContent = "Esconder Detalhes"; // Mudar texto para opção de esconder
        } else {
            detalhesDiv.innerHTML = 'Detalhes extras não encontrados para esta placa.';
            detalhesDiv.className = 'detalhes-extras-content error';
            button.textContent = "Ver Detalhes Extras";
        }
    } catch (error) {
        detalhesDiv.innerHTML = `Erro ao buscar detalhes: ${error.message}`;
        detalhesDiv.className = 'detalhes-extras-content error';
        button.textContent = "Ver Detalhes Extras";
    } finally {
        button.disabled = false;
    }
}


// --- Parte 2: Desafio Extra - Planejador de Viagem (OpenWeatherMap API - PREVISÃO DETALHADA) ---

/**
 * Busca a previsão do tempo detalhada (5 dias / 3 horas) para uma cidade.
 * @async
 * @param {string} nomeCidade - O nome da cidade para buscar a previsão.
 * @returns {Promise<object|null>} Uma Promise que resolve com os dados da API ou null em caso de erro.
 * @throws {Error} Lança um erro se a busca falhar ou a API retornar um erro.
 */
async function buscarPrevisaoDetalhada(nomeCidade) {
    if (!nomeCidade) {
        throw new Error("Nome da cidade não pode ser vazio.");
    }
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "SUA_CHAVE_COPIADA_AQUI" || OPENWEATHER_API_KEY.includes("SUA_CHAVE")) { // Adicionada checagem mais genérica
        console.error("Chave da API OpenWeatherMap não configurada corretamente.");
        throw new Error("Chave da API OpenWeatherMap não configurada. Verifique a constante OPENWEATHER_API_KEY no script.js.");
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(nomeCidade)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

    try {
        const response = await fetch(url);
        const data = await response.json(); // Tenta parsear JSON mesmo se não for ok, pois OpenWeatherMap envia erros em JSON

        if (!response.ok) {
            // data.message geralmente contém o erro da API (ex: "city not found", "Invalid API key")
            throw new Error(data.message || `Erro ${response.status}: Falha ao buscar previsão detalhada.`);
        }
        return data; // Retorna o objeto completo da API
    } catch (error) {
        console.error("Erro na requisição para OpenWeatherMap (Forecast):", error);
        throw error; // Re-lança para ser pego pelo handler
    }
}

/**
 * Processa os dados brutos da API de forecast para um formato de resumo diário.
 * @param {object} data - O objeto JSON completo retornado pela API de forecast.
 * @returns {Array<object>|null} Um array de objetos, cada um representando um dia com dados resumidos, ou null se dados inválidos.
 * Formato de cada objeto no array:
 * {
 *   data: 'YYYY-MM-DD',
 *   temp_min: Number,
 *   temp_max: Number,
 *   descricao: String, // Descrição do tempo (ex: nublado)
 *   icone: String,     // Código do ícone do tempo
 *   entries: Array<object> // Todas as entradas de 3h para aquele dia
 * }
 */
function processarDadosForecast(data) {
    if (!data || !data.list || !Array.isArray(data.list) || data.list.length === 0) {
        console.error("Dados de forecast inválidos ou vazios:", data);
        return null;
    }

    const previsaoPorDia = {};

    data.list.forEach(item => {
        const dataHora = new Date(item.dt * 1000); // dt é timestamp Unix
        const diaString = dataHora.toISOString().split('T')[0]; // Formato AAAA-MM-DD

        if (!previsaoPorDia[diaString]) {
            previsaoPorDia[diaString] = {
                data: diaString,
                temps: [],
                descricoes: [],
                icones: [],
                entries: [] // Armazena todas as entradas de 3h para este dia
            };
        }
        previsaoPorDia[diaString].temps.push(item.main.temp);
        previsaoPorDia[diaString].descricoes.push(item.weather[0].description);
        previsaoPorDia[diaString].icones.push(item.weather[0].icon);
        previsaoPorDia[diaString].entries.push(item);
    });

    const resumoDiario = Object.values(previsaoPorDia).map(dia => {
        // Para descrição e ícone, podemos pegar o do meio-dia ou o mais frequente.
        // Por simplicidade, vamos pegar o do primeiro registro do dia ou o mais próximo do meio-dia.
        let entradaRepresentativa = dia.entries.find(e => new Date(e.dt * 1000).getHours() >= 12) || dia.entries[0];

        return {
            data: dia.data,
            temp_min: Math.min(...dia.temps),
            temp_max: Math.max(...dia.temps),
            descricao: entradaRepresentativa.weather[0].description,
            icone: entradaRepresentativa.weather[0].icon,
            // entries: dia.entries // Se quiser manter todas as entradas de 3h para mais detalhes
        };
    });

    return resumoDiario.sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordena por data
}


/**
 * Exibe a previsão do tempo detalhada (múltiplos dias) na interface.
 * @param {Array<object>} previsaoDiariaProcessada - Array com os dados diários processados.
 * @param {string} nomeCidade - Nome da cidade para exibir no título.
 */
function exibirPrevisaoDetalhadaUI(previsaoDiariaProcessada, nomeCidade) {
    divPrevisaoResultado.innerHTML = ''; // Limpa resultados anteriores
    divPrevisaoResultado.className = ''; // Limpa classes de estado

    if (!previsaoDiariaProcessada || previsaoDiariaProcessada.length === 0) {
        divPrevisaoResultado.innerHTML = '<p>Não foi possível obter a previsão detalhada.</p>';
        divPrevisaoResultado.classList.add('error');
        return;
    }

    const titulo = document.createElement('h3');
    titulo.textContent = `Previsão para os próximos dias em ${nomeCidade}`;
    divPrevisaoResultado.appendChild(titulo);

    const containerDias = document.createElement('div');
    containerDias.className = 'forecast-container'; // Classe para estilização
    divPrevisaoResultado.appendChild(containerDias);

    previsaoDiariaProcessada.forEach(dia => {
        const diaCard = document.createElement('div');
        diaCard.className = 'forecast-day-card';

        const dataObj = new Date(dia.data + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso na formatação
        const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' });
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

        diaCard.innerHTML = `
            <h4>${diaSemana} (${dataFormatada})</h4>
            <img src="https://openweathermap.org/img/wn/${dia.icone}@2x.png" alt="${dia.descricao}">
            <p class="descricao">${dia.descricao}</p>
            <p><strong>Min:</strong> ${dia.temp_min.toFixed(1)} °C</p>
            <p><strong>Máx:</strong> ${dia.temp_max.toFixed(1)} °C</p>
        `;
        containerDias.appendChild(diaCard);
    });

    const attribution = document.createElement('p');
    attribution.innerHTML = 'Dados fornecidos por OpenWeatherMap';
    attribution.style.fontSize = '0.8em';
    attribution.style.opacity = '0.7';
    attribution.style.marginTop = '15px';
    attribution.style.textAlign = 'center';
    divPrevisaoResultado.appendChild(attribution);
}


/**
 * Manipulador de evento para o clique no botão "Verificar Clima" (agora para previsão detalhada).
 * @async
 */
async function handleVerificarClimaClick() {
    const nomeCidade = inputDestino.value.trim();

    if (!nomeCidade) {
        divPrevisaoResultado.innerHTML = 'Por favor, digite o nome da cidade.';
        divPrevisaoResultado.className = 'error'; // Usar classes definidas no CSS
        return;
    }

    divPrevisaoResultado.innerHTML = 'Buscando previsão detalhada...';
    divPrevisaoResultado.className = 'loading';
    btnVerificarClima.disabled = true;

    try {
        const dadosApi = await buscarPrevisaoDetalhada(nomeCidade);
        if (dadosApi) {
            const previsaoProcessada = processarDadosForecast(dadosApi);
            if (previsaoProcessada && previsaoProcessada.length > 0) {
                 // Extrai o nome da cidade da resposta da API para consistência
                const cidadeRetornada = dadosApi.city && dadosApi.city.name ? dadosApi.city.name : nomeCidade;
                exibirPrevisaoDetalhadaUI(previsaoProcessada, cidadeRetornada);
            } else {
                throw new Error("Não foi possível processar os dados da previsão.");
            }
        } else {
            // buscarPrevisaoDetalhada já deve ter lançado um erro se dadosApi for null
            // mas como precaução:
            throw new Error("Resposta da API de previsão não recebida.");
        }
    } catch (error) {
        console.error("Erro ao obter/exibir previsão detalhada:", error);
        divPrevisaoResultado.innerHTML = `Erro ao buscar previsão: ${error.message}`;
        divPrevisaoResultado.className = 'error';
    } finally {
        btnVerificarClima.disabled = false;
    }
}


// --- Inicialização e Event Listeners Globais ---
document.addEventListener('DOMContentLoaded', carregarVeiculos);
formVeiculo.addEventListener('submit', adicionarVeiculo);
btnVerificarClima.addEventListener('click', handleVerificarClimaClick);

inputDestino.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleVerificarClimaClick();
    }
});