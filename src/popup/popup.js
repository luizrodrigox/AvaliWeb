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
    "src/criteria/accessibility/A16-screen-readers.js",

    "src/criteria/usability/U01-click-target-size.js",
    "src/criteria/usability/U02-target-distance.js",
    "src/criteria/usability/U03-menu-options.js",
    "src/criteria/usability/U04-interactive-elements.js",
    "src/criteria/usability/U05-descriptive-text.js",
    "src/criteria/usability/U06-visual-feedback.js",
    "src/criteria/usability/U07-button-consistency.js",

    "src/criteria/design/D01-font-families.js",
    "src/criteria/design/D02-color-count.js",
    "src/criteria/design/D03-typography.js",
    "src/criteria/design/D04-spacing-elements.js",
    "src/criteria/design/D05-overlap.js",

    "src/criteria/responsiveness/R01-horizontal-overflow.js",
    "src/criteria/responsiveness/R02-elements-outside-viewport.js",
    "src/criteria/responsiveness/R03-mobile-layout.js",
    "src/criteria/responsiveness/R04-text-resize.js"

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
    async () => {
        let url = urlInput.value.trim();

        if (!url) {
            statusElement.textContent =
                "Informe uma URL.";

            return;
        }

        if (!/^https?:\/\//i.test(url)) {
            url = `https://${url}`;
        }

        try {
            const parsedUrl = new URL(url);

            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                throw new Error("Informe uma URL HTTP ou HTTPS válida.");
            }

            statusElement.textContent =
                "Carregando página e realizando análise...";

            resultsElement.classList.add("hidden");

            const response = await chrome.runtime.sendMessage({
                action: "ANALYZE_URL",
                url: parsedUrl.href,
                criteriaFiles
            });

            if (!response || !response.success) {
                throw new Error(
                    response?.error || "Não foi possível analisar a URL."
                );
            }

            const analysis = response.analysis;

            await chrome.storage.local.set({
                avaliWebLastAnalysis: analysis
            });

            showAnalysisResult(analysis);

            statusElement.textContent =
                "Análise da URL concluída com sucesso.";

            resultsElement.classList.remove("hidden");
        } catch (error) {
            console.error(
                "Erro ao analisar URL:",
                error
            );

            statusElement.textContent =
                error.message || "Erro ao realizar a análise.";
        }
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