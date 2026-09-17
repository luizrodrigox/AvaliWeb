const loadingElement =
    document.getElementById("loading");

const reportElement =
    document.getElementById("report");

const emptyElement =
    document.getElementById("empty");

const pageInfoElement =
    document.getElementById("pageInfo");

const categoryScoresElement =
    document.getElementById("categoryScores");

const criteriaListElement =
    document.getElementById("criteriaList");

const downloadButton =
    document.getElementById("downloadReport");

const printButton =
    document.getElementById("printReport");


let currentAnalysis = null;


/* ========================================
   CARREGAR ANÁLISE
======================================== */

async function loadAnalysis() {

    try {

        const result =
            await chrome.storage.local.get(
                "avaliWebLastAnalysis"
            );

        const analysis =
            result.avaliWebLastAnalysis;


        if (!analysis) {

            showEmpty();

            return;
        }


        currentAnalysis = analysis;

        renderReport(analysis);

    } catch (error) {

        console.error(
            "Erro ao carregar relatório:",
            error
        );

        showEmpty();
    }
}


/* ========================================
   EXIBIR RELATÓRIO
======================================== */

function renderReport(data) {

    loadingElement.classList.add(
        "hidden"
    );

    emptyElement.classList.add(
        "hidden"
    );

    reportElement.classList.remove(
        "hidden"
    );


    renderPageInfo(
        data.pageData
    );


    renderCategoryScores(
        data.categories
    );


    renderCriteria(
        data.criteria
    );
}


/* ========================================
   INFORMAÇÕES DA PÁGINA
======================================== */

function renderPageInfo(pageData) {

    const documentData =
        pageData.document || {};

    const viewport =
        pageData.viewport || {};


    pageInfoElement.innerHTML = `

        <div class="info-item">

            <span class="info-label">
                Título
            </span>

            ${escapeHtml(
                documentData.title ||
                "Não informado"
            )}

        </div>


        <div class="info-item">

            <span class="info-label">
                URL
            </span>

            ${escapeHtml(
                documentData.url ||
                "Não informado"
            )}

        </div>


        <div class="info-item">

            <span class="info-label">
                Idioma
            </span>

            ${escapeHtml(
                documentData.language ||
                "Não informado"
            )}

        </div>


        <div class="info-item">

            <span class="info-label">
                Data e hora da análise
            </span>

            ${formatDateTime(new Date(currentAnalysis.analysisDate))}

        </div>


        <div class="info-item">

            <span class="info-label">
                Viewport
            </span>

            ${viewport.width || 0}
            ×
            ${viewport.height || 0}
            px

        </div>

    `;
}


/* ========================================
   NOTAS DAS CATEGORIAS
======================================== */

function renderCategoryScores(categories) {

    const categoryNames = {

        accessibility:
            "Acessibilidade",

        usability:
            "Usabilidade",

        design:
            "Design",

        responsive:
            "Responsividade"

    };


    categoryScoresElement.innerHTML = "";


    Object.keys(categoryNames)
        .forEach((category) => {

            const score =
                categories[category];


            const card =
                document.createElement("div");

            card.className =
                "category-card";


            card.innerHTML = `

                <div class="category-name">
                    ${categoryNames[category]}
                </div>

                <div class="category-score">

                    ${
                        score === null ||
                        score === undefined

                            ? "N/A"

                            : `${score}/10`

                    }

                </div>

            `;


            categoryScoresElement.appendChild(
                card
            );

        });
}


/* ========================================
   CRITÉRIOS
======================================== */

function renderCriteria(criteria) {

    criteriaListElement.innerHTML = "";


    if (
        !criteria ||
        criteria.length === 0
    ) {

        criteriaListElement.innerHTML = `

            <p>
                Nenhum critério foi encontrado.
            </p>

        `;

        return;
    }


    criteria.forEach(
        (criterion) => {

            const element =
                document.createElement("article");

            element.className =
                "criterion";


            /*
             * Elementos encontrados no critério.
             */
            const elements =
                criterion.elements || [];


            /*
             * Agrupa os elementos por seletor,
             * evitando repetir o mesmo elemento.
             */
            const groupedElements =
                groupElements(elements);


            const elementsHtml =
                groupedElements.length > 0

                    ? `

                        <div class="elements-count">

                            ${getTotalOccurrences(
                                groupedElements
                            )}

                            ${
                                getTotalOccurrences(
                                    groupedElements
                                ) === 1
                                    ? "elemento afetado"
                                    : "elementos afetados"
                            }

                        </div>


                        <ul class="elements-list">

                            ${groupedElements
                                .map((item) => {

                                    return `

                                        <li>

                                            ${escapeHtml(
                                                item.selector
                                            )}

                                            ${
                                                item.count > 1
                                                    ? ` (${item.count} ocorrências)`
                                                    : ""
                                            }

                                        </li>

                                    `;

                                })
                                .join("")}

                        </ul>

                    `

                    : `

                        <p>
                            Nenhum elemento específico
                            foi identificado.
                        </p>

                    `;


            /*
             * Formata a evidência para que cada
             * informação fique em uma linha.
             */
            const evidenceHtml =
                formatEvidenceHtml(
                    criterion.evidence
                );


            element.innerHTML = `

                <div class="criterion-header">

                    <div>

                        <div class="criterion-id">

                            ${escapeHtml(
                                criterion.id || ""
                            )}

                        </div>


                        <h3 class="criterion-title">

                            ${escapeHtml(
                                criterion.name ||
                                "Critério sem nome"
                            )}

                        </h3>


                        <span class="classification">

                            ${escapeHtml(
                                criterion.classification ||
                                "Não classificado"
                            )}

                        </span>

                    </div>


                    <div class="criterion-score">

                        ${
                            criterion.score !== undefined
                                ? `${criterion.score}/10`
                                : "N/A"
                        }

                    </div>

                </div>


                <div class="criterion-section">

                    <div class="criterion-section-title">
                        Evidência
                    </div>

                    <p>
                        ${evidenceHtml}
                    </p>

                </div>


                <div class="criterion-section">

                    <div class="criterion-section-title">
                        Elementos relacionados
                    </div>

                    ${elementsHtml}

                </div>


                <div class="criterion-section">

                    <div class="criterion-section-title">
                        Recomendação
                    </div>

                    <p>

                        ${escapeHtml(
                            criterion.recommendation ||
                            "Nenhuma recomendação informada."
                        )}

                    </p>

                </div>

            `;


            criteriaListElement.appendChild(
                element
            );

        }
    );
}


/* ========================================
   AGRUPAR ELEMENTOS
======================================== */

function groupElements(elements) {

    const groups = new Map();


    elements.forEach((item) => {

        const selector =
            item.selector ||
            item.description ||
            "Elemento não identificado";


        if (groups.has(selector)) {

            groups.get(selector).count += 1;

        } else {

            groups.set(
                selector,
                {
                    selector: selector,
                    count: 1
                }
            );

        }

    });


    return Array.from(
        groups.values()
    );
}


/* ========================================
   TOTAL DE OCORRÊNCIAS
======================================== */

function getTotalOccurrences(groups) {

    return groups.reduce(
        (total, item) =>
            total + item.count,
        0
    );
}


/* ========================================
   FORMATAR EVIDÊNCIA
======================================== */

function formatEvidenceHtml(evidence) {

    if (!evidence) {

        return "Nenhuma evidência informada.";
    }


    /*
     * Cada informação separada por vírgula
     * será apresentada em uma nova linha.
     */
    const lines =
        String(evidence)
            .split(",")
            .map(
                (item) =>
                    item.trim()
            )
            .filter(
                (item) =>
                    item.length > 0
            );


    return lines
        .map(
            (line) =>
                escapeHtml(line)
        )
        .join("<br>");
}


/* ========================================
   DOWNLOAD
======================================== */

downloadButton.addEventListener(
    "click",
    () => {
        if (!currentAnalysis) {
            return;
        }

        window.print();
    }
);

/* ========================================
   IMPRESSÃO
======================================== */

printButton.addEventListener(
    "click",
    () => {

        window.print();

    }
);


/* ========================================
   RELATÓRIO VAZIO
======================================== */

function showEmpty() {

    loadingElement.classList.add("hidden");


    reportElement.classList.add("hidden");


    emptyElement.classList.remove("hidden");
}


/* ========================================
   DATA E HORA
======================================== */

function formatDateTime(date) {

    return date.toLocaleString(
        "pt-BR"
    );
}


/* ========================================
   ESCAPE HTML
======================================== */

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


/* ========================================
   INICIALIZAÇÃO
======================================== */

loadAnalysis();