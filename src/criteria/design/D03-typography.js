globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.D03 =
    function evaluateD03() {

        const evaluatedElements = [];
        const problematicElements = [];

        /*
         * =========================================================
         * ELEMENTOS TEXTUAIS AVALIADOS
         * =========================================================
         *
         * O D03 avalia exclusivamente a apresentação visual
         * da tipografia.
         *
         * A estrutura semântica dos H1-H6 pertence ao A06.
         */

        const textElements =
            document.querySelectorAll(
                "h1, h2, h3, h4, h5, h6, p, li, label, button, a"
            );

        textElements.forEach((element) => {

            const style =
                window.getComputedStyle(element);

            if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                parseFloat(style.opacity) === 0
            ) {
                return;
            }

            const text =
                element.textContent.trim();

            if (text.length === 0) {
                return;
            }

            evaluatedElements.push(element);
        });

        /*
         * =========================================================
         * NENHUM ELEMENTO
         * =========================================================
         */

        if (evaluatedElements.length === 0) {
            return {
                id: "D03",
                category: "design",
                name: "Hierarquia tipográfica",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,
                evidence: [
                    "Nenhum elemento textual foi identificado para avaliação."
                ],
                elements: [],
                recommendation:
                    "Não há elementos textuais suficientes para avaliar a hierarquia tipográfica."
            };
        }

        /*
         * =========================================================
         * COLETA DAS CARACTERÍSTICAS TIPOGRÁFICAS
         * =========================================================
         */

        const getTypography =
            (element) => {

                const style =
                    window.getComputedStyle(
                        element
                    );

                return {
                    fontSize:
                        parseFloat(
                            style.fontSize
                        ) || 0,

                    fontWeight:
                        normalizeFontWeight(
                            style.fontWeight
                        )
                };
            };

        /*
         * =========================================================
         * IDENTIFICA ELEMENTOS DE TÍTULO
         * =========================================================
         */

        const headings =
            evaluatedElements.filter(
                (element) =>
                    /^h[1-6]$/.test(
                        element.tagName.toLowerCase()
                    )
            );

        /*
         * =========================================================
         * IDENTIFICA TEXTOS COMUNS
         * =========================================================
         */

        const bodyTexts =
            evaluatedElements.filter(
                (element) => {

                    const tagName =
                        element.tagName.toLowerCase();

                    return (
                        tagName === "p" ||
                        tagName === "li" ||
                        tagName === "label"
                    );
                }
            );

        /*
         * =========================================================
         * TAMANHO MÉDIO DO TEXTO COMUM
         * =========================================================
         */

        let averageBodyFontSize = 0;

        if (bodyTexts.length > 0) {

            const totalBodyFontSize =
                bodyTexts.reduce(
                    (sum, element) =>
                        sum +
                        getTypography(
                            element
                        ).fontSize,
                    0
                );

            averageBodyFontSize =
                totalBodyFontSize /
                bodyTexts.length;
        }

        /*
         * =========================================================
         * MAIOR TAMANHO DE TÍTULO
         * =========================================================
         */

        let largestHeadingFontSize = 0;

        if (headings.length > 0) {

            largestHeadingFontSize =
                Math.max(
                    ...headings.map(
                        (heading) =>
                            getTypography(
                                heading
                            ).fontSize
                    )
                );
        }

        /*
         * =========================================================
         * AVALIAÇÃO
         * =========================================================
         *
         * O critério verifica:
         *
         * 1. Títulos devem possuir diferenciação visual
         *    em relação ao texto comum.
         *
         * 2. Textos comuns não devem apresentar tamanho
         *    igual ou superior ao maior título.
         *
         * 3. Elementos textuais avaliáveis devem apresentar
         *    características tipográficas coerentes.
         *
         * Não é analisada a sequência H1 → H2 → H3.
         * Essa responsabilidade pertence ao A06.
         */

        let adequate = 0;

        evaluatedElements.forEach(
            (element) => {

                const tagName =
                    element.tagName.toLowerCase();

                const typography =
                    getTypography(element);

                let isAdequate = true;
                let description = "";

                /*
                 * -------------------------------------------------
                 * TÍTULOS
                 * -------------------------------------------------
                 */

                if (
                    /^h[1-6]$/.test(tagName)
                ) {

                    /*
                     * Se existem textos comuns, o título precisa
                     * apresentar diferenciação visual.
                     */

                    if (
                        bodyTexts.length > 0 &&
                        typography.fontSize <=
                            averageBodyFontSize
                    ) {

                        isAdequate = false;

                        description =
                            "Título sem diferenciação adequada de tamanho em relação ao texto comum.";
                    }

                    /*
                     * Caso o tamanho seja igual ao texto comum,
                     * um peso maior pode fornecer diferenciação
                     * visual suficiente.
                     */

                    if (
                        bodyTexts.length > 0 &&
                        typography.fontSize <=
                            averageBodyFontSize &&
                        typography.fontWeight <= 400
                    ) {

                        isAdequate = false;

                        description =
                            "Título sem diferenciação adequada de tamanho ou peso em relação ao texto comum.";
                    }
                }

                /*
                 * -------------------------------------------------
                 * TEXTOS COMUNS
                 * -------------------------------------------------
                 */

                if (
                    tagName === "p" ||
                    tagName === "li" ||
                    tagName === "label"
                ) {

                    if (
                        largestHeadingFontSize > 0 &&
                        typography.fontSize >=
                            largestHeadingFontSize
                    ) {

                        isAdequate = false;

                        description =
                            "Texto comum apresenta tamanho igual ou superior ao maior título identificado.";
                    }
                }

                /*
                 * -------------------------------------------------
                 * BOTÕES E LINKS
                 * -------------------------------------------------
                 *
                 * Não são obrigados a ser maiores que textos
                 * comuns. A avaliação considera apenas situações
                 * em que o elemento perde completamente sua
                 * diferenciação tipográfica.
                 */

                if (
                    tagName === "button" ||
                    tagName === "a"
                ) {

                    const hasText =
                        element.textContent
                            .trim()
                            .length > 0;

                    if (
                        hasText &&
                        typography.fontSize <= 0
                    ) {

                        isAdequate = false;

                        description =
                            "Elemento textual sem tamanho de fonte identificável.";
                    }
                }

                /*
                 * -------------------------------------------------
                 * RESULTADO DO ELEMENTO
                 * -------------------------------------------------
                 */

                if (isAdequate) {

                    adequate++;

                } else {

                    problematicElements.push({
                        selector:
                            getElementSelector(
                                element
                            ),
                        description:
                            description
                    });
                }
            }
        );

        /*
         * =========================================================
         * CÁLCULO DA PONTUAÇÃO
         * =========================================================
         */

        const score =
            Number(
                (
                    (
                        adequate /
                        evaluatedElements.length
                    ) * 10
                ).toFixed(1)
            );

        let classification;

        if (score >= 9.0) {

            classification =
                "Adequado";

        } else if (score >= 5.0) {

            classification =
                "Atenção";

        } else {

            classification =
                "Problema";
        }

        /*
         * =========================================================
         * RESULTADO FINAL
         * =========================================================
         */

        return {

            id: "D03",

            category:
                "design",

            name:
                "Hierarquia tipográfica",

            score:
                score,

            classification:
                classification,

            evaluated:
                evaluatedElements.length,

            adequate:
                adequate,

            evidence: [

                `Elementos avaliados: ${evaluatedElements.length}`,

                `Elementos com hierarquia adequada: ${adequate}`,

                `Elementos com possíveis problemas: ${problematicElements.length}`,

                `Títulos identificados: ${headings.length}`,

                `Textos comuns identificados: ${bodyTexts.length}`,

                `Maior tamanho de título: ${
                    largestHeadingFontSize > 0
                        ? largestHeadingFontSize.toFixed(1)
                        : "não identificado"
                } CSS px`,

                `Tamanho médio dos textos comuns: ${
                    averageBodyFontSize > 0
                        ? averageBodyFontSize.toFixed(1)
                        : "não identificado"
                } CSS px`,

                `Pontuação: ${score}/10`
            ],

            elements:
                problematicElements,

            recommendation:
                problematicElements.length > 0

                    ? "Estabeleça uma hierarquia tipográfica visual clara, utilizando diferenças consistentes de tamanho e peso entre títulos e textos."

                    : "Mantenha diferenças consistentes de tamanho e peso entre títulos e textos para preservar a hierarquia visual da interface."
        };
    };

/*
 * =========================================================
 * NORMALIZAÇÃO DO PESO DA FONTE
 * =========================================================
 */

function normalizeFontWeight(
    fontWeight
) {

    if (
        fontWeight === "normal"
    ) {
        return 400;
    }

    if (
        fontWeight === "bold"
    ) {
        return 700;
    }

    const numericWeight =
        parseInt(
            fontWeight,
            10
        );

    return Number.isFinite(
        numericWeight
    )
        ? numericWeight
        : 400;
}

/*
 * =========================================================
 * SELETOR DO ELEMENTO
 * =========================================================
 */

function getElementSelector(
    element
) {

    if (element.id) {

        return `#${CSS.escape(
            element.id
        )}`;
    }

    if (element.name) {

        return `${element.tagName.toLowerCase()}[name="${CSS.escape(
            element.name
        )}"]`;
    }

    if (
        element.classList &&
        element.classList.length > 0
    ) {

        return `${element.tagName.toLowerCase()}.${Array.from(
            element.classList
        )
            .map(
                (className) =>
                    CSS.escape(
                        className
                    )
            )
            .join(".")}`;
    }

    return element.tagName
        .toLowerCase();
}