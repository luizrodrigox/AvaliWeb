chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.action !== "ANALYZE_URL") {
            return;
        }

        analyzeUrl(message.url, message.criteriaFiles)
            .then((analysis) => {
                sendResponse({
                    success: true,
                    analysis
                });
            })
            .catch((error) => {
                console.error(
                    "Erro na análise por URL:",
                    error
                );

                sendResponse({
                    success: false,
                    error: error.message ||
                        "Não foi possível realizar a análise. Tente novamente."
                });
            });

        return true;
    }
);

async function analyzeUrl(url, criteriaFiles) {
    let parsedUrl;

    // 1. Validar o endereço informado
    try {
        parsedUrl = new URL(url);
    } catch {
        throw new Error(
            "A URL informada é inválida. Confira o endereço e tente novamente."
        );
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error(
            "Informe um endereço iniciado por http:// ou https://."
        );
    }

    if (
        !Array.isArray(criteriaFiles) ||
        criteriaFiles.length === 0
    ) {
        throw new Error(
            "Não foi possível iniciar a análise. Recarregue a extensão e tente novamente."
        );
    }

    let tab;

    // 2. Abrir a página em uma aba temporária
    try {
        tab = await chrome.tabs.create({
            url: parsedUrl.href,
            active: false
        });
    } catch (error) {
        console.error("Erro ao abrir a URL:", error);

        throw new Error(
            "Não foi possível abrir o endereço informado. Verifique a URL e sua conexão com a internet."
        );
    }

    try {
        // 3. Aguardar o carregamento da página
        await waitForTabLoad(tab.id);

        const currentTab = await chrome.tabs.get(tab.id);

        if (!currentTab.url) {
            throw new Error(
                "Não foi possível identificar o endereço da página carregada."
            );
        }

        let finalUrl;

        try {
            finalUrl = new URL(currentTab.url);
        } catch {
            throw new Error(
                "Não foi possível carregar a página informada. Verifique se a URL está correta e se o site está acessível."
            );
        }

        if (!["http:", "https:"].includes(finalUrl.protocol)) {
            throw new Error(
                "A página foi redirecionada para um endereço que o AvaliWeb não pode analisar. Informe uma URL HTTP ou HTTPS."
            );
        }

        // 4. Preparar os scripts da análise
        const files = [
            "src/analysis/collector.js",
            "src/analysis/scorer.js",
            ...criteriaFiles,
            "src/content/content.js"
        ];

        // 5. Executar a análise
        let results;

        try {
            results = await chrome.scripting.executeScript({
                target: {
                    tabId: tab.id
                },
                files
            });
        } catch (error) {
            console.error(
                "Erro ao executar os scripts:",
                error
            );

            const technicalMessage = String(
                error?.message || ""
            );

            if (
                /showing error page|error page|net::ERR_/i
                    .test(technicalMessage)
            ) {
                throw new Error(
                    "Não foi possível carregar a página informada. Verifique se a URL está correta e se o site está acessível."
                );
            }

            if (
                /cannot access contents|cannot access.*url|extensions gallery|chrome:\/\/|no tab with id/i
                    .test(technicalMessage)
            ) {
                throw new Error(
                    "O Chrome não permite analisar esta página. Informe uma página HTTP ou HTTPS acessível."
                );
            }

            if (
                /frame.*not found|frame.*removed|tab.*closed/i
                    .test(technicalMessage)
            ) {
                throw new Error(
                    "A página foi fechada ou alterada durante a análise. Tente novamente."
                );
            }

            throw new Error(
                "Não foi possível executar a análise nesta página. Verifique se o site está acessível e tente novamente."
            );
        }

        // 6. Validar o resultado
        if (
            !results ||
            !results[0] ||
            !results[0].result
        ) {
            throw new Error(
                "A página foi carregada, mas a análise não retornou resultados. Tente novamente."
            );
        }

        const analysis = results[0].result;

        analysis.analysisDate = new Date().toISOString();

        return analysis;

    } catch (error) {
        // Preservar mensagens já preparadas para o usuário
        if (error instanceof Error && error.message) {
            throw error;
        }

        throw new Error(
            "Ocorreu um erro inesperado durante a análise. Tente novamente."
        );

    } finally {
        // 7. Fechar a aba temporária, mesmo quando há falha
        try {
            await chrome.tabs.remove(tab.id);
        } catch (error) {
            // A aba pode já ter sido fechada.
            console.warn(
                "Não foi possível fechar a aba temporária:",
                error
            );
        }
    }
}

function waitForTabLoad(tabId) {
    return new Promise((resolve, reject) => {
        let settled = false;

        const cleanup = () => {
            chrome.tabs.onUpdated.removeListener(onUpdated);
            chrome.tabs.onRemoved.removeListener(onRemoved);
            clearTimeout(timeout);
        };

        const finish = (callback, value) => {
            if (settled) {
                return;
            }

            settled = true;
            cleanup();
            callback(value);
        };

        const onUpdated = (updatedTabId, changeInfo) => {
            if (
                updatedTabId === tabId &&
                changeInfo.status === "complete"
            ) {
                finish(resolve);
            }
        };

        const onRemoved = (removedTabId) => {
            if (removedTabId === tabId) {
                finish(
                    reject,
                    new Error(
                        "A página foi fechada antes de concluir o carregamento."
                    )
                );
            }
        };

        const timeout = setTimeout(() => {
            finish(
                reject,
                new Error(
                    "A página demorou demais para carregar. Verifique a URL e tente novamente."
                )
            );
        }, 60000);

        chrome.tabs.onUpdated.addListener(onUpdated);
        chrome.tabs.onRemoved.addListener(onRemoved);

        // Verificar se a página já terminou de carregar
        chrome.tabs.get(tabId)
            .then((currentTab) => {
                if (currentTab.status === "complete") {
                    finish(resolve);
                }
            })
            .catch(() => {
                finish(
                    reject,
                    new Error(
                        "Não foi possível carregar a página informada. Verifique a URL e tente novamente."
                    )
                );
            });
    });
}