const analyzeCurrentButton =
    document.getElementById("analyzeCurrent");

const analyzeUrlButton =
    document.getElementById("analyzeUrl");

const urlInput =
    document.getElementById("urlInput");

const statusElement =
    document.getElementById("status");

const resultsElement =
    document.getElementById("results");

const pageInfoElement =
    document.getElementById("pageInfo");

const viewReportButton =
    document.getElementById("viewReport");


/* ========================================
   CRITÉRIOS DO AVALIWEB
======================================== */

const criteriaFiles = [

    "src/criteria/accessibility/A01-language.js",
    "src/criteria/accessibility/A02-alt-text.js",
    "src/criteria/accessibility/A03-form-labels.js",
    "src/criteria/accessibility/A04-accessible-name.js",
    "src/criteria/accessibility/A05-empty-links.js",
    "src/criteria/accessibility/A06-heading-hierarchy.js",
    "src/criteria/accessibility/A07-text-contrast.js",
    "src/criteria/accessibility/A08-component-contrast.js",
    "src/criteria/accessibility/A09-keyboard-navigation.js",
    "src/criteria/accessibility/A10-tabindex.js",
    "src/criteria/accessibility/A11-visible-focus.js",
    "src/criteria/accessibility/A12-meta-viewport.js",
    "src/criteria/accessibility/A13-dark-theme.js",
    "src/criteria/accessibility/A14-font-resize.js",
    "src/criteria/accessibility/A15-vlibras.js",
    "src/criteria/accessibility/A16-screen-readers.js"

];


/* ========================================
   ANALISAR PÁGINA ATUAL
======================================== */

analyzeCurrentButton.addEventListener(
    "click",
    async () => {

        statusElement.textContent =
            "Iniciando análise...";

        resultsElement.classList.add(
            "hidden"
        );

        try {

            const [tab] =
                await chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });

            if (!tab || !tab.id) {

                throw new Error(
                    "Não foi possível identificar a aba atual."
                );
            }


            /*
             * Executa todos os componentes
             * necessários para a análise.
             */

            const files = [

                "src/analysis/collector.js",
                "src/analysis/scorer.js",

                ...criteriaFiles,

                "src/content/content.js"

            ];


            const result =
                await chrome.scripting.executeScript({

                    target: {
                        tabId: tab.id
                    },

                    files: files

                });


            if (
                !result ||
                !result[0] ||
                !result[0].result
            ) {

                throw new Error(
                    "A análise não retornou resultados."
                );
            }


            const analysis =
                result[0].result;


            /*
             * Salva o último resultado.
             * Será utilizado posteriormente
             * pelo relatório.
             */

            analysis.analysisDate = new Date().toISOString();

            await chrome.storage.local.set({
                avaliWebLastAnalysis: analysis
            });


            showAnalysisResult(
                analysis
            );


            statusElement.textContent =
                "Análise concluída com sucesso.";


            resultsElement.classList.remove(
                "hidden"
            );

        } catch (error) {

            console.error(
                "Erro ao realizar análise:",
                error
            );

            statusElement.textContent =
                "Erro ao realizar a análise.";

        }

    }
);


/* ========================================
   ANALISAR URL
======================================== */

analyzeUrlButton.addEventListener(
    "click",
    () => {

        const url =
            urlInput.value.trim();

        if (!url) {

            statusElement.textContent =
                "Informe uma URL.";

            return;
        }


        statusElement.textContent =
            "A análise por URL será implementada nas próximas etapas.";

    }
);


/* ========================================
   EXIBIR RESULTADO
======================================== */

function showAnalysisResult(data) {

    const categories =
        data.categories;

    pageInfoElement.innerHTML = "";


    /* ====================================
       ACESSIBILIDADE
    ==================================== */

    const accessibility =
        document.createElement("div");

    accessibility.className =
        "info-item";

    accessibility.innerHTML = `
        <span class="info-label">
            Acessibilidade:
        </span>

        ${
            categories.accessibility !== null
                ? `${categories.accessibility}/10`
                : "N/A"
        }
    `;

    pageInfoElement.appendChild(
        accessibility
    );


    /* ====================================
       USABILIDADE
    ==================================== */

    const usability =
        document.createElement("div");

    usability.className =
        "info-item";

    usability.innerHTML = `
        <span class="info-label">
            Usabilidade:
        </span>

        ${
            categories.usability !== null
                ? `${categories.usability}/10`
                : "N/A"
        }
    `;

    pageInfoElement.appendChild(
        usability
    );


    /* ====================================
       DESIGN
    ==================================== */

    const design =
        document.createElement("div");

    design.className =
        "info-item";

    design.innerHTML = `
        <span class="info-label">
            Design:
        </span>

        ${
            categories.design !== null
                ? `${categories.design}/10`
                : "N/A"
        }
    `;

    pageInfoElement.appendChild(
        design
    );


    /* ====================================
       RESPONSIVIDADE
    ==================================== */

    const responsive =
        document.createElement("div");

    responsive.className =
        "info-item";

    responsive.innerHTML = `
        <span class="info-label">
            Responsividade:
        </span>

        ${
            categories.responsive !== null
                ? `${categories.responsive}/10`
                : "N/A"
        }
    `;

    pageInfoElement.appendChild(
        responsive
    );

}


/* ========================================
   SEGURANÇA
======================================== */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

viewReportButton.addEventListener(
    "click",
    async () => {

        await chrome.tabs.create({
            url: chrome.runtime.getURL(
                "src/report/report.html"
            )
        });

    }
);