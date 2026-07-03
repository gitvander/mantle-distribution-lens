/*
 * V29 polishes the tracked-asset library while preserving the research inputs.
 * profile. Presentation and language are intentionally separate from the
 * research inputs so they cannot change the underlying calculation.
 */
const APP_CONFIG = Object.freeze({
  chainName: "Mantle",
  rpcPath: "/api/mantle-rpc",
  dexPath: "/api/dex/",
  lookbackBlocks: 5000,
  initialLogChunk: 100000,
  minimumLogChunk: 1000,
  maximumLogChunks: 800,
  maximumEvents: 150000,
  defaultLocale: "pt-BR",
  supportedLocales: ["pt-BR", "en"],
  plannedLocales: ["zh", "es"],
  futureThemeModes: ["light", "dark"],
});

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const COPY = {
  "pt-BR": {
    languageLabel: "Idioma",
    languageAriaLabel: "Escolher idioma",
    pageTitle: "Mantle Distribution Lens",
    version: "PESQUISA DE DISTRIBUIÃ‡ÃƒO Â· V27",
    heroEyebrow: "PESQUISA ON-CHAIN BASEADA EM EVIDÃŠNCIAS",
    heroTitle: "MeÃ§a a distribuiÃ§Ã£o por trÃ¡s<br />dos ativos tokenizados.",
    heroCopy: "A emissÃ£o Ã© apenas a linha de largada. Esta ferramenta transforma dados pÃºblicos da Mantle e do mercado em uma visÃ£o transparente sobre circulaÃ§Ã£o, liquidez, conectividade e qualidade das evidÃªncias observÃ¡veis.",
    heroNoteEvidence: "EvidÃªncia on-chain",
    heroNoteMethod: "MÃ©todo transparente",
    heroNoteRating: "NÃ£o Ã© recomendaÃ§Ã£o de investimento",
    consoleEyebrow: "CONSOLE DE PESQUISA",
    consoleTitle: "Inicie uma anÃ¡lise",
    consoleNote: "Apenas dados pÃºblicos gratuitos Â· Rede principal da Mantle",
    contractLabel: "Contrato, simbolo ou nome do ativo",
    contractPlaceholder: "Ex.: SPCXx, SpaceX, Tesla, QQQx ou 0x...",
    analyzeButton: "Abrir pesquisa atualizada",
    analyzeButtonBusy: "Coletando evidÃªnciasâ€¦",
    closeAnalysis: "Fechar anÃ¡lise",
    contractHint: "Digite um contrato Mantle, simbolo ou nome do ativo. A busca usa apenas a biblioteca local verificada pelo Lens.",
    sampleButton: "Explorar exemplo ilustrativo",
    catalogLabel: "Biblioteca acompanhada",
    catalogLoading: "Carregando catÃ¡logoâ€¦",
    catalogChoose: "Escolha um ativo publicado ou em fila",
    catalogHint: "Ativos publicados carregam um snapshot histÃ³rico. Ativos em fila abrem um perfil preliminar sem nota final.",
    staticSnapshotHint: "A biblioteca mistura snapshots pÃºblicos publicados com ativos jÃ¡ colocados na fila de pesquisa. Ela nunca pede carteira, chave ou conta.",
    catalogReady: "Biblioteca carregada. Selecione um ativo publicado ou em fila.",
    catalogUnavailable: "O catÃ¡logo publicado nÃ£o estÃ¡ disponÃ­vel agora. Tente atualizar a pÃ¡gina.",
    searchMatchHint: "Ativo encontrado: {name} ({symbol}). Voce pode abrir a pesquisa atualizada.",
    searchFuzzyHint: "Possivel correspondencia: {name} ({symbol}). O Lens vai abrir este ativo se voce continuar.",
    searchAmbiguous: "Encontrei mais de um ativo parecido: {matches}. Digite um pouco mais do nome ou simbolo.",
    searchNoMatch: "Nao encontrei esse termo na biblioteca ou no catalogo carregado do Lens.",
    searchResolved: "Abrindo {name} ({symbol})...",
    assetNotIndexed: "Este contrato ainda nÃ£o foi publicado nem entrou na fila acompanhada da V12. Use um ativo da biblioteca ou aguarde a prÃ³xima promoÃ§Ã£o.",
    snapshotPending: "Este ativo jÃ¡ entrou na fila de pesquisa da V12, mas seu primeiro snapshot histÃ³rico ainda nÃ£o foi publicado.",
    snapshotUnavailable: "O snapshot publicado deste ativo nÃ£o pÃ´de ser carregado agora.",
    dataSnapshot: "SNAPSHOT PUBLICADO",
    snapshotReason: "Distribuição atualizada em {date}",
    downloadButton: "Baixar relatÃ³rio de pesquisa",
    periodLabel: "Cobertura da pesquisa",
    periodRecent: "Pulso recente Â· Ãºltimos 5.000 blocos",
    period7d: "Ãšltimos 7 dias",
    period30d: "Ãšltimos 30 dias",
    period1y: "Ãšltimo ano",
    periodAll: "Todo o histÃ³rico disponÃ­vel Â· lento",
    periodLifetime: "Vida completa do token",
    periodCustom: "Intervalo personalizado",
    periodHintRecent: "Ã‰ uma leitura rÃ¡pida de atividade recente; nÃ£o representa a distribuiÃ§Ã£o histÃ³rica do token.",
    periodHint7d: "Busca por data real dos blocos, nÃ£o por uma estimativa de velocidade da rede.",
    periodHint30d: "Uma janela mensal permite comparar atividade recente sem pedir todo o histÃ³rico.",
    periodHint1y: "Um ano pode exigir muitas consultas pÃºblicas e levar mais tempo para concluir.",
    periodHintAll: "A ferramenta localizarÃ¡ o bloco de criaÃ§Ã£o do contrato e pesquisarÃ¡ em partes. Mantenha esta pÃ¡gina aberta.",
    periodHintLifetime: "Snapshot histÃ³rico publicado: comeÃ§a na criaÃ§Ã£o do contrato e Ã© atualizado fora da experiÃªncia do investidor.",
    periodHintCustom: "Escolha uma data inicial e uma final. A ferramenta encontrarÃ¡ os blocos correspondentes.",
    startDateLabel: "Data inicial",
    endDateLabel: "Data final",
    invalidDateRange: "Escolha uma data inicial anterior Ã  data final, sem datas futuras.",
    locatingBlocks: "Localizando os blocos que correspondem ao perÃ­odoâ€¦",
    locatingContract: "Localizando o inÃ­cio disponÃ­vel do contratoâ€¦",
    scanningHistory: "Lendo eventos de transferÃªncia em partesâ€¦",
    progressQueries: "{done} de {total} blocos consultados",
    queryLimitReached: "Este perÃ­odo Ã© grande demais para a consulta gratuita em uma Ãºnica sessÃ£o. Escolha uma janela menor ou tente de novo mais tarde.",
    tooManyEvents: "Este contrato possui eventos demais neste perÃ­odo para uma anÃ¡lise local segura. Escolha uma janela menor.",
    historyUnavailable: "NÃ£o foi possÃ­vel localizar o inÃ­cio histÃ³rico deste contrato na RPC pÃºblica. Escolha 1 ano, 30 dias ou um intervalo personalizado.",
    coverage: "COBERTURA DA PESQUISA",
    coverageDetail: "Blocos {from}â€“{to}",
    coverageReadout: "A janela cobre {start} atÃ© {end}.",
    reportCoverage: "Cobertura da pesquisa",
    reportStartBlock: "Bloco inicial",
    reportEndBlock: "Bloco final",
    reportStartDate: "Data inicial",
    reportEndDate: "Data final",
    confidenceLabel: "CONFIANÃ‡A DOS DADOS",
    summaryDisclaimer: "EvidÃªncia de pesquisa, nÃ£o indicaÃ§Ã£o de compra ou venda.",
    confidenceHigh: "ALTA",
    confidenceModerate: "MODERADA",
    confidenceLimited: "LIMITADA",
    confidenceHighDescription: "A cobertura histÃ³rica e as fontes pÃºblicas foram verificadas nesta execuÃ§Ã£o.",
    confidenceModerateDescription: "HÃ¡ evidÃªncia pÃºblica Ãºtil, mas ela nÃ£o representa todos os mercados ou investidores.",
    confidenceLimitedDescription: "A janela ou as fontes disponÃ­veis sÃ£o limitadas; trate a nota com cautela.",
    statusEarly: "SINAIS INICIAIS",
    statusGrowing: "EM CRESCIMENTO",
    statusEstablished: "SINAIS FORTES",
    statusLimited: "EVIDÃŠNCIA LIMITADA",
    reasonActivity: "{count} transferÃªncias observadas",
    reasonWallets: "{count} carteiras observadas",
    reasonLiquidity: "Liquidez pÃºblica em DEX: {amount}",
    reasonNoLiquidity: "Nenhuma liquidez pÃºblica em DEX observada",
    reasonLifetime: "Cobertura desde a criaÃ§Ã£o do contrato",
    reasonWindow: "Cobertura parcial: {label}",
    cacheUsed: "Base histÃ³rica local encontrada; buscando apenas blocos novos.",
    cacheSaved: "HistÃ³rico salvo localmente. A prÃ³xima consulta deste token serÃ¡ mais rÃ¡pida.",
    resultsEyebrow: "RETRATO DA DISTRIBUIÃ‡ÃƒO",
    scoreLabel: "PRONTIDÃƒO DE DISTRIBUIÃ‡ÃƒO",
    readoutLabel: "LEITURA DA PESQUISA",
    assetOverviewLabel: "O QUE É ESTE ATIVO",
    scoreMeaningEyebrow: "O QUE A NOTA SIGNIFICA",
    scoreMeaningTitle: "Quatro sinais observÃ¡veis",
    methodBadge: "MÃ‰TODO V27",
    provenanceEyebrow: "ORIGEM DOS DADOS",
    provenanceTitle: "EvidÃªncias usadas",
    methodEyebrow: "POR QUE ISTO NÃƒO Ã‰ UM PAINEL DE PREÃ‡OS",
    methodTitle: "DistribuiÃ§Ã£o Ã© mais do que uma listagem.",
    methodCopyOne: "Um token pode ter preÃ§o e ainda assim nÃ£o ter circulaÃ§Ã£o relevante, mercados acessÃ­veis ou liquidez verificÃ¡vel. A V12 mede esses sinais separadamente, separa biblioteca publicada, fila de pesquisa e catÃ¡logo oficial, e agora combina um pool de provedores RPC, checkpoint e dois trabalhadores controlados.",
    methodCopyTwo: "Os resultados sÃ£o pistas de pesquisa, nÃ£o uma anÃ¡lise jurÃ­dica, de propriedade ou de investimento. Uma contagem de carteiras nÃ£o Ã© uma contagem de investidores; um par em DEX nÃ£o prova acesso global; um anÃºncio nÃ£o prova liquidez.",
    footerLeft: "Mantle Distribution Lens Â· ProtÃ³tipo independente de pesquisa",
    footerRight: "Criado a partir de dados pÃºblicos e verificÃ¡veis",
    researchPrinciples: "PrincÃ­pios da pesquisa",
    dataSample: "EXEMPLO ILUSTRATIVO",
    dataLive: "DADOS PÃšBLICOS AO VIVO",
    dataPartial: "DADOS AO VIVO PARCIAIS",
    sourceSingular: "FONTE",
    sourcePlural: "FONTES",
    sourceIntelligenceEyebrow: "",
    sourceIntelligenceTitle: "Onde negociar este ativo",
    sourceIntelligenceNote: "Observação metodológica: {rule}",
    tradeRoutesEyebrow: "ONDE NEGOCIAR ESTE ATIVO",
    tradeRoutesTitle: "Rotas verificadas na Mantle",
    tradeRoutesCountSingular: "1 ROTA",
    tradeRoutesCountPlural: "{count} ROTAS",
    tradeRouteAction: "Abrir rota",
    tradeRouteQuote: "Cota\u00e7\u00e3o: {price}",
    tradeRouteQuoteUnavailable: "Cota\u00e7\u00e3o indispon\u00edvel",
    tradeRouteQuoteSimulated: "simula\u00e7\u00e3o de US$ 100",
    tradeRouteQuoteIndicative: "pre\u00e7o indicativo da pool",
    tradeRouteQuotePool: "pre\u00e7o lido na pool",
    tradeRouteTvl: "TVL: {tvl}",
    tradeRouteTvlUnavailable: "TVL indisponÃ­vel",
    tradeRouteNetwork: "Rede Mantle",
    tradeRoutePairFallback: "{symbol} / mercado verificado",
    marketTableEyebrow: "ROTAS DE MERCADO",
    marketTableTitle: "Onde o ativo pode circular",
    sourceRegistryEyebrow: "REGISTRO DE FONTES",
    sourceRegistryTitle: "O que sustenta a leitura",
    nextEvidenceEyebrow: "PRÃ“XIMAS EVIDÃŠNCIAS",
    nextEvidenceTitle: "O que falta confirmar",
    venueColumn: "Venue",
    routeColumn: "EvidÃªncia ou rota",
    stateColumn: "Estado",
    checkedColumn: "Verificado",
    marketObservation: "Liquidez pÃºblica: {liquidity} Â· volume 24h: {volume}",
    marketContractObserved: "Pool e estado de preÃ§o verificados on-chain",
    countedInScore: "Conta na nota",
    notCountedInScore: "NÃ£o conta na nota ainda",
    statusObserved: "OBSERVADO",
    statusConfirmed: "CONFIRMADO",
    statusAnnounced: "ANUNCIADO",
    statusCandidate: "A CONFIRMAR",
    statusMissing: "PENDENTE",
    reportMarketMap: "Mapa de mercados",
    reportNextEvidence: "PrÃ³ximas evidÃªncias",
    notAvailable: "NÃ£o disponÃ­vel",
    universeEyebrow: "UNIVERSO RWA NA MANTLE",
    universeTitle: "Biblioteca de ativos acompanhados",
    universeBadge: "CATÃLOGO OFICIAL",
    universeCopy: "{catalog} ativos xStocks estÃ£o oficialmente implantados na Mantle. A lista abaixo reÃºne {basket} RWAs com rotas verificadas ou produtos observados; quando a prova on-chain na Mantle ainda faltar, o Lens bloqueia a nota e mostra o aviso.",
    basketRank: "#{rank} NA CESTA",
    basketTvl: "TVL da seleÃ§Ã£o: {tvl}",
    basketVerified: "ROTA CONFIRMADA",
    officialNotTracked: "{symbol} estÃ¡ no catÃ¡logo oficial xStocks da Mantle, mas ainda nÃ£o entrou na biblioteca acompanhada da V12.",
    catalogStatusIndexed: "PUBLICADO",
    catalogStatusQueued: "EM FILA",
    basketStatusIndexed: "SNAPSHOT PUBLICADO",
    basketStatusQueued: "EM FILA DE PESQUISA",
    basketStatusOfficial: "CATÃLOGO OFICIAL",
    discoveredEyebrow: "DESCOBERTAS AUTOMÃTICAS",
    discoveredTitle: "Novas pools verificadas",
    discoveredCopy: "Pools encontradas automaticamente nos eventos da Factory da Fluxion. A rota e o wrapper foram verificados on-chain; uma nota de distribuiÃ§Ã£o sÃ³ aparece apÃ³s um snapshot histÃ³rico.",
    discoveredStatus: "NOVA POOL VERIFICADA",
    discoveredTvl: "TVL observado: {tvl}",
    discoveredCount: "{count} pool(s)",
    assetPagePrev: "Anterior",
    assetPageNext: "PrÃ³xima",
    assetPageInfo: "PÃ¡gina {current} de {total}",
    assetListCount: "{count} ativos",
    assetListVenue: "{venue} Â· {status}",
    assetTabStocks: "STOCKS TOKENIZADAS",
    assetTabEtfs: "ETFs TOKENIZADOS",
    assetTvlLabel: "TVL VERIFICADO",
    assetVerificationLabel: "VERIFICACAO",
    copyContract: "Copiar contrato",
    copiedContract: "Contrato copiado",
    xstockOverview: "{symbol} e uma xStock: um token ERC-20 na Mantle que representa exposicao tokenizada a {assetName}. A identidade do ativo vem do catalogo oficial xStocks/Backed e do contrato {contract} na Mantle. O Lens acompanha eventos on-chain deste contrato desde {date}. {routeSentence}",
    xstockOverviewRoutes: "Rotas monitoradas nesta versao: {venues}.",
    xstockOverviewNoRoutes: "Nenhuma rota monitorada adicional foi confirmada para este ativo nesta versao.",
    observedProductStatus: "PRODUTO OBSERVADO",
    unverifiedMantleStatus: "MANTLE NÃƒO VERIFICADA",
    rwalphaNoScore: "VerificaÃ§Ã£o on-chain pendente",
    rwalphaWarningTitle: "Este produto ainda nÃ£o pode ser verificado on-chain na Mantle",
    rwalphaWarningCopy: "O produto aparece no marketplace da RWAlpha com Mantle selecionada, mas o contrato Mantle ainda nÃ£o foi localizado no explorador. Por isso o Lens mostra evidÃªncias e bloqueia a nota atÃ© haver um contrato verificÃ¡vel.",
    rwalphaReadout: "{symbol} foi observado no marketplace da RWAlpha com Mantle selecionada. A documentaÃ§Ã£o informa um contrato BEP-20 na BNB Chain, mas ainda nÃ£o hÃ¡ contrato Mantle verificado para medir distribuiÃ§Ã£o on-chain.",
    rwalphaMetricProduct: "TIPO DE PRODUTO",
    rwalphaMetricAccess: "ACESSO",
    rwalphaMetricBscContract: "CONTRATO DOCUMENTADO",
    rwalphaMetricMantleContract: "CONTRATO MANTLE",
    rwalphaAccessDetail: "Subscribe/redeem via RWAlpha; nÃ£o Ã© rota DEX verificada",
    rwalphaBscDetail: "Encontrado como contrato BEP-20 na BNB Chain",
    rwalphaMantleMissing: "Ainda nÃ£o verificado",
    rwalphaSignalMarketplace: "Marketplace observado",
    rwalphaSignalMarketplaceDetail: "A pÃ¡gina do produto abre com Mantle selecionada e mostra subscribe/redeem.",
    rwalphaSignalBsc: "Contrato BNB Chain encontrado",
    rwalphaSignalBscDetail: "O contrato documentado aparece no BscScan como token/vault BEP-20.",
    rwalphaSignalMissing: "Contrato Mantle pendente",
    rwalphaSignalMissingDetail: "Sem contrato Mantle verificÃ¡vel, o Lens nÃ£o calcula distribuiÃ§Ã£o nem nota.",
    rwalphaSourceMarketplace: "RWAlpha marketplace",
    rwalphaSourceMarketplaceDetail: "Produto observado com chain=mantle no site da RWAlpha.",
    rwalphaSourceDocs: "RWAlpha docs",
    rwalphaSourceDocsDetail: "DocumentaÃ§Ã£o descreve composiÃ§Ã£o, mint/redeem, riscos e contratos documentados.",
    rwalphaSourceBsc: "BscScan",
    rwalphaSourceBscDetail: "Contrato documentado encontrado como BEP-20; isso nÃ£o prova implantaÃ§Ã£o na Mantle.",
    rwalphaNextEvidenceOne: "Confirmar o contrato Mantle oficial com a RWAlpha ou no explorador.",
    rwalphaNextEvidenceTwo: "Depois do contrato Mantle, publicar snapshot de transferÃªncias antes de liberar nota.",
    snapshotAttemptFailed: "A ultima tentativa de gerar o snapshot falhou: {error}",
    sampleAssetName: "AÃ§Ã£o tokenizada de exemplo",
    sampleScoreDescription: "Existem sinais, mas a liquidez e o acesso precisam de verificaÃ§Ã£o mais profunda.",
    sampleReadout: "O exemplo mostra circulaÃ§Ã£o on-chain ativa e conectividade bÃ¡sica de mercado. A prÃ³xima pergunta Ã© se a atividade observada representa amplo acesso de investidores ou apenas um pequeno nÃºmero de carteiras operacionais.",
    sampleObservedWallets: "CARTEIRAS OBSERVADAS",
    sampleWindow: "Na janela de pesquisa selecionada",
    sampleTransfers: "EVENTOS DE TRANSFERÃŠNCIA",
    sampleLatestBlocks: "Ãšltimos 5.000 blocos",
    sampleLiquidity: "LIQUIDEZ EM DEX",
    samplePairs: "Em 2 pares observados",
    sampleConnectivity: "CONECTIVIDADE DE MERCADO",
    samplePublicRoute: "Sinal de rota pÃºblica em DEX",
    circulation: "CirculaÃ§Ã£o",
    liquidity: "Liquidez",
    connectivity: "Conectividade",
    evidenceQuality: "Qualidade da evidÃªncia",
    sampleCirculationDetail: "Carteiras e transferÃªncias observadas indicam movimentaÃ§Ã£o, nÃ£o investidores Ãºnicos verificados.",
    sampleLiquidityDetail: "A liquidez pÃºblica em DEX Ã© um sinal Ãºtil, mas muda rapidamente e nÃ£o revela todos os mercados.",
    sampleConnectivityDetail: "Dois pares pÃºblicos observados oferecem uma rota limitada para os mercados on-chain.",
    sampleEvidenceDetail: "Os sinais principais podem ser verificados publicamente; acesso fora da blockchain e elegibilidade jurÃ­dica exigem pesquisa separada.",
    mantleBlockchain: "Blockchain pÃºblica da Mantle",
    sampleChainDetail: "Janela ilustrativa de eventos para a demonstraÃ§Ã£o do produto",
    publicDexData: "Dados pÃºblicos de mercado em DEX",
    sampleDexDetail: "Dados ilustrativos de liquidez e pares para a demonstraÃ§Ã£o do produto",
    unknownToken: "ERC-20 desconhecido",
    tokenFallback: "TOKEN",
    noPair: "Nenhum par encontrado",
    strongScore: "Sinais observÃ¡veis fortes; verifique agora o acesso fora da blockchain e a concentraÃ§Ã£o de holders.",
    mediumScore: "HÃ¡ alguns sinais observÃ¡veis de distribuiÃ§Ã£o; as lacunas importam tanto quanto os pontos positivos.",
    lowScore: "HÃ¡ poucos sinais observÃ¡veis de distribuiÃ§Ã£o nesta janela de dados.",
    observedWallets: "CARTEIRAS OBSERVADAS",
    transfers: "EVENTOS DE TRANSFERÃŠNCIA",
    dexLiquidity: "LIQUIDEZ EM DEX",
    totalSupply: "OFERTA TOTAL",
    fromTransfers: "De {count} eventos de transferÃªncia",
    latestMantleBlocks: "Ãšltimos {count} blocos da Mantle",
    publicMantlePairs: "{count} {pairWord} pÃºblico(s) na Mantle",
    noPublicPair: "Nenhum par pÃºblico retornado",
    platformTvlMetric: "TVL NAS PLATAFORMAS MONITORADAS",
    platformMonitoredSingular: "1 plataforma monitorada",
    platformMonitoredPlural: "{count} plataformas monitoradas",
    marketTimeUnavailable: "HorÃ¡rio de mercado nÃ£o disponÃ­vel",
    marketFreshNow: "Mercado atualizado agora",
    marketFreshMinutes: "Mercado atualizado hÃ¡ {minutes} min",
    marketStaleMinutes: "Dados de mercado podem estar defasados ({minutes} min)",
    monitoredPlatformsSentence: "As plataformas monitoradas somam {tvl} em TVL para este ativo.",
    merchantPoolSentence: "A pool Merchant Moe SPCXx / USDT0 teve {tvl} em reservas verificadas on-chain. O preÃ§o em USD Ã© uma referÃªncia do mesmo par, usada apenas para converter as reservas.",
    fluxionQuoteVerified: "Pool, wrapper e simulaÃ§Ã£o de cotaÃ§Ã£o confirmados por leitura on-chain.",
    fluxionQuotePending: "Pool e wrapper confirmados; a simulaÃ§Ã£o de cotaÃ§Ã£o serÃ¡ registrada pelo atualizador.",
    platformSourcePoolBalances: "saldo da pool lido on-chain",
    platformSourceReserves: "reservas da pool lidas on-chain",
    platformSourceSnapshot: "snapshot pÃºblico da plataforma",
    verifiedPoolTvlMetric: "TVL EM POOLS VERIFICADAS",
    preparing: "Em preparaÃ§Ã£o",
    merchantPoolSignal: "Reservas da pool Merchant Moe: {tvl}. O volume e a profundidade por faixa de preÃ§o serÃ£o exibidos separadamente.",
    merchantPoolDetail: "Reservas da pool SPCXx / USDT0 lidas on-chain; preÃ§o em USD usado somente para convertÃª-las.",
    merchantPoolPending: "Pool Merchant Moe registrada; aguarda leitura on-chain das reservas",
    fluxionQuoteSimulation: "SimulaÃ§Ã£o de compra de US$ 100, sem executar trade",
    fluxionRoutePending: "Pool e wrapper Fluxion verificados; aguarda cotaÃ§Ã£o do QuoterV2",
    monitoredTvlSignal: "{tvl} de TVL nas plataformas monitoradas.",
    merchantSourceVerified: "Reservas lidas diretamente no contrato da pool; o preÃ§o em USD Ã© apenas a referÃªncia do mesmo par para converter essas reservas.",
    merchantSourcePending: "Pool registrada; a leitura de reservas ainda nÃ£o foi confirmada.",
    captureNoTime: "captura sem horÃ¡rio",
    notDecoded: "NÃ£o decodificada",
    mintBurnDetail: "{mints} emissÃ£o(Ãµes) / {burns} queima(s) na janela",
    liveReadout: "{transfers} eventos de transferÃªncia alcanÃ§aram {wallets} carteiras observadas nos Ãºltimos {blocks} blocos. {marketSentence} Isto Ã© um sinal de pesquisa on-chain, nÃ£o uma contagem de investidores nem prova de elegibilidade.",
    liveReadoutWindow: "{transfers} eventos de transferÃªncia alcanÃ§aram {wallets} carteiras observadas na janela selecionada. {marketSentence} Isto Ã© um sinal de pesquisa on-chain, nÃ£o uma contagem de investidores nem prova de elegibilidade.",
    liveLiquidity: "A liquidez pÃºblica em DEX na Mantle soma {liquidity} em {pairs} {pairWord} observado(s).",
    noLiquidity: "A fonte de dados de mercado nÃ£o encontrou um par pÃºblico em DEX na Mantle.",
    circulationDetail: "{wallets} carteiras observadas e {transfers} eventos de transferÃªncia. Carteiras nÃ£o sÃ£o investidores individuais verificados.",
    liquidityDetail: "{liquidity} de liquidez e {volume} de volume em 24h nos pares pÃºblicos de DEX da Mantle.",
    noLiquidityDetail: "Esta fonte nÃ£o retornou liquidez pÃºblica em DEX na Mantle.",
    connectivityDetail: "{pairs} {pairWord} pÃºblico(s) em DEX na Mantle observado(s). Isto nÃ£o mede bolsas centralizadas ou mercados com permissÃ£o.",
    evidenceDetail: "{chainData} e {dexData} estavam disponÃ­veis nesta execuÃ§Ã£o.",
    chainDataYes: "Dados de eventos da blockchain",
    chainDataNo: "Nenhum dado de evento da blockchain",
    dexDataYes: "dados pÃºblicos de DEX",
    dexDataNo: "nenhum dado pÃºblico de DEX",
    mantleRpc: "RPC pÃºblica da Mantle",
    rpcSourceDetail: "Contrato {address}; janela dos Ãºltimos {blocks} blocos",
    rpcSourceFailed: "A solicitaÃ§Ã£o Ã  RPC falhou ou ficou indisponÃ­vel",
    dexSource: "API pÃºblica do DexScreener",
    dexSourceDetail: "{pairs} par(es) da Mantle retornado(s) para este contrato",
    dexSourceFailed: "A solicitaÃ§Ã£o de dados de mercado em DEX falhou ou nÃ£o retornou dados",
    explorer: "Explorador de contratos",
    explorerDetail: "Use o endereÃ§o do contrato para inspecionar cÃ³digo e transaÃ§Ãµes de forma independente.",
    rpcError: "A RPC pÃºblica da Mantle nÃ£o retornou um resultado.",
    dexError: "Os dados pÃºblicos de mercado em DEX nÃ£o estÃ£o disponÃ­veis para este token.",
    dataUnavailable: "Nenhuma das fontes pÃºblicas respondeu. Verifique se o servidor local estÃ¡ aberto e tente de novo.",
    sampleNotice: "Exibindo dados ilustrativos. Informe um contrato ERC-20 real da Mantle para uma anÃ¡lise ao vivo.",
    invalidContract: "Informe um endereÃ§o de contrato ERC-20 vÃ¡lido, iniciado por 0x, na Mantle.",
    collecting: "Coletando evidÃªncias pÃºblicas da Mantle e de DEX. Isso pode levar alguns segundos.",
    complete: "AnÃ¡lise concluÃ­da. Veja a lista de evidÃªncias antes de tirar conclusÃµes.",
    analysisFailed: "NÃ£o foi possÃ­vel concluir a anÃ¡lise.",
    reportDownloaded: "RelatÃ³rio baixado. VocÃª pode guardÃ¡-lo como evidÃªncia para sua inscriÃ§Ã£o.",
    reportTitle: "Mantle Distribution Lens â€” RelatÃ³rio de pesquisa",
    reportGenerated: "Gerado em",
    reportAnalysisType: "Tipo de anÃ¡lise",
    reportAsset: "Ativo",
    reportContract: "Contrato",
    reportScore: "Nota de distribuiÃ§Ã£o observÃ¡vel",
    reportReadout: "Leitura da pesquisa",
    reportSignals: "Sinais observÃ¡veis",
    reportEvidence: "EvidÃªncias e fontes",
    reportMethod: "MÃ©todo e limites",
    reportMethodText: "A nota combina distribuiÃ§Ã£o on-chain, liquidez pÃºblica, acesso de mercado, conectividade e transparÃªncia das evidÃªncias. Fontes anunciadas ou candidatas nÃ£o somam pontos atÃ© serem verificadas.",
    reportSampleWarning: "Este Ã© um exemplo ilustrativo. Ele nÃ£o contÃ©m uma anÃ¡lise ao vivo de um contrato.",
  },
  en: {
    languageLabel: "Language",
    languageAriaLabel: "Choose language",
    pageTitle: "Mantle Distribution Lens",
    version: "DISTRIBUTION RESEARCH Â· V27",
    heroEyebrow: "EVIDENCE-FIRST ONCHAIN RESEARCH",
    heroTitle: "Measure the distribution<br />behind tokenized assets.",
    heroCopy: "Issuance is only the starting line. This research tool turns public Mantle and market data into a transparent view of observable circulation, liquidity, connectivity, and evidence quality.",
    heroNoteEvidence: "Onchain evidence",
    heroNoteMethod: "Transparent method",
    heroNoteRating: "No investment rating",
    consoleEyebrow: "RESEARCH CONSOLE",
    consoleTitle: "Start an analysis",
    consoleNote: "Free public data only Â· Mantle mainnet",
    contractLabel: "Asset contract, symbol, or name",
    contractPlaceholder: "E.g. SPCXx, SpaceX, Tesla, QQQx, or 0x...",
    analyzeButton: "Open latest research",
    analyzeButtonBusy: "Collecting evidenceâ€¦",
    closeAnalysis: "Close analysis",
    contractHint: "Enter a Mantle contract, asset symbol, or asset name. Search uses only the Lens verified local library.",
    sampleButton: "Explore an illustrative sample",
    catalogLabel: "Tracked library",
    catalogLoading: "Loading asset catalogâ€¦",
    catalogChoose: "Choose a published or queued asset",
    catalogHint: "Published assets open a historical snapshot. Queued assets open a preliminary research profile without a final score.",
    staticSnapshotHint: "The library mixes published public snapshots with assets already placed in the research queue. It never asks for a wallet, key, or account.",
    catalogReady: "Library loaded. Choose a published or queued asset.",
    catalogUnavailable: "The published catalog is unavailable right now. Try refreshing the page.",
    searchMatchHint: "Asset found: {name} ({symbol}). You can open the latest research.",
    searchFuzzyHint: "Possible match: {name} ({symbol}). The Lens will open this asset if you continue.",
    searchAmbiguous: "I found more than one similar asset: {matches}. Type a little more of the name or symbol.",
    searchNoMatch: "I could not find that term in the loaded Lens library or catalog.",
    searchResolved: "Opening {name} ({symbol})...",
    assetNotIndexed: "This contract has not yet been published or added to the V12 tracked queue. Choose a library asset or wait for the next promotion.",
    snapshotPending: "This asset is already in the V12 research queue, but its first historical snapshot has not been published yet.",
    snapshotUnavailable: "The published snapshot for this asset could not be loaded right now.",
    dataSnapshot: "PUBLISHED SNAPSHOT",
    snapshotReason: "Distribution updated {date}",
    downloadButton: "Download research brief",
    periodLabel: "Research coverage",
    periodRecent: "Recent pulse Â· latest 5,000 blocks",
    period7d: "Last 7 days",
    period30d: "Last 30 days",
    period1y: "Last year",
    periodAll: "All available history Â· slow",
    periodLifetime: "Full token lifetime",
    periodCustom: "Custom range",
    periodHintRecent: "This is a quick reading of recent activity; it does not represent the token's historical distribution.",
    periodHint7d: "The range is found from real block timestamps, not an assumed network block speed.",
    periodHint30d: "A monthly window compares recent activity without asking for the entire history.",
    periodHint1y: "One year can require many public queries and take longer to finish.",
    periodHintAll: "The tool will locate the contract's creation block and research the history in chunks. Keep this page open.",
    periodHintLifetime: "Published historical snapshot: starts at contract creation and is updated outside the investor experience.",
    periodHintCustom: "Choose a start and end date. The tool will locate the corresponding blocks.",
    startDateLabel: "Start date",
    endDateLabel: "End date",
    invalidDateRange: "Choose a start date before the end date, with no future dates.",
    locatingBlocks: "Locating the blocks that match this timeframeâ€¦",
    locatingContract: "Locating the available start of this contractâ€¦",
    scanningHistory: "Reading transfer events in chunksâ€¦",
    progressQueries: "{done} of {total} blocks queried",
    queryLimitReached: "This timeframe is too large for a free query in one session. Choose a smaller range or try again later.",
    tooManyEvents: "This contract has too many events in this period for a safe local analysis. Choose a smaller range.",
    historyUnavailable: "The public RPC could not locate this contract's historical start. Choose one year, 30 days, or a custom range.",
    coverage: "RESEARCH COVERAGE",
    coverageDetail: "Blocks {from}â€“{to}",
    coverageReadout: "The window covers {start} through {end}.",
    reportCoverage: "Research coverage",
    reportStartBlock: "Start block",
    reportEndBlock: "End block",
    reportStartDate: "Start date",
    reportEndDate: "End date",
    confidenceLabel: "DATA CONFIDENCE",
    summaryDisclaimer: "Research evidence, not a buy or sell recommendation.",
    confidenceHigh: "HIGH",
    confidenceModerate: "MODERATE",
    confidenceLimited: "LIMITED",
    confidenceHighDescription: "Historical coverage and public sources were verified in this run.",
    confidenceModerateDescription: "Useful public evidence is available, but it does not represent every market or investor.",
    confidenceLimitedDescription: "The available window or sources are limited; treat the score carefully.",
    statusEarly: "EARLY SIGNALS",
    statusGrowing: "GROWING",
    statusEstablished: "STRONG SIGNALS",
    statusLimited: "LIMITED EVIDENCE",
    reasonActivity: "{count} observed transfers",
    reasonWallets: "{count} observed wallets",
    reasonLiquidity: "Public DEX liquidity: {amount}",
    reasonNoLiquidity: "No public DEX liquidity observed",
    reasonLifetime: "Coverage from contract creation",
    reasonWindow: "Partial coverage: {label}",
    cacheUsed: "A local history baseline was found; fetching only new blocks.",
    cacheSaved: "History was saved locally. The next query for this token will be faster.",
    resultsEyebrow: "DISTRIBUTION SNAPSHOT",
    scoreLabel: "DISTRIBUTION READINESS",
    readoutLabel: "RESEARCH READOUT",
    assetOverviewLabel: "WHAT THIS ASSET IS",
    scoreMeaningEyebrow: "WHAT THE SCORE MEANS",
    scoreMeaningTitle: "Four observable signals",
    methodBadge: "METHOD V27",
    provenanceEyebrow: "DATA PROVENANCE",
    provenanceTitle: "Evidence used",
    methodEyebrow: "WHY THIS IS NOT A PRICE DASHBOARD",
    methodTitle: "Distribution is more than a listing.",
    methodCopyOne: "A token can have a price while still lacking meaningful circulation, accessible markets, or verifiable liquidity. V12 measures these signals separately, distinguishes the published library, the research queue, and the wider official catalog, and now combines a multi-provider RPC pool, checkpoints, and two controlled workers.",
    methodCopyTwo: "Results are research leads, not a legal, ownership, or investment assessment. A wallet count is not an investor count; a DEX pair is not proof of global access; an announcement is not proof of liquidity.",
    footerLeft: "Mantle Distribution Lens Â· Independent research prototype",
    footerRight: "Built from public, verifiable data",
    researchPrinciples: "Research principles",
    dataSample: "ILLUSTRATIVE SAMPLE",
    dataLive: "LIVE PUBLIC DATA",
    dataPartial: "PARTIAL LIVE DATA",
    sourceSingular: "SOURCE",
    sourcePlural: "SOURCES",
    sourceIntelligenceEyebrow: "",
    sourceIntelligenceTitle: "Where to trade this asset",
    sourceIntelligenceNote: "Method note: {rule}",
    tradeRoutesEyebrow: "WHERE TO TRADE THIS ASSET",
    tradeRoutesTitle: "Verified Mantle routes",
    tradeRoutesCountSingular: "1 ROUTE",
    tradeRoutesCountPlural: "{count} ROUTES",
    tradeRouteAction: "Open route",
    tradeRouteQuote: "Quote: {price}",
    tradeRouteQuoteUnavailable: "Quote unavailable",
    tradeRouteQuoteSimulated: "US$100 simulated route",
    tradeRouteQuoteIndicative: "indicative pool price",
    tradeRouteQuotePool: "pool-implied price",
    tradeRouteTvl: "TVL: {tvl}",
    tradeRouteTvlUnavailable: "TVL unavailable",
    tradeRouteNetwork: "Mantle network",
    tradeRoutePairFallback: "{symbol} / verified market",
    marketTableEyebrow: "MARKET ROUTES",
    marketTableTitle: "Where the asset may circulate",
    sourceRegistryEyebrow: "SOURCE REGISTRY",
    sourceRegistryTitle: "What supports this reading",
    nextEvidenceEyebrow: "NEXT EVIDENCE",
    nextEvidenceTitle: "What still needs confirmation",
    venueColumn: "Venue",
    routeColumn: "Evidence or route",
    stateColumn: "State",
    checkedColumn: "Checked",
    marketObservation: "Public liquidity: {liquidity} Â· 24h volume: {volume}",
    marketContractObserved: "Pool and price state verified onchain",
    countedInScore: "Counts in score",
    notCountedInScore: "Does not count in score yet",
    statusObserved: "OBSERVED",
    statusConfirmed: "CONFIRMED",
    statusAnnounced: "ANNOUNCED",
    statusCandidate: "TO CONFIRM",
    statusMissing: "PENDING",
    reportMarketMap: "Market map",
    reportNextEvidence: "Next evidence",
    notAvailable: "Not available",
    universeEyebrow: "MANTLE RWA UNIVERSE",
    universeTitle: "Tracked asset library",
    universeBadge: "OFFICIAL CATALOG",
    universeCopy: "{catalog} xStocks assets are officially deployed on Mantle. The list below gathers {basket} RWAs with verified routes or observed products; when Mantle onchain proof is missing, the Lens blocks scoring and shows the warning.",
    basketRank: "#{rank} IN BASKET",
    basketTvl: "Selection TVL: {tvl}",
    basketVerified: "VERIFIED ROUTE",
    officialNotTracked: "{symbol} is in the official xStocks Mantle catalog, but it has not yet entered the V12 tracked library.",
    catalogStatusIndexed: "PUBLISHED",
    catalogStatusQueued: "QUEUED",
    basketStatusIndexed: "PUBLISHED SNAPSHOT",
    basketStatusQueued: "IN RESEARCH QUEUE",
    basketStatusOfficial: "OFFICIAL CATALOG",
    discoveredEyebrow: "AUTOMATIC DISCOVERIES",
    discoveredTitle: "New verified pools",
    discoveredCopy: "Pools found automatically through Fluxion Factory events. The route and wrapper were verified onchain; a distribution score appears only after a historical snapshot is published.",
    discoveredStatus: "NEW VERIFIED POOL",
    discoveredTvl: "Observed TVL: {tvl}",
    discoveredCount: "{count} pool(s)",
    assetPagePrev: "Previous",
    assetPageNext: "Next",
    assetPageInfo: "Page {current} of {total}",
    assetListCount: "{count} assets",
    assetListVenue: "{venue} Â· {status}",
    assetTabStocks: "TOKENIZED STOCKS",
    assetTabEtfs: "TOKENIZED ETFs",
    assetTvlLabel: "VERIFIED TVL",
    assetVerificationLabel: "VERIFICATION",
    copyContract: "Copy contract",
    copiedContract: "Contract copied",
    xstockOverview: "{symbol} is an xStock: an ERC-20 token on Mantle representing tokenized exposure to {assetName}. Asset identity is anchored by the official xStocks/Backed catalog and the Mantle contract {contract}. The Lens has indexed onchain events for this contract since {date}. {routeSentence}",
    xstockOverviewRoutes: "Monitored routes in this version: {venues}.",
    xstockOverviewNoRoutes: "No additional monitored route has been confirmed for this asset in this version.",
    observedProductStatus: "OBSERVED PRODUCT",
    unverifiedMantleStatus: "MANTLE UNVERIFIED",
    rwalphaNoScore: "Onchain verification pending",
    rwalphaWarningTitle: "This product cannot yet be verified onchain on Mantle",
    rwalphaWarningCopy: "The product appears in the RWAlpha marketplace with Mantle selected, but the Mantle contract has not been located in the explorer yet. The Lens shows evidence and blocks scoring until a verifiable contract exists.",
    rwalphaReadout: "{symbol} was observed in the RWAlpha marketplace with Mantle selected. The documentation points to a BEP-20 contract on BNB Chain, but no verified Mantle contract is available yet for onchain distribution measurement.",
    rwalphaMetricProduct: "PRODUCT TYPE",
    rwalphaMetricAccess: "ACCESS",
    rwalphaMetricBscContract: "DOCUMENTED CONTRACT",
    rwalphaMetricMantleContract: "MANTLE CONTRACT",
    rwalphaAccessDetail: "Subscribe/redeem via RWAlpha; not a verified DEX route",
    rwalphaBscDetail: "Found as a BEP-20 contract on BNB Chain",
    rwalphaMantleMissing: "Not verified yet",
    rwalphaSignalMarketplace: "Marketplace observed",
    rwalphaSignalMarketplaceDetail: "The product page opens with Mantle selected and shows subscribe/redeem.",
    rwalphaSignalBsc: "BNB Chain contract found",
    rwalphaSignalBscDetail: "The documented contract appears on BscScan as a BEP-20 token/vault.",
    rwalphaSignalMissing: "Mantle contract pending",
    rwalphaSignalMissingDetail: "Without a verifiable Mantle contract, the Lens does not calculate distribution or a score.",
    rwalphaSourceMarketplace: "RWAlpha marketplace",
    rwalphaSourceMarketplaceDetail: "Product observed with chain=mantle on RWAlpha's site.",
    rwalphaSourceDocs: "RWAlpha docs",
    rwalphaSourceDocsDetail: "Documentation describes composition, mint/redeem, risks, and documented contracts.",
    rwalphaSourceBsc: "BscScan",
    rwalphaSourceBscDetail: "Documented contract found as BEP-20; this does not prove Mantle deployment.",
    rwalphaNextEvidenceOne: "Confirm the official Mantle contract with RWAlpha or in the explorer.",
    rwalphaNextEvidenceTwo: "After the Mantle contract is confirmed, publish transfer history before unlocking scoring.",
    snapshotAttemptFailed: "The latest snapshot attempt failed: {error}",
    sampleAssetName: "Sample tokenized equity",
    sampleScoreDescription: "Signals are present, but need deeper liquidity and access verification.",
    sampleReadout: "The sample shows active onchain circulation and basic market connectivity. The next question is whether observed activity represents broad investor access or a small number of operational wallets.",
    sampleObservedWallets: "OBSERVED WALLETS",
    sampleWindow: "In the selected research window",
    sampleTransfers: "TRANSFER EVENTS",
    sampleLatestBlocks: "Latest 5,000 blocks",
    sampleLiquidity: "DEX LIQUIDITY",
    samplePairs: "Across 2 observed pairs",
    sampleConnectivity: "MARKET CONNECTIVITY",
    samplePublicRoute: "Public DEX routing signal",
    circulation: "Circulation",
    liquidity: "Liquidity",
    connectivity: "Connectivity",
    evidenceQuality: "Evidence quality",
    sampleCirculationDetail: "Observed wallets and transfers indicate movement, not verified unique investors.",
    sampleLiquidityDetail: "Public DEX liquidity is a useful signal, but it can change quickly and does not show all venues.",
    sampleConnectivityDetail: "Two observed public pairs provide a limited route into onchain markets.",
    sampleEvidenceDetail: "Core signals can be checked publicly; offchain access and legal eligibility require separate research.",
    mantleBlockchain: "Mantle public blockchain",
    sampleChainDetail: "Illustrative event window for the product demo",
    publicDexData: "Public DEX market data",
    sampleDexDetail: "Illustrative liquidity and pair data for the product demo",
    unknownToken: "Unknown ERC-20",
    tokenFallback: "TOKEN",
    noPair: "No pair found",
    strongScore: "Strong observable signals; verify offchain access and holder concentration next.",
    mediumScore: "Some observable distribution signals; the gaps are as important as the positives.",
    lowScore: "Limited observable distribution signals in this data window.",
    observedWallets: "OBSERVED WALLETS",
    transfers: "TRANSFER EVENTS",
    dexLiquidity: "DEX LIQUIDITY",
    totalSupply: "TOTAL SUPPLY",
    fromTransfers: "From {count} transfer events",
    latestMantleBlocks: "Latest {count} Mantle blocks",
    publicMantlePairs: "{count} public Mantle {pairWord}",
    noPublicPair: "No public pair returned",
    platformTvlMetric: "TVL ON MONITORED PLATFORMS",
    platformMonitoredSingular: "1 monitored platform",
    platformMonitoredPlural: "{count} monitored platforms",
    marketTimeUnavailable: "Market time unavailable",
    marketFreshNow: "Market updated just now",
    marketFreshMinutes: "Market updated {minutes} min ago",
    marketStaleMinutes: "Market data may be stale ({minutes} min)",
    monitoredPlatformsSentence: "Monitored platforms total {tvl} in TVL for this asset.",
    merchantPoolSentence: "The Merchant Moe SPCXx / USDT0 pool had {tvl} in onchain verified reserves. The USD price is a same-pair reference used only to convert those reserves.",
    fluxionQuoteVerified: "Pool, wrapper, and quote simulation confirmed through onchain reads.",
    fluxionQuotePending: "Pool and wrapper confirmed; the quote simulation will be recorded by the updater.",
    platformSourcePoolBalances: "pool balance read onchain",
    platformSourceReserves: "pool reserves read onchain",
    platformSourceSnapshot: "public platform snapshot",
    verifiedPoolTvlMetric: "TVL IN VERIFIED POOLS",
    preparing: "Preparing",
    merchantPoolSignal: "Merchant Moe pool reserves: {tvl}. Volume and price-range depth will be shown separately.",
    merchantPoolDetail: "SPCXx / USDT0 pool reserves read onchain; USD price used only to convert them.",
    merchantPoolPending: "Merchant Moe pool registered; waiting for onchain reserve reads",
    fluxionQuoteSimulation: "Simulated US$100 purchase, without executing a trade",
    fluxionRoutePending: "Fluxion pool and wrapper verified; waiting for QuoterV2 quote",
    monitoredTvlSignal: "{tvl} in TVL on monitored platforms.",
    merchantSourceVerified: "Reserves read directly from the pool contract; USD price is only the same-pair reference used to convert those reserves.",
    merchantSourcePending: "Pool registered; reserve reading has not been confirmed yet.",
    captureNoTime: "capture time unavailable",
    notDecoded: "Not decoded",
    mintBurnDetail: "{mints} mint(s) / {burns} burn(s) in window",
    liveReadout: "{transfers} transfer events touched {wallets} observed wallets in the latest {blocks} blocks. {marketSentence} This is an onchain research signal, not a count of investors or proof of eligibility.",
    liveReadoutWindow: "{transfers} transfer events touched {wallets} observed wallets in the selected window. {marketSentence} This is an onchain research signal, not a count of investors or proof of eligibility.",
    liveLiquidity: "Public Mantle DEX liquidity totals {liquidity} across {pairs} observed {pairWord}.",
    noLiquidity: "No public Mantle DEX pair was found by the market-data source.",
    circulationDetail: "{wallets} observed wallets and {transfers} transfer events. Wallets are not verified individual investors.",
    liquidityDetail: "{liquidity} liquidity and {volume} 24h volume across public Mantle DEX pairs.",
    noLiquidityDetail: "No public Mantle DEX liquidity was returned by this source.",
    connectivityDetail: "{pairs} public Mantle DEX {pairWord} observed. This does not measure centralized or permissioned venues.",
    evidenceDetail: "{chainData} and {dexData} were available for this run.",
    chainDataYes: "Blockchain event data",
    chainDataNo: "No blockchain event data",
    dexDataYes: "public DEX data",
    dexDataNo: "no public DEX data",
    mantleRpc: "Mantle public RPC",
    rpcSourceDetail: "Contract {address}; latest {blocks}-block event window",
    rpcSourceFailed: "The RPC request failed or was unavailable",
    dexSource: "DexScreener public API",
    dexSourceDetail: "{pairs} Mantle pair(s) returned for this contract",
    dexSourceFailed: "The DEX market-data request failed or returned no data",
    explorer: "Contract explorer",
    explorerDetail: "Use the contract address to independently inspect code and transactions.",
    rpcError: "Mantle public RPC did not return a result.",
    dexError: "Public DEX market data is unavailable for this token.",
    dataUnavailable: "Neither public data source responded. Check that the local server is running and try again.",
    sampleNotice: "Showing illustrative sample data. Enter a real Mantle ERC-20 contract for a live run.",
    invalidContract: "Enter a valid 0xâ€¦ ERC-20 contract address on Mantle.",
    collecting: "Collecting public Mantle and DEX evidence. This can take a few seconds.",
    complete: "Analysis complete. Inspect the evidence list before drawing conclusions.",
    analysisFailed: "The analysis could not be completed.",
    reportDownloaded: "Report downloaded. You can keep it as evidence for your submission.",
    reportTitle: "Mantle Distribution Lens â€” Research Brief",
    reportGenerated: "Generated on",
    reportAnalysisType: "Analysis type",
    reportAsset: "Asset",
    reportContract: "Contract",
    reportScore: "Observable distribution score",
    reportReadout: "Research readout",
    reportSignals: "Observable signals",
    reportEvidence: "Evidence and sources",
    reportMethod: "Method and boundaries",
    reportMethodText: "The score combines onchain distribution, public liquidity, market access, connectivity, and evidence transparency. Announced or candidate sources earn no points until verified.",
    reportSampleWarning: "This is an illustrative sample. It does not contain a live contract analysis.",
  },
};

Object.assign(COPY["pt-BR"], {
  previewNoScore: "Aguardando snapshot publicado",
  previewStatus: "EM FILA DE PESQUISA",
  previewReadout: "{symbol} ja aparece no catalogo oficial xStocks da Mantle e em uma rota publica observavel na cesta inicial de liquidez. Este perfil mostra evidencia oficial e de mercado, mas ainda nao calcula nota de distribuicao porque o snapshot historico desse ativo ainda nao foi publicado.",
  previewContractMetric: "CONTRATO OFICIAL",
  previewWrapperMetric: "WRAPPER OBSERVADO",
  previewPoolMetric: "POOL OBSERVADA",
  previewVolumeMetric: "VOLUME 24H DA SELECAO",
  previewTvlDetail: "TVL capturado na selecao da cesta Fluxion",
  previewVolumeDetail: "Volume 24h capturado na selecao da cesta Fluxion",
  previewSignalOfficial: "Implantacao oficial confirmada",
  previewSignalOfficialDetail: "O catalogo oficial xStocks / Backed lista este contrato na Mantle.",
  previewSignalRoute: "Rota publica observavel",
  previewSignalRouteDetail: "A cesta de liquidez tem pool, wrapper e ativo ligados on-chain para este item.",
  previewSignalPending: "Snapshot historico ainda pendente",
  previewSignalPendingDetail: "Antes da nota final, ainda precisamos publicar a cobertura historica de transferencias desse ativo.",
  previewSourceOfficial: "Catalogo oficial xStocks",
  previewSourceOfficialDetail: "A API oficial da Backed confirma este contrato e seus wrappers na Mantle.",
  previewSourceLegal: "Visao legal do produto xStocks",
  previewSourceLegalDetail: "A documentacao legal do emissor ajuda a enquadrar o produto, mas nao substitui a pesquisa do ativo especifico.",
  previewSourceBasket: "Cesta inicial de liquidez Fluxion",
  previewSourceBasketDetail: "A selecao publicada lista TVL e volume para este par. Esses valores sao uma captura de pesquisa, nao dados ao vivo.",
  previewSourcePool: "Pool publica verificada",
  previewSourcePoolDetail: "A relacao USDC -> wrapper -> ativo foi verificada para esta pool da cesta.",
  previewNextEvidenceOne: "Publicar o snapshot historico completo deste ativo para liberar a nota.",
  previewNextEvidenceTwo: "Adicionar pelo menos uma segunda venue ou rota independente, quando existir.",
  previewReady: "Perfil preliminar carregado. As evidencias oficiais e de mercado ja podem ser lidas, mas a nota continua bloqueada ate o snapshot historico ser publicado."
});

Object.assign(COPY.en, {
  previewNoScore: "Awaiting published snapshot",
  previewStatus: "IN RESEARCH QUEUE",
  previewReadout: "{symbol} already appears in the official xStocks Mantle catalog and in an observable public route from the starter liquidity basket. This profile shows official and market evidence, but it does not calculate a distribution score because the historical snapshot for this asset has not been published yet.",
  previewContractMetric: "OFFICIAL CONTRACT",
  previewWrapperMetric: "OBSERVED WRAPPER",
  previewPoolMetric: "OBSERVED POOL",
  previewVolumeMetric: "SELECTION 24H VOLUME",
  previewTvlDetail: "TVL captured from the Fluxion starter basket selection",
  previewVolumeDetail: "24h volume captured from the Fluxion starter basket selection",
  previewSignalOfficial: "Official deployment confirmed",
  previewSignalOfficialDetail: "The official xStocks / Backed catalog lists this contract on Mantle.",
  previewSignalRoute: "Public route is observable",
  previewSignalRouteDetail: "The liquidity basket links pool, wrapper, and underlying asset onchain for this item.",
  previewSignalPending: "Historical snapshot still pending",
  previewSignalPendingDetail: "Before a final score, this asset still needs published historical transfer coverage.",
  previewSourceOfficial: "Official xStocks catalog",
  previewSourceOfficialDetail: "The official Backed API confirms this contract and its wrappers on Mantle.",
  previewSourceLegal: "xStocks legal overview",
  previewSourceLegalDetail: "The issuer's legal documentation helps frame the product, but it does not replace asset-specific research.",
  previewSourceBasket: "Fluxion starter liquidity basket",
  previewSourceBasketDetail: "The published selection lists TVL and volume for this pair. These values are a research capture, not live data.",
  previewSourcePool: "Verified public pool",
  previewSourcePoolDetail: "The USDC -> wrapper -> asset relationship was verified for this basket pool.",
  previewNextEvidenceOne: "Publish the full historical snapshot for this asset to unlock scoring.",
  previewNextEvidenceTwo: "Add at least one second venue or independent route, when available.",
  previewReady: "Preliminary profile loaded. Official and market evidence can already be reviewed, but scoring remains blocked until the historical snapshot is published."
});

Object.assign(COPY["pt-BR"], {
  version: "PESQUISA DE DISTRIBUICAO Â· V29",
  methodBadge: "METODO V29",
  flowEyebrow: "COMO USAR O LENS",
  flowTitle: "Da escolha do ativo a evidencia.",
  flowOneTitle: "Escolha um ativo",
  flowOneCopy: "Use a biblioteca acompanhada ou cole um contrato Mantle para abrir a pesquisa.",
  flowTwoTitle: "Leia o retrato",
  flowTwoCopy: "Veja primeiro a nota, a leitura simples e a idade dos dados de mercado.",
  flowThreeTitle: "Confira as evidencias",
  flowThreeCopy: "Use fontes, rotas e lacunas para decidir o que ainda precisa ser verificado.",
  guideScoreLabel: "1 Â· Nota",
  guideScoreCopy: "Resumo rapido da prontidao de distribuicao. Nao e recomendacao de compra.",
  guideMarketLabel: "2 Â· Mercado",
  guideMarketCopy: "TVL mostra liquidez monitorada nas plataformas verificadas; pode mudar rapido.",
  guideEvidenceLabel: "3 Â· Evidencias",
  guideEvidenceCopy: "Fontes verdes contam mais; fontes pendentes aparecem como lacunas, nao como prova.",
  methodCopyOne: "Um token pode ter preco e ainda assim nao ter circulacao relevante, mercados acessiveis ou liquidez verificavel. A V29 organiza esses sinais em uma experiencia de pesquisa: biblioteca, fila, fontes, rotas, TVL monitorado e lacunas ficam separados para reduzir confusao.",
  methodCopyTwo: "Os resultados sao pistas de pesquisa, nao uma analise juridica, de propriedade ou de investimento. Uma contagem de carteiras nao e uma contagem de investidores; um par em DEX nao prova acesso global; uma fonte pendente nao vira prova so por aparecer na tela."
});

Object.assign(COPY.en, {
  version: "DISTRIBUTION RESEARCH Â· V29",
  methodBadge: "METHOD V29",
  flowEyebrow: "HOW TO USE THE LENS",
  flowTitle: "From asset selection to evidence.",
  flowOneTitle: "Choose an asset",
  flowOneCopy: "Use the tracked library or paste a Mantle contract to open the research view.",
  flowTwoTitle: "Read the snapshot",
  flowTwoCopy: "Start with the score, the plain-language readout, and market-data freshness.",
  flowThreeTitle: "Check the evidence",
  flowThreeCopy: "Use sources, routes, and gaps to decide what still needs verification.",
  guideScoreLabel: "1 Â· Score",
  guideScoreCopy: "A quick view of distribution readiness. It is not a buy recommendation.",
  guideMarketLabel: "2 Â· Market",
  guideMarketCopy: "TVL shows monitored liquidity on verified platforms; it can move quickly.",
  guideEvidenceLabel: "3 Â· Evidence",
  guideEvidenceCopy: "Green sources carry more weight; pending sources are shown as gaps, not proof.",
  methodCopyOne: "A token can have a price while still lacking meaningful circulation, accessible markets, or verifiable liquidity. V29 organizes those signals into a research experience: library, queue, sources, routes, monitored TVL, and gaps stay separated to reduce confusion.",
  methodCopyTwo: "Results are research leads, not a legal, ownership, or investment assessment. A wallet count is not an investor count; a DEX pair is not proof of global access; a pending source does not become proof because it appears on screen."
});

let activeLocale = APP_CONFIG.defaultLocale;
let currentAnalysis = { type: "sample" };
let lastRenderedAnalysis = null;
let publishedRegistry = null;
let officialCatalog = null;
let liquidityBasket = null;
let merchantMoeRoutes = null;
let merchantMoeDiscoveredRoutes = null;
let fluxionDirectRoutes = null;
let fluxionDiscoveredRoutes = null;
let platformTvl = null;
let rwalphaProducts = null;
let assetListPage = 0;
let activeAssetCategory = "stocks";
const ASSET_PAGE_SIZE = 10;
const XSTOCK_IMAGE_EXTENSIONS = Object.freeze({
  SPCXx: "png",
  USPXx: "png",
});
const RWALPHA_IMAGE_FILES = Object.freeze({
  rAI: "rai.png",
  rAIX: "raix.png",
  rSTR: "rstr.png",
});
const SEARCH_STOPWORDS = new Set([
  "asset",
  "ativo",
  "token",
  "tokenized",
  "tokenizada",
  "tokenizadas",
  "stock",
  "stocks",
  "xstock",
  "xstocks",
  "etf",
  "etfs",
  "vault",
  "rwa",
  "mantle",
]);
const CACHE_DB_NAME = "mantle-distribution-lens";
const CACHE_STORE_NAME = "lifetime-history";
const CACHE_SCHEMA_VERSION = 1;

const element = (id) => document.getElementById(id);

function t(key, values = {}) {
  const template = COPY[activeLocale]?.[key] ?? COPY.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);
}

function formatNumber(value) {
  return new Intl.NumberFormat(activeLocale).format(value);
}

function formatUsd(value) {
  return new Intl.NumberFormat(activeLocale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatUsdPrice(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "";
  const digits = numeric >= 100 ? 2 : numeric >= 1 ? 4 : 6;
  return new Intl.NumberFormat(activeLocale, { style: "currency", currency: "USD", maximumFractionDigits: digits }).format(numeric);
}

function marketFreshness(timestamp) {
  const capturedAt = new Date(timestamp || 0);
  const ageMinutes = Math.max(0, Math.round((Date.now() - capturedAt.getTime()) / 60000));
  if (!Number.isFinite(ageMinutes) || capturedAt.getTime() === 0) return t("marketTimeUnavailable");
  if (ageMinutes < 2) return t("marketFreshNow");
  if (ageMinutes <= 30) return t("marketFreshMinutes", { minutes: ageMinutes });
  return t("marketStaleMinutes", { minutes: ageMinutes });
}

function latestTimestamp(values, fallback = null) {
  const latest = values
    .map((value) => new Date(value || 0).getTime())
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((left, right) => right - left)[0];
  return latest ? new Date(latest).toISOString() : fallback;
}

function formatDataTime(timestamp) {
  const date = new Date(timestamp || 0);
  if (!Number.isFinite(date.getTime()) || date.getTime() === 0) return t("notAvailable");
  return new Intl.DateTimeFormat(activeLocale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function researchRecency(analysis) {
  const snapshotLabel = activeLocale === "pt-BR" ? "DistribuiÃ§Ã£o indexada atÃ©" : "Distribution indexed through";
  const marketLabel = activeLocale === "pt-BR" ? "Mercado atualizado" : "Market updated";
  const unavailable = activeLocale === "pt-BR" ? "nÃ£o disponÃ­vel" : "unavailable";
  const snapshotTime = analysis.snapshotUpdatedAt ? formatDataTime(analysis.snapshotUpdatedAt) : unavailable;
  const marketTime = analysis.marketUpdatedAt ? `${marketFreshness(analysis.marketUpdatedAt)} (${formatDataTime(analysis.marketUpdatedAt)})` : unavailable;
  return `<span><strong>${escapeHtml(snapshotLabel)}:</strong> ${escapeHtml(snapshotTime)}</span><span aria-hidden="true">Â·</span><span><strong>${escapeHtml(marketLabel)}:</strong> ${escapeHtml(marketTime)}</span>`;
}

function buildXstockAssetOverview({ address, name, symbol, window, marketRoute, monitoredPlatforms = [] }) {
  const official = officialAsset(address);
  if (!official) return "";
  const indexedFrom = window?.fromTimestamp
    ? formatDataTime(window.fromTimestamp * 1000)
    : t("notAvailable");
  const venues = [...new Set([
    ...monitoredPlatforms.map((platform) => platform.platform),
    marketRoute?.venue,
  ].filter(Boolean))];
  const routeSentence = venues.length
    ? t("xstockOverviewRoutes", { venues: venues.join(" + ") })
    : t("xstockOverviewNoRoutes");
  return t("xstockOverview", {
    symbol: symbol || official.symbol || t("tokenFallback"),
    assetName: name || official.name || t("unknownToken"),
    contract: shortAddress(address),
    date: indexedFrom,
    routeSentence,
  });
}

function safeText(value, fallback = t("notAvailable")) {
  return value === undefined || value === null || value === "" ? fallback : String(value);
}

function escapeHtml(value) {
  return safeText(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;",
  }[character]));
}

function getSampleAnalysis() {
  return {
    kind: "sample",
    assetName: t("sampleAssetName"),
    symbol: "SAMPLE",
    totalScore: 61,
    scoreDescription: t("sampleScoreDescription"),
    readout: t("sampleReadout"),
    metrics: [
      [t("sampleObservedWallets"), "286", t("sampleWindow")],
      [t("sampleTransfers"), "1,942", t("sampleLatestBlocks")],
      [t("sampleLiquidity"), "$182K", t("samplePairs")],
      [t("sampleConnectivity"), "2", t("samplePublicRoute")],
    ],
    signals: [
      [`${t("circulation")} Â· 27/35`, t("sampleCirculationDetail")],
      [`${t("liquidity")} Â· 15/30`, t("sampleLiquidityDetail")],
      [`${t("connectivity")} Â· 10/20`, t("sampleConnectivityDetail")],
      [`${t("evidenceQuality")} Â· 9/15`, t("sampleEvidenceDetail")],
    ],
    sources: [
      [t("mantleBlockchain"), t("sampleChainDetail"), true],
      [t("publicDexData"), t("sampleDexDetail"), true],
    ],
  };
}

function renderAnalysis(analysis) {
  lastRenderedAnalysis = analysis;
  element("assetName").textContent = analysis.symbol ? `${analysis.assetName} Â· ${analysis.symbol}` : analysis.assetName;
  const scoreValue = Number.isFinite(Number(analysis.totalScore)) ? Number(analysis.totalScore) : 0;
  const scoreCard = element("scoreCard");
  if (scoreCard) {
    scoreCard.classList.toggle("warning-card", Boolean(analysis.warning));
  }
  element("totalScore").textContent = analysis.scoreDisplay || analysis.totalScore;
  element("scoreMeter").style.width = `${Math.max(0, Math.min(100, scoreValue))}%`;
  element("scoreDescription").textContent = analysis.scoreDescription;
  const isAssetOverview = Boolean(analysis.assetOverview);
  element("readoutLabel").textContent = isAssetOverview ? t("assetOverviewLabel") : t("readoutLabel");
  element("researchReadout").textContent = isAssetOverview ? analysis.assetOverview : analysis.readout;
  const presentation = analysis.presentation || makePresentation(analysis);
  const status = element("distributionStatus");
  status.textContent = presentation.status;
  status.className = `status-pill ${presentation.statusTone}`;
  element("dataConfidence").textContent = presentation.confidence;
  element("confidenceDescription").textContent = presentation.confidenceDescription;
  element("confidenceRow").hidden = isAssetOverview;
  element("quickReasons").hidden = isAssetOverview;
  element("researchRecency").hidden = isAssetOverview;
  element("quickReasons").innerHTML = presentation.reasons.map((reason) => `<span>${escapeHtml(reason)}</span>`).join("");
  element("researchRecency").innerHTML = researchRecency(analysis);

  const state = element("dataState");
  state.textContent = analysis.snapshot ? t("dataSnapshot") : analysis.kind === "live" ? t("dataLive") : analysis.kind === "partial" ? t("dataPartial") : t("dataSample");
  state.className = `data-state ${analysis.snapshot || analysis.kind === "live" ? "live" : analysis.kind === "partial" ? "partial" : "sample"}`;

  element("metricsGrid").innerHTML = analysis.metrics.map(([label, value, detail]) => `
    <article class="metric">
      <span class="metric-label">${escapeHtml(label)}</span>
      <strong class="metric-value">${escapeHtml(value)}</strong>
      <span class="metric-detail">${escapeHtml(detail)}</span>
    </article>`).join("");

  element("signalList").innerHTML = analysis.signals.map(([title, detail]) => `
    <li><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></li>`).join("");

  element("sourceCount").textContent = `${analysis.sources.length} ${analysis.sources.length === 1 ? t("sourceSingular") : t("sourcePlural")}`;
  element("sourceList").innerHTML = analysis.sources.map(([title, detail, available, link]) => {
    const label = link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noreferrer">${escapeHtml(title)}</a>` : escapeHtml(title);
    return `<li><span class="source-dot ${available ? "" : "muted"}"></span><span class="source-copy"><strong>${label}</strong><span>${escapeHtml(detail)}</span></span></li>`;
  }).join("");
  renderTradeRoutes(analysis);
  renderResearchMap(analysis.research);
}

function renderTradeRoutes(analysis) {
  const section = element("tradeRoutesPanel");
  const routes = tradingRoutesForAsset(analysis);
  section.hidden = routes.length === 0;
  element("tradeRoutesCount").textContent = routes.length === 1 ? t("tradeRoutesCountSingular") : t("tradeRoutesCountPlural", { count: routes.length });
  element("tradeRouteList").innerHTML = routes.map((route) => {
    const tvl = Number(route.tvlUsd || 0) > 0 ? t("tradeRouteTvl", { tvl: formatUsd(route.tvlUsd) }) : t("tradeRouteTvlUnavailable");
    const quote = route.quote?.priceUsd ? t("tradeRouteQuote", { price: formatUsdPrice(route.quote.priceUsd) }) : t("tradeRouteQuoteUnavailable");
    const quoteDetail = route.quote?.label ? t(route.quote.label) : "";
    return `
      <article class="trade-route-card">
        <div class="trade-venue-mark">
          <span>${escapeHtml(venueInitials(route.venue))}</span>
          <img src="${escapeHtml(venueLogoPath(route.venue))}" alt="" loading="lazy" onerror="this.onerror=()=>{this.hidden=true};this.src='${escapeHtml(venueLogoFallbackPath(route.venue))}'" />
        </div>
        <div class="trade-route-venue">
          <span class="trade-venue">${escapeHtml(route.venue)}</span>
          <span>${escapeHtml(t("tradeRouteNetwork"))}</span>
        </div>
        <div class="trade-route-pair">
          <strong>${escapeHtml(route.pair)}</strong>
        </div>
        <div class="trade-route-quote">
          <strong>${escapeHtml(quote)}</strong>
          ${quoteDetail ? `<span>${escapeHtml(quoteDetail)}</span>` : ""}
        </div>
        <div class="trade-route-tvl">
          <span>${escapeHtml(tvl)}</span>
        </div>
        <a class="trade-route-action" href="${escapeHtml(route.url)}" target="_blank" rel="noreferrer">${escapeHtml(t("tradeRouteAction"))}</a>
      </article>`;
  }).join("");
}

function localizedValue(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value[activeLocale] || value["pt-BR"] || value.en || "";
}

function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function researchStatusLabel(status) {
  const labels = {
    observed: "statusObserved",
    confirmed: "statusConfirmed",
    announced: "statusAnnounced",
    candidate: "statusCandidate",
    missing: "statusMissing",
  };
  return t(labels[status] || "statusCandidate");
}

function formatResearchDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "â€”";
  return new Intl.DateTimeFormat(activeLocale, { dateStyle: "medium" }).format(date);
}

function marketObservationSummary(market) {
  const observed = market.verification?.lastObserved;
  if (!observed) return "";
  if (market.verification?.kind === "dexscreener_pair") {
    return t("marketObservation", { liquidity: formatUsd(Number(observed.liquidityUsd || 0)), volume: formatUsd(Number(observed.volumeH24 || 0)) });
  }
  if (market.verification?.kind === "uniswap_v3_wrapper_pool" && observed.slot0Available) return t("marketContractObserved");
  return "";
}

function renderResearchMap(research) {
  const section = element("sourceIntelligence");
  if (!research) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  element("marketMapEyebrow").textContent = t("sourceIntelligenceEyebrow");
  element("market-map-title").textContent = t("sourceIntelligenceTitle");
  element("sourceMethodBadge").textContent = `${activeLocale === "pt-BR" ? "MÃ‰TODO" : "METHOD"} ${research.methodVersion || "V8"}`;
  element("marketMapNote").textContent = t("sourceIntelligenceNote", { rule: localizedValue(research.identity?.rule) });
  element("marketTableEyebrow").textContent = t("marketTableEyebrow");
  element("marketTableTitle").textContent = t("marketTableTitle");
  element("sourceRegistryEyebrow").textContent = t("sourceRegistryEyebrow");
  element("sourceRegistryTitle").textContent = t("sourceRegistryTitle");
  element("nextEvidenceEyebrow").textContent = t("nextEvidenceEyebrow");
  element("nextEvidenceTitle").textContent = t("nextEvidenceTitle");
  element("venueColumn").textContent = t("venueColumn");
  element("routeColumn").textContent = t("routeColumn");
  element("stateColumn").textContent = t("stateColumn");
  element("checkedColumn").textContent = t("checkedColumn");

  element("marketMapRows").innerHTML = (research.markets || []).map((market) => {
    const href = safeExternalUrl(market.sourceUrl);
    const venue = href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(market.venue)}</a>` : escapeHtml(market.venue);
    const observation = marketObservationSummary(market);
    return `<tr><td>${venue}</td><td>${escapeHtml(localizedValue(market.route))}${observation ? `<span class="market-observation">${escapeHtml(observation)}</span>` : ""}</td><td><span class="status-tag ${escapeHtml(market.status)}">${escapeHtml(researchStatusLabel(market.status))}</span></td><td>${escapeHtml(formatResearchDate(market.lastCheckedAt))}</td></tr>`;
  }).join("");

  element("researchSourceList").innerHTML = (research.sources || []).map((source) => {
    const href = safeExternalUrl(source.url);
    const title = href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(source.name)}</a>` : escapeHtml(source.name);
    const scoreUse = source.scoreEligible ? t("countedInScore") : t("notCountedInScore");
    return `<li><div class="source-row"><div><strong>${title}</strong><span class="source-type">${escapeHtml(localizedValue(source.type))}</span></div><span class="status-tag ${escapeHtml(source.status)}">${escapeHtml(researchStatusLabel(source.status))}</span></div><span class="source-detail">${escapeHtml(localizedValue(source.detail))}</span><span class="score-use ${source.scoreEligible ? "" : "no"}">${escapeHtml(scoreUse)} Â· ${escapeHtml(formatResearchDate(source.lastCheckedAt))}</span></li>`;
  }).join("");
  element("nextEvidenceList").innerHTML = (research.nextEvidence || []).map((item) => `<li>${escapeHtml(localizedValue(item))}</li>`).join("");
}

function shortAddress(address) {
  const value = safeText(address, "");
  if (value.length < 10) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function normalizeSearchText(value) {
  return safeText(value, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compactSearchText(value) {
  return normalizeSearchText(value).replace(/\s+/g, "");
}

function searchTokens(value) {
  return normalizeSearchText(value)
    .split(/\s+/)
    .filter((token) => token && !SEARCH_STOPWORDS.has(token));
}

function addSearchAlias(aliases, value) {
  const normalized = normalizeSearchText(value);
  if (normalized) aliases.add(normalized);
  const compact = compactSearchText(value);
  if (compact && compact !== normalized) aliases.add(compact);
}

function aliasesForSearchAsset(asset) {
  const aliases = new Set();
  addSearchAlias(aliases, asset.symbol);
  addSearchAlias(aliases, asset.name);
  addSearchAlias(aliases, asset.id);
  addSearchAlias(aliases, asset.address);
  addSearchAlias(aliases, asset.pool);
  addSearchAlias(aliases, asset.documentedBscContract);
  (asset.wrappers || []).forEach((wrapper) => addSearchAlias(aliases, wrapper.address));

  const symbol = safeText(asset.symbol, "");
  if (symbol) {
    addSearchAlias(aliases, symbol.replace(/x$/i, ""));
    addSearchAlias(aliases, symbol.replace(/xstock$/i, ""));
  }

  const cleanName = safeText(asset.name, "")
    .replace(/\bxstock\b/gi, "")
    .replace(/\btokenized\b/gi, "")
    .replace(/\btoken\b/gi, "")
    .trim();
  addSearchAlias(aliases, cleanName);
  searchTokens(cleanName).forEach((token) => addSearchAlias(aliases, token));

  const symbolKey = symbol.toLowerCase();
  if (symbolKey === "spcxx") {
    ["spacex", "space x", "space exploration"].forEach((alias) => addSearchAlias(aliases, alias));
  }
  if (symbolKey === "spyx") {
    ["sp500", "sp 500", "s p 500", "s and p 500"].forEach((alias) => addSearchAlias(aliases, alias));
  }
  if (symbolKey === "qqqx") {
    ["qqq", "nasdaq", "nasdaq 100"].forEach((alias) => addSearchAlias(aliases, alias));
  }

  return [...aliases].filter(Boolean);
}

function mergeSearchAsset(map, asset, priority = 50) {
  const address = safeText(asset?.address, "");
  if (!address) return;
  const key = address.toLowerCase();
  const existing = map.get(key);
  const merged = {
    ...(existing || {}),
    ...asset,
    address,
    priority: Math.min(existing?.priority ?? priority, priority),
  };
  merged.aliases = [...new Set([...(existing?.aliases || []), ...aliasesForSearchAsset(merged)])];
  map.set(key, merged);
}

function collectSearchableAssets() {
  const map = new Map();
  (officialCatalog?.assets || []).forEach((asset) => mergeSearchAsset(map, asset, 60));
  (publishedRegistry?.assets || []).forEach((asset) => mergeSearchAsset(map, asset, asset.status === "indexed" ? 5 : 20));
  collectResearchAssets().forEach((asset) => mergeSearchAsset(map, asset, asset.sourceType === "observed" ? 30 : 10));
  (rwalphaProducts?.products || []).forEach((product) => mergeSearchAsset(map, product, 30));
  return [...map.values()].map((asset) => ({
    ...asset,
    aliases: [...new Set([...(asset.aliases || []), ...aliasesForSearchAsset(asset)])],
  }));
}

function boundedLevenshtein(left, right, maxDistance = 3) {
  if (left === right) return 0;
  if (!left || !right) return Math.max(left.length, right.length);
  if (Math.abs(left.length - right.length) > maxDistance) return maxDistance + 1;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    let rowMin = current[0];
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      const value = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost
      );
      current[j] = value;
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > maxDistance) return maxDistance + 1;
    previous = current;
  }
  return previous[right.length];
}

function searchScoreForAsset(asset, query) {
  const rawQuery = safeText(query, "").trim();
  const normalizedQuery = normalizeSearchText(rawQuery);
  const compactQuery = compactSearchText(rawQuery);
  const queryWords = searchTokens(rawQuery);
  if (!compactQuery || SEARCH_STOPWORDS.has(normalizedQuery)) return 0;

  const addressQuery = rawQuery.toLowerCase();
  const addressAliases = [asset.address, asset.pool, asset.documentedBscContract, ...(asset.wrappers || []).map((wrapper) => wrapper.address)]
    .map((value) => safeText(value, "").toLowerCase())
    .filter(Boolean);
  if (addressAliases.includes(addressQuery)) return 1000;

  let best = 0;
  for (const alias of asset.aliases || []) {
    const normalizedAlias = normalizeSearchText(alias);
    const compactAlias = compactSearchText(alias);
    if (!compactAlias) continue;
    if (normalizedAlias === normalizedQuery || compactAlias === compactQuery) best = Math.max(best, 960);
    if (compactQuery.length >= 2 && compactAlias.startsWith(compactQuery)) best = Math.max(best, 860 - Math.min(120, compactAlias.length - compactQuery.length));
    if (compactQuery.length >= 3 && compactAlias.includes(compactQuery)) best = Math.max(best, 780 - Math.min(100, compactAlias.length - compactQuery.length));
    if (queryWords.length && queryWords.every((word) => normalizedAlias.split(" ").includes(word))) best = Math.max(best, 740);

    const allowedDistance = compactQuery.length <= 4 ? 1 : compactQuery.length <= 8 ? 2 : 3;
    if (compactQuery.length >= 4) {
      const distance = boundedLevenshtein(compactQuery, compactAlias, allowedDistance);
      if (distance <= allowedDistance) best = Math.max(best, 690 - distance * 70);
    }
  }
  return best;
}

function describeSearchAsset(asset) {
  return `${asset.name || t("unknownToken")} (${asset.symbol || t("tokenFallback")})`;
}

function resolveAssetQuery(query) {
  const rawQuery = safeText(query, "").trim();
  if (!rawQuery) return { status: "empty" };
  if (isAddress(rawQuery)) return { status: "resolved", address: rawQuery.toLowerCase(), exact: true };

  const scored = collectSearchableAssets()
    .map((asset) => ({ asset, score: searchScoreForAsset(asset, rawQuery) }))
    .filter((item) => item.score >= 560)
    .sort((left, right) => right.score - left.score || left.asset.priority - right.asset.priority || safeText(left.asset.symbol, "").localeCompare(safeText(right.asset.symbol, "")));

  if (!scored.length) return { status: "not-found" };

  const [best, second] = scored;
  const exact = best.score >= 900;
  const confident = exact || best.score >= 720 || !second || best.score - second.score >= 90;
  const closeMatches = scored.filter((item) => best.score - item.score < 90).slice(0, 4);
  if (!confident && closeMatches.length > 1) {
    return { status: "ambiguous", matches: closeMatches.map((item) => item.asset) };
  }
  return { status: "resolved", address: best.asset.address, asset: best.asset, exact };
}

function rankedAssetSuggestions(query, limit = 5) {
  const rawQuery = safeText(query, "").trim();
  if (compactSearchText(rawQuery).length < 2) return [];
  return collectSearchableAssets()
    .map((asset) => ({ asset, score: searchScoreForAsset(asset, rawQuery) }))
    .filter((item) => item.score >= 560)
    .sort((left, right) => right.score - left.score || left.asset.priority - right.asset.priority || safeText(left.asset.symbol, "").localeCompare(safeText(right.asset.symbol, "")))
    .slice(0, limit)
    .map((item) => item.asset);
}

function hideSearchSuggestions() {
  const box = element("assetSearchSuggestions");
  if (!box) return;
  box.hidden = true;
  box.innerHTML = "";
}

function showSearchSuggestions(query) {
  const box = element("assetSearchSuggestions");
  if (!box) return;
  const suggestions = rankedAssetSuggestions(query);
  if (!suggestions.length) {
    hideSearchSuggestions();
    return;
  }
  box.innerHTML = suggestions.map((asset) => `
    <button type="button" class="asset-search-suggestion" data-search-address="${escapeHtml(asset.address)}">
      <strong>${escapeHtml(asset.symbol || t("tokenFallback"))}</strong>
      <span>${escapeHtml(asset.name || t("unknownToken"))}</span>
    </button>
  `).join("");
  box.hidden = false;
  box.querySelectorAll("[data-search-address]").forEach((button) => {
    button.addEventListener("click", () => {
      const address = button.dataset.searchAddress || "";
      const asset = registryAsset(address) || officialAsset(address) || observedProduct(address);
      element("contractInput").value = asset?.symbol || address;
      hideSearchSuggestions();
      analyzeAddress(address);
    });
  });
}

async function copyTextToClipboard(text) {
  const value = safeText(text, "").trim();
  if (!value) return false;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(field);
  return copied;
}

async function copyAssetContract(button) {
  const contract = button?.dataset?.copyContract || "";
  try {
    const copied = await copyTextToClipboard(contract);
    if (!copied) return;
    const label = button.querySelector("span");
    const previous = label?.textContent || "";
    button.classList.add("copied");
    if (label) label.textContent = t("copiedContract");
    window.setTimeout(() => {
      button.classList.remove("copied");
      if (label) label.textContent = previous;
    }, 1200);
  } catch {
    // Clipboard is a convenience only; the visible short address remains available.
  }
}

function officialAsset(address) {
  const normalized = safeText(address, "").toLowerCase();
  if (!normalized) return null;
  return (officialCatalog?.assets || []).find((asset) => asset.address?.toLowerCase() === normalized || (asset.wrappers || []).some((wrapper) => wrapper.address?.toLowerCase() === normalized)) || null;
}

function basketAsset(address) {
  const normalized = safeText(address, "").toLowerCase();
  if (!normalized) return null;
  return [...(liquidityBasket?.assets || []), ...(fluxionDirectRoutes?.routes || []), ...(fluxionDiscoveredRoutes?.routes || [])]
    .find((asset) => asset.address?.toLowerCase() === normalized || asset.underlying?.toLowerCase() === normalized || asset.wrapper?.toLowerCase() === normalized) || null;
}

function merchantRouteForAsset(address) {
  const normalized = safeText(address, "").toLowerCase();
  return [...(merchantMoeDiscoveredRoutes?.routes || []), ...(merchantMoeRoutes?.routes || [])]
    .find((route) => route.tokenA?.toLowerCase() === normalized || route.tokenB?.toLowerCase() === normalized) || null;
}

function platformTvlForAsset(address) {
  const asset = registryAsset(address) || officialAsset(address);
  if (!asset) return null;
  return (platformTvl?.assets || []).find((item) => item.assetId === asset.id) || null;
}

function venueKey(venue) {
  const normalized = safeText(venue, "").toLowerCase();
  if (normalized.includes("merchant")) return "merchant-moe";
  if (normalized.includes("fluxion")) return "fluxion";
  return normalized.replace(/[^a-z0-9]+/g, "-") || "market";
}

function venueInitials(venue) {
  return safeText(venue, "DEX").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function venueLogoPath(venue) {
  return `assets/venues/${venueKey(venue)}.svg`;
}

function venueLogoFallbackPath(venue) {
  return `assets/venues/${venueKey(venue)}.png`;
}

function pairLabelForRoute(route, symbol) {
  if (route.pairLabel) return route.pairLabel;
  const pool = safeText(route.pool || route.poolAddress, "").toLowerCase();
  const merchantMatch = [...(merchantMoeRoutes?.routes || []), ...(merchantMoeDiscoveredRoutes?.routes || [])]
    .find((item) => safeText(item.poolAddress, "").toLowerCase() === pool);
  if (merchantMatch?.pairLabel) return merchantMatch.pairLabel;
  const venue = safeText(route.platform || route.venue, "");
  if (venue.toLowerCase().includes("fluxion")) return `${symbol} / USDC`;
  return t("tradeRoutePairFallback", { symbol });
}

function routePoolAddress(route) {
  return safeText(route?.pool || route?.poolAddress, "").toLowerCase();
}

function routeAddressSet(route) {
  return [route?.address, route?.underlying, route?.wrapper, route?.tokenA, route?.tokenB]
    .map((value) => safeText(value, "").toLowerCase())
    .filter(Boolean);
}

function allKnownTradeRoutes() {
  return [
    ...(liquidityBasket?.assets || []),
    ...(fluxionDirectRoutes?.routes || []),
    ...(fluxionDiscoveredRoutes?.routes || []),
    ...(merchantMoeRoutes?.routes || []),
    ...(merchantMoeDiscoveredRoutes?.routes || []),
  ];
}

function matchingDetailedRoute(route, address) {
  const pool = routePoolAddress(route);
  const venue = venueKey(route.platform || route.venue);
  return allKnownTradeRoutes().find((candidate) => {
    const candidatePool = routePoolAddress(candidate);
    if (pool && candidatePool && pool === candidatePool) return true;
    const candidateVenue = venueKey(candidate.platform || candidate.venue);
    return candidateVenue === venue && routeAddressSet(candidate).includes(address);
  }) || null;
}

function quoteForRoute(route, address) {
  const detailed = matchingDetailedRoute(route, address) || route;
  const observed = detailed?.verification?.lastObserved || route?.verification?.lastObserved || {};
  const simulated = Number(observed?.quoteSimulation?.buy100Usd?.impliedUsdPerWrapper);
  if (Number.isFinite(simulated) && simulated > 0) return { priceUsd: simulated, label: "tradeRouteQuoteSimulated" };
  const indicative = Number(observed?.priceReference?.priceUsd);
  if (Number.isFinite(indicative) && indicative > 0) return { priceUsd: indicative, label: "tradeRouteQuoteIndicative" };
  const poolPrice = Number(observed?.poolReserves?.priceUsdPerWrapper);
  if (Number.isFinite(poolPrice) && poolPrice > 0) return { priceUsd: poolPrice, label: "tradeRouteQuotePool" };
  return null;
}

function tradingRoutesForAsset(analysis) {
  const address = safeText(analysis.address, "").toLowerCase();
  const symbol = analysis.symbol || registryAsset(address)?.symbol || officialAsset(address)?.symbol || t("tokenFallback");
  const routes = [];
  const addRoute = (route) => {
    const url = safeExternalUrl(route.url);
    const pool = safeText(route.pool || route.poolAddress, "").toLowerCase();
    if (!address || !url || !pool) return;
    const key = `${venueKey(route.platform || route.venue)}:${pool}`;
    if (routes.some((item) => item.key === key)) return;
    routes.push({
      key,
      venue: route.platform || route.venue || "DEX",
      pair: pairLabelForRoute(route, symbol),
      quote: quoteForRoute(route, address),
      tvlUsd: Number(route.tvlUsd || route.tvl || route.verification?.lastObserved?.poolTvlUsd || route.verification?.lastObserved?.tvlUsd || route.observedTvlUsd || 0),
      url,
    });
  };

  (platformTvlForAsset(address)?.platforms || []).forEach(addRoute);
  [...(liquidityBasket?.assets || []), ...(fluxionDirectRoutes?.routes || []), ...(fluxionDiscoveredRoutes?.routes || [])]
    .filter((route) => [route.address, route.underlying, route.wrapper].map((value) => safeText(value, "").toLowerCase()).includes(address))
    .forEach((route) => addRoute({ ...route, venue: "Fluxion" }));
  [...(merchantMoeRoutes?.routes || []), ...(merchantMoeDiscoveredRoutes?.routes || [])]
    .filter((route) => [route.tokenA, route.tokenB].map((value) => safeText(value, "").toLowerCase()).includes(address))
    .forEach((route) => addRoute({ ...route, venue: route.venue || "Merchant Moe" }));

  return routes.sort((a, b) => Number(b.tvlUsd || 0) - Number(a.tvlUsd || 0));
}

async function selectOfficialBasketAsset(address) {
  const normalized = safeText(address, "").toLowerCase();
  if (!normalized) return;
  element("contractInput").value = normalized;
  if (observedProduct(normalized)) {
    element("assetCatalog").value = "";
    element("catalogHint").textContent = t("rwalphaNoScore");
    await analyzeAddress(normalized);
    return;
  }
  const asset = registryAsset(normalized);
  if (asset) {
    element("assetCatalog").value = asset.address;
    element("catalogHint").textContent = catalogHintForAsset(asset);
    await analyzeAddress(normalized);
    return;
  }
  element("assetCatalog").value = "";
  const official = officialAsset(normalized);
  if (official) {
    element("catalogHint").textContent = t("catalogHint");
    await analyzeAddress(normalized);
  } else {
    setBusy(false, "");
  }
}

function renderOfficialUniverse() {
  const section = element("officialUniverse");
  const catalog = officialCatalog;
  const basket = liquidityBasket;
  if (!catalog || !basket?.assets?.length) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  element("universeEyebrow").textContent = t("universeEyebrow");
  element("official-universe-title").textContent = t("universeTitle");
  element("universeBadge").textContent = t("universeBadge");
  element("universeCopy").textContent = t("universeCopy", { catalog: formatNumber(catalog.assetCount || 0), basket: formatNumber(basket.assets.length) });
  element("basketGrid").innerHTML = basket.assets.map((asset) => {
    const tracked = registryAsset(asset.address);
    const state = registryState(tracked);
    const statusText = state === "indexed"
      ? t("basketStatusIndexed")
      : state === "queued"
        ? t("basketStatusQueued")
        : t("basketStatusOfficial");
    const statusClass = state === "indexed" ? "confirmed" : state === "queued" ? "queued" : "candidate";
    return `
      <article class="basket-card" data-basket-address="${escapeHtml(asset.address)}">
        <div class="basket-rank">${t("basketRank", { rank: asset.rank })}</div>
        <div class="basket-symbol">
          <strong>${escapeHtml(asset.symbol)}</strong>
          <span>${escapeHtml(asset.name)}</span>
        </div>
        <div class="basket-meta">
          <span>${t("basketTvl", { tvl: formatUsd(asset.observedTvlUsd || 0) })}</span>
          <span>${escapeHtml(poolValue)}</span>
        </div>
        <div class="basket-status ${statusClass}">${escapeHtml(statusText)}</div>
        <button type="button" class="text-button basket-action" data-basket-button="${escapeHtml(asset.address)}">${escapeHtml(t("analyzeButton"))}</button>
      </article>`;
  }).join("");

  const basketButtons = element("basketGrid").querySelectorAll ? element("basketGrid").querySelectorAll("[data-basket-button]") : [];
  basketButtons.forEach((button) => {
    button.addEventListener("click", () => selectOfficialBasketAsset(button.dataset.basketButton));
  });

  const knownPools = new Set((basket.assets || []).map((asset) => safeText(asset.pool, "").toLowerCase()));
  const fluxionDiscoveries = (fluxionDiscoveredRoutes?.routes || []).map((route) => ({ ...route, underlying: route.underlying, pool: route.pool, venue: "Fluxion" }));
  const merchantDiscoveries = (merchantMoeDiscoveredRoutes?.routes || []).map((route) => ({ ...route, underlying: route.tokenA, pool: route.poolAddress, venue: "Merchant Moe" }));
  const discoveries = [...fluxionDiscoveries, ...merchantDiscoveries].filter((route) => !knownPools.has(safeText(route.pool, "").toLowerCase()));
  const discoveredSection = element("discoveredPools");
  discoveredSection.hidden = discoveries.length === 0;
  if (!discoveries.length) return;
  element("discoveredPoolsEyebrow").textContent = t("discoveredEyebrow");
  element("discovered-pools-title").textContent = t("discoveredTitle");
  element("discoveredPoolsCopy").textContent = t("discoveredCopy");
  element("discoveredPoolsCount").textContent = t("discoveredCount", { count: formatNumber(discoveries.length) });
  element("discoveredPoolsGrid").innerHTML = discoveries.map((route) => {
    const tvl = Number(route.verification?.lastObserved?.poolTvlUsd || route.verification?.lastObserved?.tvlUsd || 0);
    const tracked = registryAsset(route.underlying);
    const hasSnapshot = registryState(tracked) === "indexed";
    const discoveryState = hasSnapshot ? t("basketStatusIndexed") : t("discoveredStatus");
    return `<article class="basket-card discovery" data-basket-address="${escapeHtml(route.underlying)}">
      <div class="basket-rank">${escapeHtml(discoveryState)}</div>
      <div class="basket-symbol"><strong>${escapeHtml(route.symbol)}</strong><span>${escapeHtml(route.name)}</span></div>
      <div class="basket-meta"><span>${escapeHtml(`${route.venue || "Fluxion"} Â· ${t("discoveredTvl", { tvl: formatUsd(tvl) })}`)}</span><span>${escapeHtml(shortAddress(route.pool))}</span></div>
      <div class="basket-status confirmed">${escapeHtml(t("basketVerified"))}</div>
      <button type="button" class="text-button basket-action" data-discovery-button="${escapeHtml(route.underlying)}">${escapeHtml(t("analyzeButton"))}</button>
    </article>`;
  }).join("");
  const discoveryButtons = element("discoveredPoolsGrid").querySelectorAll ? element("discoveredPoolsGrid").querySelectorAll("[data-discovery-button]") : [];
  discoveryButtons.forEach((button) => button.addEventListener("click", () => selectOfficialBasketAsset(button.dataset.discoveryButton)));
}

function xstockImagePath(symbol) {
  if (!symbol) return "";
  const extension = XSTOCK_IMAGE_EXTENSIONS[symbol] || "svg";
  return `assets/xstocks/${symbol}.${extension}`;
}

function assetImagePath(asset) {
  if (asset?.sourceType === "observed") {
    return `assets/logos/${RWALPHA_IMAGE_FILES[asset.symbol] || "rwalpha_logo.png"}`;
  }
  return xstockImagePath(asset?.symbol);
}

function assetStatusForAddress(address) {
  const tracked = registryAsset(address);
  const state = registryState(tracked);
  return {
    state,
    text: state === "indexed"
      ? t("basketStatusIndexed")
      : state === "queued"
        ? t("basketStatusQueued")
        : t("basketStatusOfficial"),
    className: state === "indexed" ? "confirmed" : state === "queued" ? "queued" : "candidate",
  };
}

function collectResearchAssets() {
  const basketAssets = (liquidityBasket?.assets || []).map((asset) => ({
    key: `fluxion:${safeText(asset.pool, asset.address).toLowerCase()}`,
    address: asset.address,
    symbol: asset.symbol,
    name: asset.name,
    pool: asset.pool,
    venue: "Fluxion",
    rank: asset.rank,
    tvl: Number(asset.observedTvlUsd || 0),
    sourceType: "basket",
  }));

  const knownKeys = new Set(basketAssets.map((asset) => asset.key));
  const monitoredRoutes = [
    ...(fluxionDirectRoutes?.routes || []).map((route) => ({
      key: `fluxion:${safeText(route.pool, route.address).toLowerCase()}`,
      address: route.address,
      symbol: route.symbol,
      name: route.name,
      pool: route.pool,
      venue: "Fluxion",
      tvl: Number(route.verification?.lastObserved?.poolTvlUsd || route.verification?.lastObserved?.tvlUsd || route.observedTvlUsd || 0),
      sourceType: "direct",
    })),
    ...(merchantMoeRoutes?.routes || []).map((route) => ({
      key: `merchant:${safeText(route.poolAddress, route.tokenA).toLowerCase()}`,
      address: route.tokenA,
      symbol: route.symbol,
      name: route.name || route.pairLabel || route.symbol,
      pool: route.poolAddress,
      venue: route.venue || "Merchant Moe",
      tvl: Number(route.verification?.lastObserved?.poolTvlUsd || route.verification?.lastObserved?.tvlUsd || route.verification?.lastObserved?.tvlUsd || route.observedTvlUsd || 0),
      sourceType: "direct",
    })),
    ...(fluxionDiscoveredRoutes?.routes || []).map((route) => ({
      key: `fluxion:${safeText(route.pool, route.underlying).toLowerCase()}`,
      address: route.underlying,
      symbol: route.symbol,
      name: route.name,
      pool: route.pool,
      venue: "Fluxion",
      tvl: Number(route.verification?.lastObserved?.poolTvlUsd || route.verification?.lastObserved?.tvlUsd || route.observedTvlUsd || 0),
      sourceType: "discovered",
    })),
    ...(merchantMoeDiscoveredRoutes?.routes || []).map((route) => ({
      key: `merchant:${safeText(route.poolAddress, route.tokenA).toLowerCase()}`,
      address: route.tokenA,
      symbol: route.symbol,
      name: route.name,
      pool: route.poolAddress,
      venue: "Merchant Moe",
      tvl: Number(route.verification?.lastObserved?.poolTvlUsd || route.verification?.lastObserved?.tvlUsd || route.observedTvlUsd || 0),
      sourceType: "discovered",
    })),
  ].filter((asset) => asset.address && !knownKeys.has(asset.key));

  const observedProducts = (rwalphaProducts?.products || []).map((product) => ({
    key: `rwalpha:${product.id}`,
    address: product.address,
    symbol: product.symbol,
    name: product.name,
    pool: product.documentedBscContract,
    venue: product.venue || "RWAlpha",
    tvl: 0,
    sourceType: "observed",
    observedStatus: product.status,
  }));

  const grouped = new Map();
  [...basketAssets, ...monitoredRoutes, ...observedProducts].forEach((asset) => {
    const addressKey = safeText(asset.address, asset.key).toLowerCase();
    if (!grouped.has(addressKey)) {
      grouped.set(addressKey, { ...asset, venues: [asset.venue].filter(Boolean), tvl: Number(asset.tvl || 0), primaryTvl: Number(asset.tvl || 0) });
      return;
    }
    const current = grouped.get(addressKey);
    if (Number(asset.tvl || 0) > Number(current.primaryTvl || 0)) {
      current.pool = asset.pool;
      current.primaryTvl = Number(asset.tvl || 0);
    }
    current.tvl += Number(asset.tvl || 0);
    current.venues = [...new Set([...(current.venues || []), asset.venue].filter(Boolean))];
    current.venue = current.venues.join(" + ");
    if (!current.rank && asset.rank) current.rank = asset.rank;
    if (asset.sourceType === "basket") current.sourceType = "basket";
    if (asset.sourceType === "observed") current.sourceType = "observed";
  });

  return [...grouped.values()].sort((a, b) => {
    const leftIsSpcxx = safeText(a.symbol, "").toLowerCase() === "spcxx";
    const rightIsSpcxx = safeText(b.symbol, "").toLowerCase() === "spcxx";
    if (leftIsSpcxx !== rightIsSpcxx) return leftIsSpcxx ? -1 : 1;
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    if (a.sourceType === "observed" && b.sourceType !== "observed") return 1;
    if (b.sourceType === "observed" && a.sourceType !== "observed") return -1;
    return Number(b.tvl || 0) - Number(a.tvl || 0);
  });
}

function renderUnifiedAssetList() {
  const section = element("officialUniverse");
  const catalog = officialCatalog;
  const allAssets = collectResearchAssets();
  const assets = allAssets.filter((asset) => activeAssetCategory === "etfs" ? asset.sourceType === "observed" : asset.sourceType !== "observed");
  if (!catalog || !assets.length) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  element("universeEyebrow").textContent = t("universeEyebrow");
  element("official-universe-title").textContent = t("universeTitle");
  element("universeBadge").textContent = t("assetListCount", { count: formatNumber(assets.length) });
  element("universeCopy").textContent = t("universeCopy", { catalog: formatNumber(catalog.assetCount || 0), basket: formatNumber(assets.length) });
  const stocksTab = element("assetTabStocks");
  const etfsTab = element("assetTabEtfs");
  if (stocksTab && etfsTab) {
    stocksTab.textContent = t("assetTabStocks");
    etfsTab.textContent = t("assetTabEtfs");
    stocksTab.classList.toggle("active", activeAssetCategory === "stocks");
    etfsTab.classList.toggle("active", activeAssetCategory === "etfs");
    stocksTab.setAttribute("aria-selected", activeAssetCategory === "stocks" ? "true" : "false");
    etfsTab.setAttribute("aria-selected", activeAssetCategory === "etfs" ? "true" : "false");
  }

  const totalPages = Math.max(1, Math.ceil(assets.length / ASSET_PAGE_SIZE));
  assetListPage = Math.min(Math.max(assetListPage, 0), totalPages - 1);
  const pageAssets = assets.slice(assetListPage * ASSET_PAGE_SIZE, (assetListPage + 1) * ASSET_PAGE_SIZE);
  element("basketGrid").innerHTML = pageAssets.map((asset, index) => {
    const isObserved = asset.sourceType === "observed";
    const image = assetImagePath(asset);
    const position = asset.rank || (assetListPage * ASSET_PAGE_SIZE + index + 1);
    const sourceLabel = isObserved ? t("observedProductStatus") : asset.sourceType === "discovered" ? t("discoveredStatus") : t("universeBadge");
    const marketValue = isObserved ? t("rwalphaNoScore") : formatUsd(asset.tvl || 0);
    const marketLabel = isObserved ? t("assetVerificationLabel") : t("assetTvlLabel");
    const contractValue = isObserved ? safeText(asset.pool, "") : asset.address;
    const contractLabel = isObserved
      ? (contractValue ? `BSC ${shortAddress(contractValue)}` : t("rwalphaMantleMissing"))
      : shortAddress(asset.address);
    return `
      <article class="asset-row basket-card ${asset.sourceType === "discovered" ? "discovery" : ""}" data-basket-address="${escapeHtml(asset.address)}">
        <div class="asset-token">
          <img src="${escapeHtml(image)}" alt="" loading="lazy" onerror="this.hidden=true; this.nextElementSibling.hidden=false;" />
          <span class="asset-token-fallback" hidden>${escapeHtml((asset.symbol || "?").slice(0, 1))}</span>
        </div>
        <div class="asset-main">
          <div class="basket-rank">#${escapeHtml(position)} Â· ${escapeHtml(sourceLabel)}</div>
          <div class="basket-symbol"><strong>${escapeHtml(asset.symbol)}</strong><span>${escapeHtml(asset.name)}</span></div>
        </div>
        <div class="asset-market">
          <span>${escapeHtml(marketLabel)}</span>
          <strong>${escapeHtml(marketValue)}</strong>
        </div>
        <button type="button" class="asset-contract-copy" data-copy-contract="${escapeHtml(contractValue)}" title="${escapeHtml(t("copyContract"))}" aria-label="${escapeHtml(t("copyContract"))}">
          <span>${escapeHtml(contractLabel)}</span>
        </button>
        <button type="button" class="basket-action asset-research-button" data-basket-button="${escapeHtml(asset.address)}">${escapeHtml(t("analyzeButton"))}</button>
      </article>`;
  }).join("");

  const controls = element("assetCarouselControls");
  controls.hidden = assets.length <= ASSET_PAGE_SIZE;
  element("assetPageInfo").textContent = t("assetPageInfo", { current: formatNumber(assetListPage + 1), total: formatNumber(totalPages) });
  element("assetPagePrev").disabled = assetListPage === 0;
  element("assetPageNext").disabled = assetListPage >= totalPages - 1;

  const basketButtons = element("basketGrid").querySelectorAll ? element("basketGrid").querySelectorAll("[data-basket-button]") : [];
  basketButtons.forEach((button) => {
    button.addEventListener("click", () => selectOfficialBasketAsset(button.dataset.basketButton));
  });
  const copyButtons = element("basketGrid").querySelectorAll ? element("basketGrid").querySelectorAll("[data-copy-contract]") : [];
  copyButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      await copyAssetContract(button);
    });
  });
}

function applyResearchProfile(analysis, research) {
  if (!research?.score?.components?.length) return { ...analysis, research };
  const components = research.score.components;
  const computedTotal = components.reduce((total, component) => total + Number(component.score || 0), 0);
  const totalScore = Math.min(100, Number.isFinite(computedTotal) ? computedTotal : Number(research.score.total || analysis.totalScore));
  const presentation = {
    ...analysis.presentation,
    status: totalScore >= 70 ? t("statusEstablished") : totalScore >= 40 ? t("statusGrowing") : totalScore > 0 ? t("statusEarly") : t("statusLimited"),
    statusTone: totalScore >= 70 ? "positive" : totalScore >= 40 ? "caution" : "neutral",
    confidence: t("confidenceModerate"),
    confidenceDescription: t("confidenceModerateDescription"),
    reasons: components.slice(0, 3).map((component) => `${localizedValue(component.label)}: ${component.score}/${component.max}`),
  };
  return {
    ...analysis,
    research,
    totalScore,
    scoreDescription: localizedValue(research.score.summary) || analysis.scoreDescription,
    presentation,
    signals: components.map((component) => [`${localizedValue(component.label)} Â· ${component.score}/${component.max}`, localizedValue(component.detail)]),
    sources: (research.sources || []).map((source) => [source.name, localizedValue(source.detail), ["observed", "confirmed"].includes(source.status), safeExternalUrl(source.url)]),
  };
}

function buildOfficialPreview(address) {
  const official = officialAsset(address);
  const basket = basketAsset(address);
  const merchant = merchantRouteForAsset(address);
  if (!official) return null;
  const queued = registryAsset(address);
  const snapshotError = queued?.lastSnapshotError ? t("snapshotAttemptFailed", { error: queued.lastSnapshotError }) : "";
  if (!basket && !merchant) {
    return {
      kind: "partial",
      preview: true,
      scoreDisplay: "â€”",
      totalScore: 0,
      assetName: official.name,
      symbol: official.symbol,
      address: official.address,
      scoreDescription: t("previewNoScore"),
      readout: snapshotError || t("previewReadout", { symbol: official.symbol }),
      metrics: [
        [t("previewContractMetric"), shortAddress(official.address), t("explorerDetail")],
        [t("previewWrapperMetric"), shortAddress(official.wrappers?.[0]?.address || ""), t("notAvailable")],
        [t("dexLiquidity"), t("notAvailable"), t("noPublicPair")],
        [t("previewVolumeMetric"), t("notAvailable"), snapshotError || t("previewSignalPendingDetail")],
      ],
      signals: [
        [t("previewSignalOfficial"), t("previewSignalOfficialDetail")],
        [t("previewSignalPending"), snapshotError || t("previewSignalPendingDetail")],
      ],
      sources: [
        [t("previewSourceOfficial"), t("previewSourceOfficialDetail"), true, safeExternalUrl(officialCatalog?.source?.url)],
        [t("previewSourceLegal"), t("previewSourceLegalDetail"), true, safeExternalUrl(officialCatalog?.source?.legalOverview)],
        [t("explorer"), t("explorerDetail"), true, `https://mantlescan.xyz/token/${official.address}`],
      ],
      presentation: {
        status: t("previewStatus"),
        statusTone: "neutral",
        confidence: t("confidenceLimited"),
        confidenceDescription: snapshotError || t("confidenceLimitedDescription"),
        reasons: [official.symbol, t("previewNoScore"), snapshotError || t("previewSignalPending")],
      },
      research: {
        schema: 1,
        methodVersion: "V8-preview",
        identity: {
          chainId: 5000,
          network: "Mantle",
          address: official.address,
          rule: {
            "pt-BR": "A identidade do ativo e sempre rede + chainId + contrato. Um mesmo endereco em outra rede nao e tratado como o mesmo ativo.",
            en: "Asset identity always includes network + chainId + contract. The same address on another chain is not treated as the same asset."
          }
        },
        markets: [],
        sources: [
          {
            name: t("previewSourceOfficial"),
            type: { "pt-BR": "Identidade oficial", en: "Official identity" },
            detail: { "pt-BR": t("previewSourceOfficialDetail"), en: t("previewSourceOfficialDetail") },
            status: "confirmed",
            scoreEligible: false,
            url: safeExternalUrl(officialCatalog?.source?.url),
            lastCheckedAt: officialCatalog?.generatedAt || new Date().toISOString(),
          }
        ],
        nextEvidence: [
          { "pt-BR": snapshotError || t("previewNextEvidenceOne"), en: snapshotError || t("previewNextEvidenceOne") }
        ]
      }
    };
  }
  const wrapperAddress = basket?.wrapper || official.wrappers?.[0]?.address || "";
  const poolAddress = basket?.pool || merchant?.poolAddress || "";
  const marketUrl = basket ? (poolAddress ? `https://fluxion.network/pool/${poolAddress}` : "") : merchant?.url || "";
  const checkedAt = basket?.lastCheckedAt || basket?.lastAttemptAt || basket?.verifiedAt || merchant?.verifiedAt || officialCatalog?.generatedAt || new Date().toISOString();
  const observedTvl = Number(basket?.verification?.lastObserved?.poolTvlUsd || basket?.observedTvlUsd || merchant?.verification?.lastObserved?.tvlUsd || 0);
  const poolVerified = basket?.status === "verified_onchain" || basket?.verification?.lastResult === "pass" || merchant?.verification?.status === "verified";
  return {
    kind: "partial",
    preview: true,
    scoreDisplay: "â€”",
    totalScore: 0,
    assetName: official.name,
    symbol: official.symbol,
    address: official.address,
    scoreDescription: t("previewNoScore"),
    readout: snapshotError || t("previewReadout", { symbol: official.symbol }),
    metrics: [
      [t("previewContractMetric"), shortAddress(official.address), t("explorerDetail")],
        [t("previewWrapperMetric"), shortAddress(wrapperAddress), poolVerified ? t("basketVerified") : t("statusCandidate")],
        [t("dexLiquidity"), formatUsd(observedTvl), t("previewTvlDetail")],
      [t("previewVolumeMetric"), formatUsd(Number(basket?.observedVolumeH24Usd || 0)), t("previewVolumeDetail")],
    ],
    signals: [
      [t("previewSignalOfficial"), t("previewSignalOfficialDetail")],
      [t("previewSignalRoute"), t("previewSignalRouteDetail")],
      [t("previewSignalPending"), snapshotError || t("previewSignalPendingDetail")],
    ],
    sources: [
      [t("previewSourceOfficial"), t("previewSourceOfficialDetail"), true, safeExternalUrl(officialCatalog?.source?.url)],
      [t("previewSourceLegal"), t("previewSourceLegalDetail"), true, safeExternalUrl(officialCatalog?.source?.legalOverview)],
      ...(basket ? [[t("previewSourceBasket"), t("previewSourceBasketDetail"), true, safeExternalUrl(liquidityBasket?.selection?.sourceUrl)]] : []),
        [t("previewSourcePool"), t("previewSourcePoolDetail"), poolVerified, safeExternalUrl(marketUrl)],
      [t("explorer"), t("explorerDetail"), true, `https://mantlescan.xyz/token/${official.address}`],
    ],
    presentation: {
      status: t("previewStatus"),
      statusTone: "neutral",
      confidence: t("confidenceModerate"),
      confidenceDescription: snapshotError || t("confidenceModerateDescription"),
      reasons: [
        official.symbol,
        t("basketTvl", { tvl: formatUsd(observedTvl) }),
        t("previewNoScore"),
      ],
    },
    research: {
      schema: 1,
      methodVersion: "V8-preview",
      identity: {
        chainId: 5000,
        network: "Mantle",
        address: official.address,
        rule: {
          "pt-BR": "A identidade do ativo e sempre rede + chainId + contrato. Um mesmo endereco em outra rede nao e tratado como o mesmo ativo.",
          en: "Asset identity always includes network + chainId + contract. The same address on another chain is not treated as the same asset."
        }
      },
      markets: [
        {
          venue: basket ? "Fluxion" : "Merchant Moe",
          route: {
            "pt-BR": `USDC / ${wrapperAddress ? shortAddress(wrapperAddress) : official.symbol} Â· pool ${shortAddress(poolAddress)}`,
            en: `USDC / ${wrapperAddress ? shortAddress(wrapperAddress) : official.symbol} Â· pool ${shortAddress(poolAddress)}`
          },
          sourceUrl: marketUrl,
          status: poolVerified ? "confirmed" : "candidate",
          scoreEligible: false,
          lastCheckedAt: checkedAt,
          verification: basket?.verification || merchant?.verification || null,
        }
      ],
      sources: [
        {
          name: t("previewSourceOfficial"),
          type: { "pt-BR": "Identidade oficial", en: "Official identity" },
          detail: { "pt-BR": t("previewSourceOfficialDetail"), en: t("previewSourceOfficialDetail") },
          status: "confirmed",
          scoreEligible: false,
          url: safeExternalUrl(officialCatalog?.source?.url),
          lastCheckedAt: officialCatalog?.generatedAt || checkedAt,
        },
        {
          name: t("previewSourceLegal"),
          type: { "pt-BR": "Contexto do emissor", en: "Issuer context" },
          detail: { "pt-BR": t("previewSourceLegalDetail"), en: t("previewSourceLegalDetail") },
          status: "observed",
          scoreEligible: false,
          url: safeExternalUrl(officialCatalog?.source?.legalOverview),
          lastCheckedAt: officialCatalog?.generatedAt || checkedAt,
        },
        {
          name: t("previewSourcePool"),
          type: { "pt-BR": "Venue observada", en: "Observed venue" },
          detail: { "pt-BR": snapshotError || t("previewSourcePoolDetail"), en: snapshotError || t("previewSourcePoolDetail") },
          status: poolVerified ? "confirmed" : "candidate",
          scoreEligible: false,
          url: safeExternalUrl(marketUrl),
          lastCheckedAt: checkedAt,
        }
      ],
      nextEvidence: [
        { "pt-BR": t("previewNextEvidenceOne"), en: t("previewNextEvidenceOne") },
        { "pt-BR": t("previewNextEvidenceTwo"), en: t("previewNextEvidenceTwo") }
      ]
    }
  };
}

function observedProduct(address) {
  const normalized = safeText(address, "").toLowerCase();
  return (rwalphaProducts?.products || []).find((product) => safeText(product.address, "").toLowerCase() === normalized) || null;
}

function buildObservedProductPreview(address) {
  const product = observedProduct(address);
  if (!product) return null;
  const checkedAt = rwalphaProducts?.generatedAt || new Date().toISOString();
  const productParts = [
    product.type,
    product.composition ? `${activeLocale === "pt-BR" ? "Composição" : "Composition"}: ${product.composition}` : "",
    product.mintRedeem ? `${activeLocale === "pt-BR" ? "Acesso" : "Access"}: ${product.mintRedeem}` : "",
    product.paymentCurrency ? `${activeLocale === "pt-BR" ? "Moeda" : "Payment currency"}: ${product.paymentCurrency}` : "",
    product.minimumSubscription ? `${activeLocale === "pt-BR" ? "Mínimo" : "Minimum"}: ${product.minimumSubscription}` : "",
  ].filter(Boolean);
  return {
    kind: "partial",
    preview: true,
    warning: true,
    warningTitle: t("rwalphaWarningTitle"),
    warningCopy: t("rwalphaWarningCopy"),
    scoreDisplay: "!",
    totalScore: 0,
    assetName: product.name,
    symbol: product.symbol,
    address: product.address,
    assetOverview: productParts.join(" · ") || product.riskNote || t("rwalphaReadout", { symbol: product.symbol }),
    scoreDescription: t("rwalphaWarningCopy"),
    readout: t("rwalphaReadout", { symbol: product.symbol }),
    metrics: [
      [t("rwalphaMetricProduct"), product.type || t("notAvailable"), product.composition || product.riskNote || ""],
      [t("rwalphaMetricAccess"), product.mintRedeem || t("notAvailable"), t("rwalphaAccessDetail")],
      [t("rwalphaMetricBscContract"), shortAddress(product.documentedBscContract), t("rwalphaBscDetail")],
      [t("rwalphaMetricMantleContract"), t("rwalphaMantleMissing"), t("rwalphaSignalMissingDetail")],
    ],
    signals: [
      [t("rwalphaSignalMarketplace"), t("rwalphaSignalMarketplaceDetail")],
      [t("rwalphaSignalBsc"), t("rwalphaSignalBscDetail")],
      [t("rwalphaSignalMissing"), t("rwalphaSignalMissingDetail")],
    ],
    sources: [
      [t("rwalphaSourceMarketplace"), t("rwalphaSourceMarketplaceDetail"), true, safeExternalUrl(product.url)],
      [t("rwalphaSourceDocs"), t("rwalphaSourceDocsDetail"), true, safeExternalUrl(rwalphaProducts?.source?.docsUrl)],
      [t("rwalphaSourceBsc"), t("rwalphaSourceBscDetail"), true, `https://bscscan.com/address/${product.documentedBscContract}`],
      [t("explorer"), t("rwalphaSignalMissingDetail"), false, ""],
    ],
    presentation: {
      status: t("unverifiedMantleStatus"),
      statusTone: "caution",
      confidence: t("confidenceLimited"),
      confidenceDescription: t("rwalphaWarningCopy"),
      reasons: [product.symbol, t("observedProductStatus"), t("rwalphaNoScore")],
    },
    research: {
      schema: 1,
      methodVersion: "V28-observed",
      identity: {
        chainId: 5000,
        network: "Mantle",
        address: product.address,
        rule: {
          "pt-BR": "Produto observado no marketplace com Mantle selecionada, mas sem contrato Mantle verificável. O contrato BNB Chain não é tratado como prova de identidade na Mantle.",
          en: "Product observed in the marketplace with Mantle selected, but without a verifiable Mantle contract. The BNB Chain contract is not treated as proof of Mantle identity."
        }
      },
      markets: [
        {
          venue: "RWAlpha",
          route: {
            "pt-BR": "Subscribe/redeem no marketplace RWAlpha; contrato Mantle ainda pendente",
            en: "Subscribe/redeem in the RWAlpha marketplace; Mantle contract still pending"
          },
          sourceUrl: product.url,
          status: "candidate",
          scoreEligible: false,
          lastCheckedAt: checkedAt,
        }
      ],
      sources: [
        {
          name: t("rwalphaSourceMarketplace"),
          type: { "pt-BR": "Marketplace observado", en: "Observed marketplace" },
          detail: { "pt-BR": t("rwalphaSourceMarketplaceDetail"), en: t("rwalphaSourceMarketplaceDetail") },
          status: "observed",
          scoreEligible: false,
          url: safeExternalUrl(product.url),
          lastCheckedAt: checkedAt,
        },
        {
          name: t("rwalphaSourceBsc"),
          type: { "pt-BR": "Contrato em outra rede", en: "Other-chain contract" },
          detail: { "pt-BR": t("rwalphaSourceBscDetail"), en: t("rwalphaSourceBscDetail") },
          status: "observed",
          scoreEligible: false,
          url: `https://bscscan.com/address/${product.documentedBscContract}`,
          lastCheckedAt: checkedAt,
        }
      ],
      nextEvidence: [
        { "pt-BR": t("rwalphaNextEvidenceOne"), en: t("rwalphaNextEvidenceOne") },
        { "pt-BR": t("rwalphaNextEvidenceTwo"), en: t("rwalphaNextEvidenceTwo") }
      ]
    }
  };
}

function makePresentation(analysis) {
  const isLifetime = analysis.window?.period === "lifetime";
  const isLive = analysis.kind === "live";
  const confidence = isLifetime && isLive ? t("confidenceHigh") : isLive ? t("confidenceModerate") : t("confidenceLimited");
  const confidenceDescription = isLifetime && isLive ? t("confidenceHighDescription") : isLive ? t("confidenceModerateDescription") : t("confidenceLimitedDescription");
  const status = analysis.totalScore >= 70 ? t("statusEstablished") : analysis.totalScore >= 40 ? t("statusGrowing") : analysis.totalScore > 0 ? t("statusEarly") : t("statusLimited");
  const statusTone = analysis.totalScore >= 70 ? "positive" : analysis.totalScore >= 40 ? "caution" : "neutral";
  return { status, statusTone, confidence, confidenceDescription, reasons: isLifetime ? [t("reasonLifetime")] : [t("reasonWindow", { label: analysis.window?.period || t("dataSample") })] };
}

function renderCurrentAnalysis() {
  if (currentAnalysis.type === "sample") {
    renderAnalysis(getSampleAnalysis());
    return;
  }
  const source = currentAnalysis.data;
  const analysis = source?.preview || source?.warning || source?.kind === "partial"
    ? source
    : createLiveAnalysis(source);
  renderAnalysis(analysis.research ? applyResearchProfile(analysis, analysis.research) : analysis);
}

function openAnalysisDrawer() {
  const drawer = element("analysisDrawer");
  drawer.hidden = false;
  document.body.classList.add("analysis-open");
  element("analysisCloseButton").focus();
}

function closeAnalysisDrawer() {
  element("analysisDrawer").hidden = true;
  document.body.classList.remove("analysis-open");
}

function applyLocale(locale, save = true) {
  activeLocale = APP_CONFIG.supportedLocales.includes(locale) ? locale : APP_CONFIG.defaultLocale;
  document.documentElement.lang = activeLocale;
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach((node) => { node.innerHTML = t(node.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => { node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel)); });
  element("languageSelect").value = activeLocale;
  renderCurrentAnalysis();
  renderUnifiedAssetList();
  if (save) {
    try { localStorage.setItem("mdl-locale", activeLocale); } catch { /* Private browsing can disable storage. */ }
  }
}

function isAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function toHex(number) {
  return `0x${Math.max(0, number).toString(16)}`;
}

function hexToNumber(hex) {
  if (!hex || hex === "0x") return 0;
  return Number(BigInt(hex));
}

function decodeString(hex) {
  if (!hex || hex === "0x") return "";
  try {
    const raw = hex.slice(2);
    if (raw.length === 64) return textFromHex(raw).replace(/\u0000/g, "").trim();
    const offset = Number.parseInt(raw.slice(0, 64), 16) * 2;
    const length = Number.parseInt(raw.slice(offset, offset + 64), 16);
    return textFromHex(raw.slice(offset + 64, offset + 64 + length * 2));
  } catch {
    return "";
  }
}

function textFromHex(hex) {
  let output = "";
  for (let index = 0; index < hex.length; index += 2) output += String.fromCharCode(Number.parseInt(hex.slice(index, index + 2), 16));
  return output;
}

function topicToAddress(topic) {
  return `0x${topic.slice(-40)}`.toLowerCase();
}

async function rpc(method, params) {
  const response = await fetch(APP_CONFIG.rpcPath, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ method, params }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) throw new Error(payload.error?.message || t("rpcError"));
  return payload.result;
}

async function contractCall(address, selector) {
  return rpc("eth_call", [{ to: address, data: selector }, "latest"]);
}

async function dexData(address) {
  const response = await fetch(`${APP_CONFIG.dexPath}${address}`);
  if (!response.ok) throw new Error(t("dexError"));
  const payload = await response.json();
  return Array.isArray(payload.pairs) ? payload.pairs.filter((pair) => String(pair.chainId).toLowerCase() === "mantle") : [];
}

function liquidityScore(liquidity, volume) {
  if (!liquidity) return 0;
  return Math.round(Math.min(21, Math.log10(Math.max(liquidity, 1)) * 4.2) + Math.min(9, Math.log10(Math.max(volume, 1)) * 2.3));
}

function circulationScore(wallets, transfers) {
  return Math.round(Math.min(21, Math.log10(Math.max(wallets, 1)) * 8.8) + Math.min(14, Math.log10(Math.max(transfers, 1)) * 4.7));
}

function createLiveAnalysis({ address, name, symbol, supply, logs, dexPairs, rpcOk, dexOk }) {
  const wallets = new Set();
  let mints = 0;
  let burns = 0;
  logs.forEach((log) => {
    const from = topicToAddress(log.topics[1]);
    const to = topicToAddress(log.topics[2]);
    if (from === ZERO_ADDRESS) mints += 1; else wallets.add(from);
    if (to === ZERO_ADDRESS) burns += 1; else wallets.add(to);
  });

  const liquidity = dexPairs.reduce((total, pair) => total + Number(pair.liquidity?.usd || 0), 0);
  const volume = dexPairs.reduce((total, pair) => total + Number(pair.volume?.h24 || 0), 0);
  const activity = circulationScore(wallets.size, logs.length);
  const liquidityPoints = liquidityScore(liquidity, volume);
  const connectivity = Math.min(20, dexPairs.length * 7);
  const evidence = (rpcOk ? 9 : 0) + (dexOk ? 6 : 0);
  const totalScore = Math.min(100, activity + liquidityPoints + connectivity + evidence);
  const kind = rpcOk && dexOk ? "live" : "partial";
  const pairWord = activeLocale === "pt-BR" ? "par(es)" : "pair(s)";
  const liquidityText = liquidity ? formatUsd(liquidity) : t("noPair");
  const marketSentence = liquidity
    ? t("liveLiquidity", { liquidity: formatUsd(liquidity), pairs: dexPairs.length, pairWord })
    : t("noLiquidity");

  return {
    kind,
    assetName: name || t("unknownToken"),
    symbol: symbol || t("tokenFallback"),
    totalScore,
    scoreDescription: totalScore >= 70 ? t("strongScore") : totalScore >= 40 ? t("mediumScore") : t("lowScore"),
    readout: t("liveReadout", { transfers: formatNumber(logs.length), wallets: formatNumber(wallets.size), blocks: formatNumber(APP_CONFIG.lookbackBlocks), marketSentence }),
    metrics: [
      [t("observedWallets"), formatNumber(wallets.size), t("fromTransfers", { count: formatNumber(logs.length) })],
      [t("transfers"), formatNumber(logs.length), t("latestMantleBlocks", { count: formatNumber(APP_CONFIG.lookbackBlocks) })],
      [t("dexLiquidity"), liquidityText, dexPairs.length ? t("publicMantlePairs", { count: dexPairs.length, pairWord }) : t("noPublicPair")],
      [t("totalSupply"), supply ? formatNumber(supply) : t("notDecoded"), t("mintBurnDetail", { mints, burns })],
    ],
    signals: [
      [`${t("circulation")} Â· ${activity}/35`, t("circulationDetail", { wallets: formatNumber(wallets.size), transfers: formatNumber(logs.length) })],
      [`${t("liquidity")} Â· ${liquidityPoints}/30`, merchantTvl > 0 ? t("merchantPoolSignal", { tvl: formatUsd(merchantTvl) }) : liquidity ? t("liquidityDetail", { liquidity: formatUsd(liquidity), volume: formatUsd(volume) }) : t("noLiquidityDetail")],
      [`${t("connectivity")} Â· ${connectivity}/20`, t("connectivityDetail", { pairs: dexPairs.length, pairWord })],
      [`${t("evidenceQuality")} Â· ${evidence}/15`, t("evidenceDetail", { chainData: rpcOk ? t("chainDataYes") : t("chainDataNo"), dexData: dexOk ? t("dexDataYes") : t("dexDataNo") })],
    ],
    sources: [
      [t("mantleRpc"), rpcOk ? t("rpcSourceDetail", { address, blocks: formatNumber(APP_CONFIG.lookbackBlocks) }) : t("rpcSourceFailed"), rpcOk, "https://docs.mantle.xyz/network/for-developers/network-information"],
      [t("dexSource"), dexOk ? t("dexSourceDetail", { pairs: dexPairs.length }) : t("dexSourceFailed"), dexOk, "https://docs.dexscreener.com/api/reference"],
      ...monitoredPlatforms.map((platform) => [`${platform.platform} TVL`, `${formatUsd(platform.tvlUsd)} Â· ${platform.type === "onchain_pool_balances" ? t("platformSourcePoolBalances") : platform.type === "onchain_reserves_valued" ? t("platformSourceReserves") : t("platformSourceSnapshot")}`, true, platform.url]),
      [t("explorer"), t("explorerDetail"), true, `https://mantlescan.xyz/token/${address}`],
    ],
  };
}

async function analyzeContract(address) {
  const result = { address, name: "", symbol: "", supply: 0, logs: [], dexPairs: [], rpcOk: false, dexOk: false };
  const rpcWork = (async () => {
    const latestBlock = hexToNumber(await rpc("eth_blockNumber", []));
    const fromBlock = Math.max(0, latestBlock - APP_CONFIG.lookbackBlocks);
    const [nameHex, symbolHex, decimalsHex, supplyHex, logs] = await Promise.all([
      contractCall(address, "0x06fdde03").catch(() => ""),
      contractCall(address, "0x95d89b41").catch(() => ""),
      contractCall(address, "0x313ce567").catch(() => ""),
      contractCall(address, "0x18160ddd").catch(() => ""),
      rpc("eth_getLogs", [{ address, fromBlock: toHex(fromBlock), toBlock: "latest", topics: [TRANSFER_TOPIC] }]),
    ]);
    const decimals = hexToNumber(decimalsHex);
    const rawSupply = hexToNumber(supplyHex);
    result.name = decodeString(nameHex);
    result.symbol = decodeString(symbolHex);
    result.supply = Number.isSafeInteger(rawSupply) ? rawSupply / (10 ** Math.min(decimals, 18)) : 0;
    result.logs = Array.isArray(logs) ? logs : [];
    result.rpcOk = true;
  })().catch(() => {});

  const dexWork = dexData(address).then((pairs) => {
    result.dexPairs = pairs;
    result.dexOk = true;
  }).catch(() => {});

  await Promise.all([rpcWork, dexWork]);
  if (!result.rpcOk && !result.dexOk) throw new Error(t("dataUnavailable"));
  return result;
}

function formatDate(timestamp) {
  const numeric = Number(timestamp);
  const date = Number.isFinite(numeric) && numeric > 0
    ? new Date(numeric > 1000000000000 ? numeric : numeric * 1000)
    : new Date(timestamp || 0);
  if (!Number.isFinite(date.getTime()) || date.getTime() === 0) return t("notAvailable");
  return new Intl.DateTimeFormat(activeLocale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

async function getBlock(blockNumber) {
  const block = await rpc("eth_getBlockByNumber", [toHex(blockNumber), false]);
  if (!block) throw new Error(t("rpcError"));
  return { number: hexToNumber(block.number), timestamp: hexToNumber(block.timestamp) };
}

async function findBlockAtOrAfter(targetTimestamp, latestBlock, onProgress) {
  let low = 0;
  let high = latestBlock;
  let checks = 0;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const block = await getBlock(middle);
    checks += 1;
    onProgress?.({ stage: "locating", done: checks, total: 32 });
    if (block.timestamp < targetTimestamp) low = middle + 1;
    else high = middle;
  }
  return low;
}

async function findContractStartBlock(address, latestBlock, onProgress) {
  const latestCode = await rpc("eth_getCode", [address, "latest"]);
  if (!latestCode || latestCode === "0x") throw new Error(t("historyUnavailable"));
  let low = 0;
  let high = latestBlock;
  let checks = 0;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const code = await rpc("eth_getCode", [address, toHex(middle)]);
    checks += 1;
    onProgress?.({ stage: "contract", done: checks, total: 32 });
    if (code && code !== "0x") high = middle;
    else low = middle + 1;
  }
  return low;
}

async function resolveWindow(address, selection, onProgress) {
  const latestNumber = hexToNumber(await rpc("eth_blockNumber", []));
  const latest = await getBlock(latestNumber);
  let fromNumber;
  if (selection.period === "recent") {
    fromNumber = Math.max(0, latestNumber - APP_CONFIG.lookbackBlocks);
  } else if (selection.period === "all") {
    fromNumber = await findContractStartBlock(address, latestNumber, onProgress);
  } else {
    let startDate;
    if (selection.period === "custom") startDate = selection.startDate;
    else {
      const durations = { "7d": 7 * 86400000, "30d": 30 * 86400000, "1y": 365 * 86400000 };
      startDate = new Date(Date.now() - durations[selection.period]);
    }
    fromNumber = await findBlockAtOrAfter(Math.floor(startDate.getTime() / 1000), latestNumber, onProgress);
  }
  const from = await getBlock(fromNumber);
  return { period: selection.period, fromBlock: from.number, toBlock: latest.number, fromTimestamp: from.timestamp, toTimestamp: latest.timestamp };
}

async function getTransferLogsInChunks(address, window, onProgress) {
  let cursor = window.fromBlock;
  let chunkSize = APP_CONFIG.initialLogChunk;
  let chunks = 0;
  const logs = [];
  const totalBlocks = window.toBlock - window.fromBlock + 1;
  while (cursor <= window.toBlock) {
    const end = Math.min(window.toBlock, cursor + chunkSize - 1);
    try {
      const batch = await rpc("eth_getLogs", [{ address, fromBlock: toHex(cursor), toBlock: toHex(end), topics: [TRANSFER_TOPIC] }]);
      if (Array.isArray(batch)) logs.push(...batch);
      if (logs.length > APP_CONFIG.maximumEvents) throw new Error(t("tooManyEvents"));
      chunks += 1;
      if (chunks > APP_CONFIG.maximumLogChunks) throw new Error(t("queryLimitReached"));
      cursor = end + 1;
      onProgress?.({ stage: "scanning", done: cursor - window.fromBlock, total: totalBlocks });
      if (batch.length < 500 && chunkSize < APP_CONFIG.initialLogChunk) chunkSize = Math.min(APP_CONFIG.initialLogChunk, chunkSize * 2);
    } catch (error) {
      if (error.message === t("tooManyEvents") || error.message === t("queryLimitReached")) throw error;
      if (chunkSize <= APP_CONFIG.minimumLogChunk) throw error;
      chunkSize = Math.max(APP_CONFIG.minimumLogChunk, Math.floor(chunkSize / 2));
    }
  }
  return logs;
}

function createLiveAnalysis({ address, name, symbol, logs, dexPairs, rpcOk, dexOk, window }) {
  const wallets = new Set();
  logs.forEach((log) => {
    const from = topicToAddress(log.topics[1]);
    const to = topicToAddress(log.topics[2]);
    if (from !== ZERO_ADDRESS) wallets.add(from);
    if (to !== ZERO_ADDRESS) wallets.add(to);
  });
  const liquidity = dexPairs.reduce((total, pair) => total + Number(pair.liquidity?.usd || 0), 0);
  const volume = dexPairs.reduce((total, pair) => total + Number(pair.volume?.h24 || 0), 0);
  const activity = circulationScore(wallets.size, logs.length);
  const liquidityPoints = liquidityScore(liquidity, volume);
  const connectivity = Math.min(20, dexPairs.length * 7);
  const evidence = (rpcOk ? 9 : 0) + (dexOk ? 6 : 0);
  const totalScore = Math.min(100, activity + liquidityPoints + connectivity + evidence);
  const pairWord = activeLocale === "pt-BR" ? "par(es)" : "pair(s)";
  const start = formatDate(window.fromTimestamp);
  const end = formatDate(window.toTimestamp);
  const marketSentence = liquidity ? t("liveLiquidity", { liquidity: formatUsd(liquidity), pairs: dexPairs.length, pairWord }) : t("noLiquidity");
  const presentation = buildPresentation({ totalScore, kind, window, stats: summary, liquidity });
  if (snapshot && snapshotUpdatedAt) {
    const updatedDate = new Date(snapshotUpdatedAt);
    const updatedTime = updatedDate.getTime();
    if (Number.isFinite(updatedTime)) {
      const ageHours = Math.max(0, (Date.now() - updatedTime) / 3600000);
      presentation.reasons[2] = t("snapshotReason", { date: formatDataTime(snapshotUpdatedAt) });
      if (ageHours > 24 * 7) {
        presentation.confidence = t("confidenceLimited");
        presentation.confidenceDescription = t("confidenceLimitedDescription");
      } else if (ageHours > 24) {
        presentation.confidence = t("confidenceModerate");
        presentation.confidenceDescription = t("confidenceModerateDescription");
      }
    }
  }

  return {
    kind: rpcOk && dexOk ? "live" : "partial",
    address,
    window,
    assetName: name || t("unknownToken"),
    symbol: symbol || t("tokenFallback"),
    totalScore,
    scoreDescription: totalScore >= 70 ? t("strongScore") : totalScore >= 40 ? t("mediumScore") : t("lowScore"),
    readout: `${t("coverageReadout", { start, end })} ${t("liveReadoutWindow", { transfers: formatNumber(logs.length), wallets: formatNumber(wallets.size), marketSentence })}`,
    metrics: [
      [t("observedWallets"), formatNumber(wallets.size), t("fromTransfers", { count: formatNumber(logs.length) })],
      [t("transfers"), formatNumber(logs.length), `${start} â€” ${end}`],
      [(fluxionRoute || merchantRoute) ? t("verifiedPoolTvlMetric") : t("dexLiquidity"), merchantRoute
        ? (merchantTvl > 0 ? formatUsd(merchantTvl) : t("preparing"))
        : fluxionRoute ? (fluxionQuote?.buy100Usd?.impliedUsdPerWrapper ? formatUsd(fluxionQuote.buy100Usd.impliedUsdPerWrapper) : t("preparing"))
        : liquidity ? formatUsd(liquidity) : t("noPair"), fluxionRoute
        ? (merchantRoute ? (merchantTvl > 0 ? t("merchantPoolDetail") : t("merchantPoolPending")) : fluxionQuote ? t("fluxionQuoteSimulation") : t("fluxionRoutePending"))
        : displayedPairs.length ? t("publicMantlePairs", { count: displayedPairs.length, pairWord }) : t("noPublicPair")],
      [t("coverage"), formatNumber(window.toBlock - window.fromBlock + 1), t("coverageDetail", { from: formatNumber(window.fromBlock), to: formatNumber(window.toBlock) })],
    ],
    signals: [
      [`${t("circulation")} Â· ${activity}/35`, t("circulationDetail", { wallets: formatNumber(wallets.size), transfers: formatNumber(logs.length) })],
      [`${t("liquidity")} Â· ${liquidityPoints}/30`, totalPlatformTvl > 0 ? t("monitoredTvlSignal", { tvl: formatUsd(totalPlatformTvl) }) : liquidity ? t("liquidityDetail", { liquidity: formatUsd(liquidity), volume: formatUsd(volume) }) : t("noLiquidityDetail")],
      [`${t("connectivity")} Â· ${connectivity}/20`, t("connectivityDetail", { pairs: dexPairs.length, pairWord })],
      [`${t("evidenceQuality")} Â· ${evidence}/15`, t("evidenceDetail", { chainData: rpcOk ? t("chainDataYes") : t("chainDataNo"), dexData: dexOk ? t("dexDataYes") : t("dexDataNo") })],
    ],
    sources: [
      [t("mantleRpc"), `${t("coverageDetail", { from: formatNumber(window.fromBlock), to: formatNumber(window.toBlock) })}; ${start} â€” ${end}`, rpcOk, "https://docs.mantle.xyz/network/for-developers/network-information"],
      ...(fluxionRoute ? [["Fluxion Factory + QuoterV2", fluxionQuote ? t("fluxionQuoteVerified") : t("fluxionQuotePending"), true, fluxionRoute.url]] : [[t("dexSource"), dexOk ? t("dexSourceDetail", { pairs: displayedPairs.length }) : t("dexSourceFailed"), dexOk, "https://docs.dexscreener.com/api/reference"]]),
      ...(merchantRoute ? [["Merchant Moe pool", merchantTvl > 0 ? t("merchantSourceVerified") : t("merchantSourcePending"), merchantTvl > 0, merchantRoute.url]] : []),
      ...monitoredPlatforms.map((platform) => [`${platform.platform} TVL`, `${formatUsd(platform.tvlUsd)} Â· ${platform.capturedAt ? new Intl.DateTimeFormat(activeLocale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(platform.capturedAt)) : t("captureNoTime")}`, true, platform.url]),
      [t("explorer"), t("explorerDetail"), true, `https://mantlescan.xyz/token/${address}`],
    ],
  };
}

async function analyzeContract(address, selection, onProgress) {
  const window = await resolveWindow(address, selection, onProgress);
  const result = { address, name: "", symbol: "", logs: [], dexPairs: [], rpcOk: false, dexOk: false, window };
  const rpcWork = (async () => {
    const [nameHex, symbolHex, logs] = await Promise.all([
      contractCall(address, "0x06fdde03").catch(() => ""),
      contractCall(address, "0x95d89b41").catch(() => ""),
      getTransferLogsInChunks(address, window, onProgress),
    ]);
    result.name = decodeString(nameHex);
    result.symbol = decodeString(symbolHex);
    result.logs = Array.isArray(logs) ? logs : [];
    result.rpcOk = true;
  })();
  const dexWork = dexData(address).then((pairs) => { result.dexPairs = pairs; result.dexOk = true; }).catch(() => {});
  await Promise.all([rpcWork, dexWork]);
  if (!result.rpcOk && !result.dexOk) throw new Error(t("dataUnavailable"));
  return result;
}

function openHistoryCache() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return resolve(null);
    const request = window.indexedDB.open(CACHE_DB_NAME, CACHE_SCHEMA_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(CACHE_STORE_NAME)) request.result.createObjectStore(CACHE_STORE_NAME, { keyPath: "address" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readLifetimeCache(address) {
  try {
    const db = await openHistoryCache();
    if (!db) return null;
    return await new Promise((resolve, reject) => {
      const request = db.transaction(CACHE_STORE_NAME, "readonly").objectStore(CACHE_STORE_NAME).get(address.toLowerCase());
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function writeLifetimeCache(record) {
  try {
    const db = await openHistoryCache();
    if (!db) return false;
    await new Promise((resolve, reject) => {
      const request = db.transaction(CACHE_STORE_NAME, "readwrite").objectStore(CACHE_STORE_NAME).put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    return true;
  } catch {
    return false;
  }
}

function summarizeLogs(logs) {
  const wallets = new Set();
  let mints = 0;
  let burns = 0;
  logs.forEach((log) => {
    const from = topicToAddress(log.topics[1]);
    const to = topicToAddress(log.topics[2]);
    if (from === ZERO_ADDRESS) mints += 1; else wallets.add(from);
    if (to === ZERO_ADDRESS) burns += 1; else wallets.add(to);
  });
  return { transferCount: logs.length, walletAddresses: Array.from(wallets), mints, burns };
}

function mergeSummaries(base, addition) {
  const wallets = new Set([...(base.walletAddresses || []), ...(addition.walletAddresses || [])]);
  return {
    transferCount: (base.transferCount || 0) + (addition.transferCount || 0),
    walletAddresses: Array.from(wallets),
    mints: (base.mints || 0) + (addition.mints || 0),
    burns: (base.burns || 0) + (addition.burns || 0),
  };
}

async function resolveWindow(address, selection, onProgress) {
  const latestNumber = hexToNumber(await rpc("eth_blockNumber", []));
  const latest = await getBlock(latestNumber);
  let fromNumber;
  if (selection.period === "recent") {
    fromNumber = Math.max(0, latestNumber - APP_CONFIG.lookbackBlocks);
  } else if (selection.period === "lifetime") {
    fromNumber = await findContractStartBlock(address, latestNumber, onProgress);
  } else {
    let startDate;
    if (selection.period === "custom") startDate = selection.startDate;
    else {
      const durations = { "7d": 7 * 86400000, "30d": 30 * 86400000 };
      startDate = new Date(Date.now() - durations[selection.period]);
    }
    fromNumber = await findBlockAtOrAfter(Math.floor(startDate.getTime() / 1000), latestNumber, onProgress);
  }
  const from = await getBlock(fromNumber);
  return { period: selection.period, fromBlock: from.number, toBlock: latest.number, fromTimestamp: from.timestamp, toTimestamp: latest.timestamp };
}

function buildPresentation({ totalScore, kind, window, stats, liquidity }) {
  const isLifetime = window?.period === "lifetime";
  const isLive = kind === "live";
  const confidence = isLifetime && isLive ? t("confidenceHigh") : isLive ? t("confidenceModerate") : t("confidenceLimited");
  const confidenceDescription = isLifetime && isLive ? t("confidenceHighDescription") : isLive ? t("confidenceModerateDescription") : t("confidenceLimitedDescription");
  const status = totalScore >= 70 ? t("statusEstablished") : totalScore >= 40 ? t("statusGrowing") : totalScore > 0 ? t("statusEarly") : t("statusLimited");
  const statusTone = totalScore >= 70 ? "positive" : totalScore >= 40 ? "caution" : "neutral";
  const reasons = [
    t("reasonActivity", { count: formatNumber(stats.transferCount) }),
    t("reasonWallets", { count: formatNumber(stats.walletAddresses.length) }),
    liquidity ? t("reasonLiquidity", { amount: formatUsd(liquidity) }) : t("reasonNoLiquidity"),
  ];
  return { status, statusTone, confidence, confidenceDescription, reasons };
}

function createLiveAnalysis({ address, name, symbol, logs = [], stats, dexPairs, rpcOk, dexOk, window, cacheStatus, snapshot = false, snapshotUpdatedAt = null, marketRoute = null }) {
  const summary = stats || summarizeLogs(logs);
  const fluxionRoute = marketRoute?.venue === "Fluxion" ? marketRoute : null;
  const displayedPairs = fluxionRoute ? [] : dexPairs;
  const liquidity = displayedPairs.reduce((total, pair) => total + Number(pair.liquidity?.usd || 0), 0);
  const volume = displayedPairs.reduce((total, pair) => total + Number(pair.volume?.h24 || 0), 0);
  const fluxionObserved = fluxionRoute ? basketAsset(address)?.verification?.lastObserved : null;
  const fluxionQuote = fluxionObserved?.quoteSimulation || null;
  const merchantRoute = merchantRouteForAsset(address);
  const merchantTvl = Number(merchantRoute?.verification?.lastObserved?.tvlUsd || 0);
  const monitoredTvl = platformTvlForAsset(address);
  const monitoredPlatforms = monitoredTvl?.platforms || [];
  const totalPlatformTvl = Number(monitoredTvl?.totalTvlUsd || 0);
  const marketUpdatedAt = latestTimestamp(monitoredPlatforms.map((platform) => platform.capturedAt), platformTvl?.generatedAt || null);
  const scoreLiquidity = totalPlatformTvl > 0 ? totalPlatformTvl : liquidity;
  const scoreVolume = totalPlatformTvl > 0 ? 0 : volume;
  const activity = circulationScore(summary.walletAddresses.length, summary.transferCount);
  const liquidityPoints = liquidityScore(scoreLiquidity, scoreVolume);
  const connectivity = fluxionRoute ? 10 : Math.min(20, displayedPairs.length * 7);
  const evidence = (rpcOk ? 9 : 0) + (fluxionRoute || dexOk ? 6 : 0);
  const totalScore = Math.min(100, activity + liquidityPoints + connectivity + evidence);
  const kind = rpcOk && (dexOk || fluxionRoute) ? "live" : "partial";
  const assetOverview = buildXstockAssetOverview({ address, name, symbol, window, marketRoute: fluxionRoute, monitoredPlatforms });
  const pairWord = activeLocale === "pt-BR" ? "par(es)" : "pair(s)";
  const start = formatDate(window.fromTimestamp);
  const end = formatDate(window.toTimestamp);
  const marketSentence = fluxionRoute
    ? (fluxionQuote?.buy100Usd?.impliedUsdPerWrapper
      ? (activeLocale === "pt-BR"
        ? `A rota Fluxion foi verificada on-chain. A simulaÃ§Ã£o de compra de US$ 100 indica cerca de ${formatUsd(fluxionQuote.buy100Usd.impliedUsdPerWrapper)} por unidade; isso Ã© uma cotaÃ§Ã£o de pesquisa, nÃ£o uma ordem executada.`
        : `The Fluxion route was verified onchain. A simulated US$100 purchase indicates roughly ${formatUsd(fluxionQuote.buy100Usd.impliedUsdPerWrapper)} per unit; this is a research quote, not an executed order.`)
      : (activeLocale === "pt-BR"
        ? "A rota Fluxion foi verificada on-chain. A mÃ©trica executÃ¡vel serÃ¡ publicada apÃ³s a cotaÃ§Ã£o simulada ser confirmada."
        : "The Fluxion route was verified onchain. The executable metric will be published after the simulated quote is confirmed."))
    : totalPlatformTvl > 0
      ? t("monitoredPlatformsSentence", { tvl: formatUsd(totalPlatformTvl) })
      : merchantTvl > 0
      ? t("merchantPoolSentence", { tvl: formatUsd(merchantTvl) })
      : liquidity ? t("liveLiquidity", { liquidity: formatUsd(liquidity), pairs: displayedPairs.length, pairWord }) : t("noLiquidity");
  const presentation = buildPresentation({ totalScore, kind, window, stats: summary, liquidity: scoreLiquidity });
  if (snapshot && snapshotUpdatedAt) {
    const updatedDate = new Date(snapshotUpdatedAt);
    const updatedTime = updatedDate.getTime();
    if (Number.isFinite(updatedTime)) {
      const ageHours = Math.max(0, (Date.now() - updatedTime) / 3600000);
      presentation.reasons[2] = t("snapshotReason", { date: formatDataTime(snapshotUpdatedAt) });
      if (ageHours > 24 * 7) {
        presentation.confidence = t("confidenceLimited");
        presentation.confidenceDescription = t("confidenceLimitedDescription");
      } else if (ageHours > 24) {
        presentation.confidence = t("confidenceModerate");
        presentation.confidenceDescription = t("confidenceModerateDescription");
      }
    }
  }

  return {
    kind,
    address,
    window,
    cacheStatus,
    snapshot,
    snapshotUpdatedAt,
    marketUpdatedAt,
    assetName: name || t("unknownToken"),
    symbol: symbol || t("tokenFallback"),
    totalScore,
    scoreDescription: totalScore >= 70 ? t("strongScore") : totalScore >= 40 ? t("mediumScore") : t("lowScore"),
    assetOverview,
    readout: `${t("coverageReadout", { start, end })} ${t("liveReadoutWindow", { transfers: formatNumber(summary.transferCount), wallets: formatNumber(summary.walletAddresses.length), marketSentence })}`,
    presentation,
    metrics: [
      [t("observedWallets"), formatNumber(summary.walletAddresses.length), t("fromTransfers", { count: formatNumber(summary.transferCount) })],
      [t("transfers"), formatNumber(summary.transferCount), `${start} â€” ${end}`],
      [t("platformTvlMetric"), totalPlatformTvl > 0 ? formatUsd(totalPlatformTvl) : t("noPair"), totalPlatformTvl > 0 ? `${monitoredPlatforms.length === 1 ? t("platformMonitoredSingular") : t("platformMonitoredPlural", { count: monitoredPlatforms.length })} Â· ${marketFreshness(marketUpdatedAt)}` : t("noPublicPair")],
      [t("coverage"), formatNumber(window.toBlock - window.fromBlock + 1), t("coverageDetail", { from: formatNumber(window.fromBlock), to: formatNumber(window.toBlock) })],
    ],
    signals: [
      [`${t("circulation")} Â· ${activity}/35`, t("circulationDetail", { wallets: formatNumber(summary.walletAddresses.length), transfers: formatNumber(summary.transferCount) })],
      [`${t("liquidity")} Â· ${liquidityPoints}/30`, liquidity ? t("liquidityDetail", { liquidity: formatUsd(liquidity), volume: formatUsd(volume) }) : t("noLiquidityDetail")],
      [`${t("connectivity")} Â· ${connectivity}/20`, t("connectivityDetail", { pairs: dexPairs.length, pairWord })],
      [`${t("evidenceQuality")} Â· ${evidence}/15`, t("evidenceDetail", { chainData: rpcOk ? t("chainDataYes") : t("chainDataNo"), dexData: dexOk ? t("dexDataYes") : t("dexDataNo") })],
    ],
    sources: [
      [t("mantleRpc"), `${t("coverageDetail", { from: formatNumber(window.fromBlock), to: formatNumber(window.toBlock) })}; ${start} â€” ${end}`, rpcOk, "https://docs.mantle.xyz/network/for-developers/network-information"],
      ...(fluxionRoute ? [["Fluxion Factory + QuoterV2", fluxionQuote ? t("fluxionQuoteVerified") : t("fluxionQuotePending"), true, fluxionRoute.url]] : [[t("dexSource"), dexOk ? t("dexSourceDetail", { pairs: displayedPairs.length }) : t("dexSourceFailed"), dexOk, "https://docs.dexscreener.com/api/reference"]]),
      ...monitoredPlatforms.map((platform) => [`${platform.platform} TVL`, `${formatUsd(platform.tvlUsd)} Â· ${platform.type === "onchain_pool_balances" ? t("platformSourcePoolBalances") : platform.type === "onchain_reserves_valued" ? t("platformSourceReserves") : t("platformSourceSnapshot")}`, true, platform.url]),
      [t("explorer"), t("explorerDetail"), true, `https://mantlescan.xyz/token/${address}`],
    ],
  };
}

async function analyzeContract(address, selection, onProgress) {
  const normalizedAddress = address.toLowerCase();
  const cached = selection.period === "lifetime" ? await readLifetimeCache(normalizedAddress) : null;
  let window;
  let stats;
  let name = "";
  let symbol = "";
  let cacheStatus = null;

  if (cached?.schema === CACHE_SCHEMA_VERSION) {
    onProgress?.({ stage: "cached", done: 1, total: 1 });
    const latestNumber = hexToNumber(await rpc("eth_blockNumber", []));
    const latest = await getBlock(latestNumber);
    window = { ...cached.window, toBlock: latest.number, toTimestamp: latest.timestamp };
    name = cached.name;
    symbol = cached.symbol;
    stats = cached.stats;
    cacheStatus = "used";
    if (latest.number > cached.window.toBlock) {
      const deltaStart = await getBlock(cached.window.toBlock + 1);
      const deltaWindow = { fromBlock: deltaStart.number, toBlock: latest.number, fromTimestamp: deltaStart.timestamp, toTimestamp: latest.timestamp };
      const deltaLogs = await getTransferLogsInChunks(address, deltaWindow, onProgress);
      stats = mergeSummaries(stats, summarizeLogs(deltaLogs));
      cacheStatus = "updated";
    }
  } else {
    window = await resolveWindow(address, selection, onProgress);
    const [nameHex, symbolHex, logs] = await Promise.all([
      contractCall(address, "0x06fdde03").catch(() => ""),
      contractCall(address, "0x95d89b41").catch(() => ""),
      getTransferLogsInChunks(address, window, onProgress),
    ]);
    name = decodeString(nameHex);
    symbol = decodeString(symbolHex);
    stats = summarizeLogs(logs);
    if (selection.period === "lifetime") {
      const saved = await writeLifetimeCache({ address: normalizedAddress, schema: CACHE_SCHEMA_VERSION, name, symbol, window, stats, cachedAt: Date.now() });
      cacheStatus = saved ? "saved" : null;
    }
  }

  if (selection.period === "lifetime" && cacheStatus === "updated") {
    await writeLifetimeCache({ address: normalizedAddress, schema: CACHE_SCHEMA_VERSION, name, symbol, window, stats, cachedAt: Date.now() });
  }
  let dexPairs = [];
  let dexOk = true;
  try { dexPairs = await dexData(address); } catch { dexOk = false; }
  return { address, name, symbol, logs: [], stats, dexPairs, rpcOk: true, dexOk, window, cacheStatus };
}

function updatePeriodControls() {
  const period = element("periodSelect").value;
  const hintKeys = { recent: "periodHintRecent", "7d": "periodHint7d", "30d": "periodHint30d", lifetime: "periodHintLifetime", custom: "periodHintCustom" };
  element("periodHint").textContent = t(hintKeys[period]);
  element("customPeriod").hidden = period !== "custom";
}

function setBusy(isBusy, message = "") {
  element("analyzeButton").disabled = isBusy;
  element("assetCatalog").disabled = isBusy || !publishedRegistry;
  element("periodSelect").disabled = isBusy;
  element("startDate").disabled = isBusy;
  element("endDate").disabled = isBusy;
  element("sampleButton").disabled = isBusy;
  element("analyzeButton").textContent = isBusy ? t("analyzeButtonBusy") : t("analyzeButton");
  element("formStatus").textContent = message;
}

function setProgress(progress) {
  const wrap = element("progressWrap");
  if (!progress) {
    wrap.hidden = true;
    return;
  }
  const labels = { locating: t("locatingBlocks"), contract: t("locatingContract"), scanning: t("scanningHistory"), cached: t("cacheUsed") };
  const percent = Math.max(0, Math.min(100, Math.round((progress.done / Math.max(progress.total, 1)) * 100)));
  wrap.hidden = false;
  element("progressLabel").textContent = labels[progress.stage] || t("scanningHistory");
  element("progressValue").textContent = t("progressQueries", { done: formatNumber(progress.done), total: formatNumber(progress.total) });
  element("progressBar").setAttribute("aria-valuenow", String(percent));
  element("progressBar").querySelector("span").style.width = `${percent}%`;
}

function updatePeriodControls() {
  const period = element("periodSelect").value;
  const hintKeys = { recent: "periodHintRecent", "7d": "periodHint7d", "30d": "periodHint30d", lifetime: "periodHintLifetime", custom: "periodHintCustom" };
  element("periodHint").textContent = t(hintKeys[period]);
  element("customPeriod").hidden = period !== "custom";
}

function getSelectedPeriod() {
  const period = element("periodSelect").value;
  if (period !== "custom") return { period };
  const startValue = element("startDate").value;
  const endValue = element("endDate").value;
  const startDate = new Date(`${startValue}T00:00:00`);
  const requestedEnd = new Date(`${endValue}T23:59:59.999`);
  const now = new Date();
  const endDate = requestedEnd > now ? now : requestedEnd;
  if (!startValue || !endValue || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate >= endDate) return null;
  return { period, startDate, endDate };
}

function createResearchBrief(analysis) {
  const generatedAt = new Intl.DateTimeFormat(activeLocale, { dateStyle: "medium", timeStyle: "medium" }).format(new Date());
  const type = analysis.snapshot ? t("dataSnapshot") : analysis.kind === "live" ? t("dataLive") : analysis.kind === "partial" ? t("dataPartial") : t("dataSample");
  const lines = [
    `# ${t("reportTitle")}`,
    "",
    `- **${t("reportGenerated")}**: ${generatedAt}`,
    `- **${t("reportAnalysisType")}**: ${type}`,
    `- **${t("reportAsset")}**: ${analysis.assetName}${analysis.symbol ? ` (${analysis.symbol})` : ""}`,
  ];

  if (analysis.address) lines.push(`- **${t("reportContract")}**: \`${analysis.address}\``);
  if (analysis.window) {
    lines.push(
      `- **${t("reportCoverage")}**: ${t("coverageDetail", { from: formatNumber(analysis.window.fromBlock), to: formatNumber(analysis.window.toBlock) })}`,
      `- **${t("reportStartDate")}**: ${formatDate(analysis.window.fromTimestamp)}`,
      `- **${t("reportEndDate")}**: ${formatDate(analysis.window.toTimestamp)}`
    );
  }
  if (analysis.kind === "sample") lines.push(`- **Note**: ${t("reportSampleWarning")}`);

  lines.push(
    "",
    `## ${t("reportScore")}`,
    "",
    `**${analysis.scoreDisplay || `${analysis.totalScore}/100`}** â€” ${analysis.scoreDescription}`,
    "",
    `## ${t("reportReadout")}`,
    "",
    analysis.readout,
    "",
    `## ${t("reportSignals")}`,
    "",
    ...analysis.signals.map(([title, detail]) => `- **${title}**: ${detail}`),
    "",
    `## ${t("reportEvidence")}`,
    "",
    ...analysis.sources.map(([title, detail, available, link]) => `- ${link ? `[${title}](${link})` : title}: ${detail}${available ? "" : " (unavailable during this run)"}`),
    "",
    `## ${t("reportMethod")}`,
    "",
    t("reportMethodText"),
    "",
    t("methodCopyTwo"),
    ""
  );
  if (analysis.research) {
    const research = analysis.research;
    lines.push(
      `## ${t("reportMarketMap")}`,
      "",
      ...((research.markets || []).map((market) => `- **${market.venue}** â€” ${localizedValue(market.route)} (${researchStatusLabel(market.status)}; ${formatResearchDate(market.lastCheckedAt)})${market.sourceUrl ? `: ${market.sourceUrl}` : ""}`)),
      "",
      `## ${t("reportNextEvidence")}`,
      "",
      ...((research.nextEvidence || []).map((item) => `- ${localizedValue(item)}`)),
      ""
    );
  }
  return lines.join("\n");
}

function downloadResearchBrief() {
  if (!lastRenderedAnalysis) return;
  const content = createResearchBrief(lastRenderedAnalysis);
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const asset = (lastRenderedAnalysis.symbol || "research").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  link.href = url;
  link.download = `mantle-distribution-lens-${asset}-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setBusy(false, t("reportDownloaded"));
}

function registryAsset(address) {
  return publishedRegistry?.assets?.find((asset) => asset.address.toLowerCase() === address.toLowerCase()) || null;
}

function registryState(asset) {
  if (!asset) return "official";
  if (asset.status === "indexed") return "indexed";
  if (asset.status === "queued") return "queued";
  return "official";
}

function catalogStatusText(asset) {
  return registryState(asset) === "indexed" ? t("catalogStatusIndexed") : t("catalogStatusQueued");
}

function catalogHintForAsset(asset) {
  return registryState(asset) === "indexed" ? t("catalogHint") : t("snapshotPending");
}

function populateCatalog() {
  const select = element("assetCatalog");
  select.innerHTML = `<option value="">${escapeHtml(t("catalogChoose"))}</option>`;
  for (const asset of publishedRegistry.assets || []) {
    const option = document.createElement("option");
    option.value = asset.address;
    option.textContent = `${asset.name} (${asset.symbol}) Â· ${catalogStatusText(asset)}`;
    select.appendChild(option);
  }
  select.disabled = false;
  const currentAddress = element("contractInput").value.trim();
  if (registryAsset(currentAddress)) select.value = currentAddress;
}

async function loadPublishedRegistry() {
  try {
    const response = await fetch("data/registry.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Registry unavailable");
    publishedRegistry = await response.json();
    populateCatalog();
    element("catalogHint").textContent = t("catalogReady");
    element("contractHint").textContent = t("staticSnapshotHint");
  } catch {
    element("catalogHint").textContent = t("catalogUnavailable");
  }
}

async function loadOfficialUniverse() {
  try {
    const [catalogResponse, basketResponse, merchantResponse, merchantDiscoveryResponse, fluxionDirectResponse, fluxionDiscoveryResponse, platformTvlResponse, rwalphaResponse] = await Promise.all([
      fetch("data/catalog/xstocks-mantle.json", { cache: "no-cache" }),
      fetch("data/catalog/fluxion-liquidity-basket.json", { cache: "no-cache" }),
      fetch("data/catalog/merchant-moe-routes.json", { cache: "no-cache" }),
      fetch("data/catalog/merchant-moe-discovered-routes.json", { cache: "no-cache" }),
      fetch("data/catalog/fluxion-direct-routes.json", { cache: "no-cache" }),
      fetch("data/catalog/fluxion-discovered-routes.json", { cache: "no-cache" }),
      fetch("data/catalog/platform-tvl.json", { cache: "no-cache" }),
      fetch("data/catalog/rwalpha-observed-products.json", { cache: "no-cache" }),
    ]);
    if (!catalogResponse.ok || !basketResponse.ok) throw new Error("Official universe unavailable");
    officialCatalog = await catalogResponse.json();
    liquidityBasket = await basketResponse.json();
    merchantMoeRoutes = merchantResponse.ok ? await merchantResponse.json() : null;
    merchantMoeDiscoveredRoutes = merchantDiscoveryResponse.ok ? await merchantDiscoveryResponse.json() : null;
    fluxionDirectRoutes = fluxionDirectResponse.ok ? await fluxionDirectResponse.json() : null;
    fluxionDiscoveredRoutes = fluxionDiscoveryResponse.ok ? await fluxionDiscoveryResponse.json() : null;
    platformTvl = platformTvlResponse.ok ? await platformTvlResponse.json() : null;
    rwalphaProducts = rwalphaResponse.ok ? await rwalphaResponse.json() : null;
    renderUnifiedAssetList();
  } catch {
    officialCatalog = null;
    liquidityBasket = null;
    merchantMoeRoutes = null;
    merchantMoeDiscoveredRoutes = null;
    fluxionDirectRoutes = null;
    fluxionDiscoveredRoutes = null;
    platformTvl = null;
    rwalphaProducts = null;
    renderUnifiedAssetList();
  }
}

function snapshotToAnalysis(snapshot) {
  const marketPairs = (snapshot.market?.pairs || []).map((pair) => ({
    dexId: pair.dexId,
    pairAddress: pair.pairAddress,
    liquidity: { usd: Number(pair.liquidityUsd || 0) },
    volume: { h24: Number(pair.volumeH24 || 0) },
    url: pair.url,
  }));
  const coverage = snapshot.coverage;
  const isRecentWindow = coverage.type === "recent_30_day_window";
  return {
    address: snapshot.asset.address,
    name: snapshot.asset.name,
    symbol: snapshot.asset.symbol,
    logs: [],
    stats: snapshot.stats,
    dexPairs: marketPairs,
    rpcOk: true,
    dexOk: true,
    window: {
      period: isRecentWindow ? "recent" : "lifetime",
      fromBlock: coverage.startBlock || coverage.contractCreatedBlock,
      toBlock: coverage.lastIndexedBlock,
      fromTimestamp: Math.floor(new Date(coverage.windowStartedAt || coverage.contractCreatedAt).getTime() / 1000),
      toTimestamp: Math.floor(new Date(coverage.lastIndexedAt).getTime() / 1000),
    },
    snapshot: true,
    snapshotUpdatedAt: snapshot.generatedAt || coverage.lastIndexedAt,
  };
}

async function loadPublishedAnalysis(address) {
  const observedPreview = buildObservedProductPreview(address);
  if (observedPreview) return observedPreview;
  const asset = registryAsset(address);
  if (!asset) {
    const official = officialAsset(address);
    if (official) {
      const preview = buildOfficialPreview(address);
      if (preview) return preview;
      throw new Error(t("officialNotTracked", { symbol: official.symbol }));
    }
    throw new Error(t("assetNotIndexed"));
  }
  if (asset.status !== "indexed") {
    const preview = buildOfficialPreview(address);
    if (preview) return preview;
    throw new Error(t("snapshotPending"));
  }
  const response = await fetch(asset.snapshot, { cache: "no-cache" });
  if (!response.ok) throw new Error(t("snapshotUnavailable"));
  const analysis = snapshotToAnalysis(await response.json());
  analysis.marketRoute = asset.fluxion ? { venue: "Fluxion", url: asset.fluxion.url } : null;
  if (asset.research) {
    try {
      const researchResponse = await fetch(asset.research, { cache: "no-cache" });
      if (researchResponse.ok) analysis.research = await researchResponse.json();
    } catch {
      // The historical snapshot remains useful if an optional research profile is unavailable.
    }
  }
  return analysis;
}

async function analyzeAddress(address) {
  if (!isAddress(address) && !observedProduct(address)) {
    setBusy(false, t("invalidContract"));
    element("contractInput").focus();
    return;
  }
  setBusy(true, t("collecting"));
  try {
    const analysisData = await loadPublishedAnalysis(address);
    currentAnalysis = { type: "live", data: analysisData };
    renderCurrentAnalysis();
    const statusMessage = analysisData.warning
      ? t("rwalphaWarningTitle")
      : analysisData.preview
      ? t("previewReady")
      : `${t("complete")} ${t("snapshotReason", { date: formatDataTime(analysisData.snapshotUpdatedAt) })}`;
    setBusy(false, statusMessage);
    openAnalysisDrawer();
  } catch (error) {
    setBusy(false, error.message || t("analysisFailed"));
  }
}

element("assetCatalog").addEventListener("change", (event) => {
  if (!event.target.value) return;
  hideSearchSuggestions();
  element("contractInput").value = event.target.value;
  const asset = registryAsset(event.target.value);
  if (asset) element("catalogHint").textContent = catalogHintForAsset(asset);
});

element("contractInput").addEventListener("input", (event) => {
  const value = event.target.value.trim();
  if (isAddress(value)) hideSearchSuggestions();
  else showSearchSuggestions(value);
  const resolved = resolveAssetQuery(value);
  const select = element("assetCatalog");
  if (resolved.status === "resolved") {
    const asset = registryAsset(resolved.address);
    select.value = asset ? asset.address : "";
    const displayAsset = resolved.asset || asset || officialAsset(resolved.address) || observedProduct(resolved.address);
    if (displayAsset) {
      element("catalogHint").textContent = resolved.exact
        ? t("searchMatchHint", { name: displayAsset.name || t("unknownToken"), symbol: displayAsset.symbol || t("tokenFallback") })
        : t("searchFuzzyHint", { name: displayAsset.name || t("unknownToken"), symbol: displayAsset.symbol || t("tokenFallback") });
    }
    return;
  }
  select.value = "";
  if (resolved.status === "ambiguous") {
    element("catalogHint").textContent = t("searchAmbiguous", { matches: resolved.matches.map(describeSearchAsset).join(", ") });
  } else if (value && publishedRegistry) {
    element("catalogHint").textContent = t("searchNoMatch");
  } else if (publishedRegistry) {
    element("catalogHint").textContent = t("staticSnapshotHint");
  }
});

element("languageSelect").addEventListener("change", (event) => {
  applyLocale(event.target.value);
  if (publishedRegistry) element("contractHint").textContent = t("staticSnapshotHint");
  updatePeriodControls();
  hideSearchSuggestions();
  setBusy(false);
});

element("downloadButton").addEventListener("click", downloadResearchBrief);
element("analysisCloseButton").addEventListener("click", closeAnalysisDrawer);
element("analysisDrawerBackdrop").addEventListener("click", closeAnalysisDrawer);

element("periodSelect").addEventListener("change", updatePeriodControls);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideSearchSuggestions();
    if (!element("analysisDrawer").hidden) closeAnalysisDrawer();
  }
});

document.addEventListener("click", (event) => {
  if (element("contractInput").contains(event.target) || element("assetSearchSuggestions")?.contains(event.target)) return;
  hideSearchSuggestions();
});

element("sampleButton").addEventListener("click", () => {
  hideSearchSuggestions();
  element("contractInput").value = "";
  currentAnalysis = { type: "sample" };
  renderCurrentAnalysis();
  openAnalysisDrawer();
  setBusy(false, t("sampleNotice"));
});

element("analyzeButton").addEventListener("click", async () => {
  hideSearchSuggestions();
  const query = element("contractInput").value.trim();
  const resolved = resolveAssetQuery(query);
  if (resolved.status === "ambiguous") {
    setBusy(false, t("searchAmbiguous", { matches: resolved.matches.map(describeSearchAsset).join(", ") }));
    element("contractInput").focus();
    return;
  }
  if (resolved.status === "not-found") {
    setBusy(false, t("searchNoMatch"));
    element("contractInput").focus();
    return;
  }
  if (resolved.status !== "resolved") {
    await analyzeAddress(query);
    return;
  }
  const displayAsset = resolved.asset || registryAsset(resolved.address) || officialAsset(resolved.address) || observedProduct(resolved.address);
  if (displayAsset) setBusy(false, t("searchResolved", { name: displayAsset.name || t("unknownToken"), symbol: displayAsset.symbol || t("tokenFallback") }));
  element("contractInput").value = resolved.address;
  await analyzeAddress(resolved.address);
});

element("assetPagePrev").addEventListener("click", () => {
  assetListPage = Math.max(0, assetListPage - 1);
  renderUnifiedAssetList();
});

element("assetPageNext").addEventListener("click", () => {
  assetListPage += 1;
  renderUnifiedAssetList();
});

function setAssetCategory(category) {
  activeAssetCategory = category === "etfs" ? "etfs" : "stocks";
  assetListPage = 0;
  renderUnifiedAssetList();
}

element("assetTabStocks")?.addEventListener("click", () => setAssetCategory("stocks"));
element("assetTabEtfs")?.addEventListener("click", () => setAssetCategory("etfs"));

try {
  const savedLocale = localStorage.getItem("mdl-locale");
  if (APP_CONFIG.supportedLocales.includes(savedLocale)) activeLocale = savedLocale;
} catch { /* Storage is optional. */ }
const defaultEnd = new Date();
const defaultStart = new Date(Date.now() - 30 * 86400000);
element("startDate").value = defaultStart.toISOString().slice(0, 10);
element("endDate").value = defaultEnd.toISOString().slice(0, 10);
applyLocale(activeLocale, false);
updatePeriodControls();
element("periodSelect").disabled = true;
loadPublishedRegistry();
loadOfficialUniverse();

