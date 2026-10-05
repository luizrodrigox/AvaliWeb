globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.D02 =
    function evaluateD02() {

        /*
         * =========================================================
         * D02 — QUANTIDADE DE CORES UTILIZADAS
         * =========================================================
         *
         * Identifica cores distintas utilizadas em textos, fundos
         * e componentes relevantes da página.
         *
         * Regra:
         *
         * <= 5   = 10
         * 6–8    = 8
         * 9–12   = 6
         * 13–20  = 4
         * >20    = 2
         */

        const relevantElements =
            document.querySelectorAll(
                "body, header, nav, main, footer, aside, " +
                "section, article, div, p, li, a, button, " +
                "input, select, textarea, label, " +
                "h1, h2, h3, h4, h5, h6, " +
                "table, thead, tbody, tr, th, td, " +
                "img, figure, figcaption"
            );

        const evaluatedElements = [];

        const colors = new Map();

        /*
         * =========================================================
         * 1. IDENTIFICA ELEMENTOS VISÍVEIS
         * =========================================================
         */

        relevantElements.forEach(
            (element) => {

                const style =
                    window.getComputedStyle(
                        element
                    );

                /*
                 * Ignora elementos não visíveis.
                 */

                if (
                    style.display === "none" ||
                    style.visibility === "hidden" ||
                    parseFloat(style.opacity) === 0
                ) {
                    return;
                }

                evaluatedElements.push(
                    element
                );

                /*
                 * =================================================
                 * COR DO TEXTO
                 * =================================================
                 */

                registerColor(
                    colors,
                    style.color,
                    element,
                    "cor do texto"
                );

                /*
                 * =================================================
                 * COR DE FUNDO
                 * =================================================
                 */

                registerColor(
                    colors,
                    style.backgroundColor,
                    element,
                    "cor de fundo"
                );

                /*
                 * =================================================
                 * COR DA BORDA
                 * =================================================
                 */

                registerBorderColors(
                    colors,
                    style,
                    element
                );

                /*
                 * =================================================
                 * COR DO OUTLINE
                 * =================================================
                 */

                registerColor(
                    colors,
                    style.outlineColor,
                    element,
                    "cor do outline"
                );
            }
        );

        /*
         * =========================================================
         * 2. NENHUM ELEMENTO AVALIÁVEL
         * =========================================================
         */

        if (
            evaluatedElements.length === 0
        ) {
            return {
                id: "D02",
                category: "design",
                name: "Quantidade de cores utilizadas",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,
                evidence: [
                    "Nenhum elemento visual visível foi identificado para avaliação."
                ],
                elements: [],
                recommendation:
                    "Não foram identificados elementos visuais suficientes para avaliar a quantidade de cores utilizadas."
            };
        }

        /*
         * =========================================================
         * 3. QUANTIDADE DE CORES DISTINTAS
         * =========================================================
         */

        const totalColors =
            colors.size;

        /*
         * =========================================================
         * 4. CÁLCULO DA PONTUAÇÃO
         * =========================================================
         */

        let score;

        if (
            totalColors <= 5
        ) {
            score = 10;
        } else if (
            totalColors <= 8
        ) {
            score = 8;
        } else if (
            totalColors <= 12
        ) {
            score = 6;
        } else if (
            totalColors <= 20
        ) {
            score = 4;
        } else {
            score = 2;
        }

        /*
         * =========================================================
         * 5. CLASSIFICAÇÃO
         * =========================================================
         */

        let classification;

        if (score >= 9.0) {
            classification = "Adequado";
        } else if (score >= 5.0) {
            classification = "Atenção";
        } else {
            classification = "Problema";
        }

        /*
         * =========================================================
         * 6. CORES IDENTIFICADAS
         * =========================================================
         */

        const colorNames =
            Array.from(
                colors.keys()
            );

        /*
         * =========================================================
         * 7. ELEMENTOS RELACIONADOS
         * =========================================================
         *
         * Quando a quantidade de cores ultrapassa 5, são
         * apresentados os elementos que contribuíram para a
         * diversidade cromática identificada.
         */

        const problematicElements = [];

        if (
            totalColors > 5
        ) {

            const seen =
                new Set();

            colors.forEach(
                (colorData) => {

                    colorData.elements.forEach(
                        (item) => {

                            const selector =
                                getElementSelector(
                                    item.element
                                );

                            const key =
                                `${selector}|${item.usage}`;

                            if (
                                seen.has(key)
                            ) {
                                return;
                            }

                            seen.add(key);

                            problematicElements.push({
                                selector:
                                    selector,
                                description:
                                    `Utiliza ${item.usage}: ${colorData.color}.`
                            });
                        }
                    );
                }
            );
        }

        /*
         * =========================================================
         * 8. EVIDÊNCIAS
         * =========================================================
         */

        const evidence = [
            `Elementos avaliados: ${evaluatedElements.length}`,
            `Cores distintas identificadas: ${totalColors}`,
            `Cores encontradas: ${colorNames.join(", ")}`,
            `Pontuação: ${score}/10`
        ];

        /*
         * =========================================================
         * 9. RECOMENDAÇÃO
         * =========================================================
         */

        let recommendation;

        if (
            totalColors <= 5
        ) {

            recommendation =
                "Mantenha uma paleta de cores controlada e consistente para preservar a organização visual da interface.";

        } else if (
            totalColors <= 8
        ) {

            recommendation =
                "Considere revisar a quantidade de cores utilizadas e manter uma paleta visual consistente entre textos, fundos e componentes.";

        } else {

            recommendation =
                "Reduza a quantidade de cores utilizadas na interface, priorizando uma paleta mais controlada e consistente entre textos, fundos e componentes.";
        }

        /*
         * =========================================================
         * 10. RESULTADO FINAL
         * =========================================================
         */

        return {
            id: "D02",
            category: "design",
            name: "Quantidade de cores utilizadas",
            score: score,
            classification: classification,
            evaluated:
                evaluatedElements.length,
            adequate:
                totalColors <= 5
                    ? totalColors
                    : 0,
            evidence:
                evidence,
            elements:
                problematicElements,
            recommendation:
                recommendation
        };
    };


/*
 * =============================================================
 * REGISTRA UMA COR
 * =============================================================
 */

function registerColor(
    colors,
    color,
    element,
    usage
) {

    if (
        !color ||
        color.trim().length === 0
    ) {
        return;
    }

    const normalized =
        normalizeColor(
            color
        );

    /*
     * Cores transparentes não são consideradas.
     */

    if (
        !normalized ||
        normalized === "transparent"
    ) {
        return;
    }

    if (
        !colors.has(
            normalized
        )
    ) {

        colors.set(
            normalized,
            {
                color:
                    normalized,
                elements: []
            }
        );
    }

    colors
        .get(normalized)
        .elements
        .push({
            element:
                element,
            usage:
                usage
        });
}


/*
 * =============================================================
 * REGISTRA CORES DAS BORDAS
 * =============================================================
 */

function registerBorderColors(
    colors,
    style,
    element
) {

    const borderProperties = [
        {
            value:
                style.borderTopColor,
            usage:
                "cor da borda superior"
        },
        {
            value:
                style.borderRightColor,
            usage:
                "cor da borda direita"
        },
        {
            value:
                style.borderBottomColor,
            usage:
                "cor da borda inferior"
        },
        {
            value:
                style.borderLeftColor,
            usage:
                "cor da borda esquerda"
        }
    ];

    borderProperties.forEach(
        (border) => {

            /*
             * Só considera a cor quando a respectiva borda
             * possui largura diferente de zero.
             */

            registerColor(
                colors,
                border.value,
                element,
                border.usage
            );
        }
    );
}


/*
 * =============================================================
 * NORMALIZAÇÃO DE CORES
 * =============================================================
 *
 * Converte formatos equivalentes para uma representação comum.
 */

function normalizeColor(
    color
) {

    const value =
        color
            .trim()
            .toLowerCase();

    if (
        value === "transparent"
    ) {
        return "transparent";
    }

    /*
     * rgb() e rgba() já são retornados pelo navegador em
     * formato padronizado pelo getComputedStyle.
     */

    const rgbaMatch =
        value.match(
            /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/
        );

    if (
        rgbaMatch
    ) {

        const r =
            Number(
                rgbaMatch[1]
            );

        const g =
            Number(
                rgbaMatch[2]
            );

        const b =
            Number(
                rgbaMatch[3]
            );

        const alpha =
            rgbaMatch[4] !== undefined
                ? Number(
                    rgbaMatch[4]
                )
                : 1;

        if (
            alpha === 0
        ) {
            return "transparent";
        }

        return `rgb(${r}, ${g}, ${b})`;
    }

    return value;
}


/*
 * =============================================================
 * OBTENÇÃO DO SELETOR
 * =============================================================
 */

function getElementSelector(
    element
) {

    if (
        element.id
    ) {

        return `#${CSS.escape(
            element.id
        )}`;
    }

    if (
        element.name
    ) {

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