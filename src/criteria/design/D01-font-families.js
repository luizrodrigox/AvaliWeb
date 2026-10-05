globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.D01 =
    function evaluateD01() {

        /*
         * =========================================================
         * D01 — QUANTIDADE DE FAMÍLIAS TIPOGRÁFICAS
         * =========================================================
         *
         * Identifica as famílias tipográficas utilizadas nos
         * elementos textuais visíveis da página.
         *
         * Regra de pontuação:
         *
         * 1–2 famílias = 10
         * 3 famílias   = 8
         * 4 famílias   = 6
         * 5 famílias   = 4
         * >5 famílias  = 2
         */

        const textElements = document.querySelectorAll(
            "p, li, a, button, label, input, select, textarea, " +
            "h1, h2, h3, h4, h5, h6, td, th, span, caption, " +
            "blockquote, pre, code"
        );

        const evaluatedElements = [];
        const fontFamilies = new Map();

        /*
         * =========================================================
         * 1. SELEÇÃO DOS ELEMENTOS TEXTUAIS
         * =========================================================
         */

        textElements.forEach((element) => {

            const style =
                window.getComputedStyle(element);

            /*
             * Ignora elementos que não estão visíveis.
             */
            if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                parseFloat(style.opacity) === 0
            ) {
                return;
            }

            /*
             * Para controles de formulário, considera-se também
             * o próprio elemento mesmo que seu textContent esteja
             * vazio.
             */
            const tagName =
                element.tagName.toLowerCase();

            const isFormControl =
                tagName === "input" ||
                tagName === "select" ||
                tagName === "textarea";

            const text =
                element.textContent.trim();

            if (
                text.length === 0 &&
                !isFormControl
            ) {
                return;
            }

            const fontFamily =
                style.fontFamily;

            if (
                !fontFamily ||
                fontFamily.trim().length === 0
            ) {
                return;
            }

            evaluatedElements.push({
                element: element,
                fontFamily: fontFamily
            });

            /*
             * =====================================================
             * Identificação da família efetivamente declarada
             * =====================================================
             *
             * Quando existe uma lista como:
             *
             * Arial, Helvetica, sans-serif
             *
             * considera-se Arial como a família principal.
             */

            const primaryFamily =
                extractPrimaryFontFamily(
                    fontFamily
                );

            if (primaryFamily) {

                const normalizedFamily =
                    normalizeFontFamily(
                        primaryFamily
                    );

                if (
                    !fontFamilies.has(
                        normalizedFamily
                    )
                ) {
                    fontFamilies.set(
                        normalizedFamily,
                        {
                            name: primaryFamily,
                            count: 0,
                            elements: []
                        }
                    );
                }

                const familyData =
                    fontFamilies.get(
                        normalizedFamily
                    );

                familyData.count++;

                familyData.elements.push(
                    element
                );
            }
        });

        /*
         * =========================================================
         * 2. NENHUM ELEMENTO AVALIÁVEL
         * =========================================================
         */

        if (
            evaluatedElements.length === 0
        ) {
            return {
                id: "D01",
                category: "design",
                name: "Quantidade de famílias tipográficas",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,
                evidence: [
                    "Nenhum elemento textual visível foi identificado para avaliação."
                ],
                elements: [],
                recommendation:
                    "Não foram identificados elementos textuais suficientes para avaliar a quantidade de famílias tipográficas."
            };
        }

        /*
         * =========================================================
         * 3. QUANTIDADE DE FAMÍLIAS
         * =========================================================
         */

        const totalFamilies =
            fontFamilies.size;

        /*
         * =========================================================
         * 4. CÁLCULO DA PONTUAÇÃO
         * =========================================================
         */

        let score;

        if (
            totalFamilies >= 1 &&
            totalFamilies <= 2
        ) {
            score = 10;
        } else if (
            totalFamilies === 3
        ) {
            score = 8;
        } else if (
            totalFamilies === 4
        ) {
            score = 6;
        } else if (
            totalFamilies === 5
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
         * 6. ELEMENTOS RELACIONADOS
         * =========================================================
         *
         * Os elementos são apresentados quando existe uma
         * quantidade de famílias acima da faixa considerada
         * adequada pelo critério.
         */

        const problematicElements = [];

        if (totalFamilies > 2) {

            fontFamilies.forEach(
                (familyData) => {

                    familyData.elements.forEach(
                        (element) => {

                            problematicElements.push({
                                selector:
                                    getElementSelector(
                                        element
                                    ),
                                description:
                                    `Elemento utilizando a família tipográfica "${familyData.name}".`
                            });

                        }
                    );
                }
            );
        }

        /*
         * =========================================================
         * 7. EVIDÊNCIAS
         * =========================================================
         */

        const familyNames =
            Array.from(
                fontFamilies.values()
            ).map(
                (familyData) =>
                    familyData.name
            );

        const evidence = [
            `Elementos avaliados: ${evaluatedElements.length}`,
            `Famílias tipográficas identificadas: ${totalFamilies}`,
            `Famílias encontradas: ${familyNames.join(", ")}`,
            `Pontuação: ${score}/10`
        ];

        /*
         * =========================================================
         * 8. RECOMENDAÇÃO
         * =========================================================
         */

        let recommendation;

        if (totalFamilies <= 2) {

            recommendation =
                "Mantenha o uso controlado de famílias tipográficas, preservando a consistência visual da interface.";

        } else if (totalFamilies === 3) {

            recommendation =
                "Considere reduzir a quantidade de famílias tipográficas para manter maior consistência visual na interface.";

        } else {

            recommendation =
                "Reduza a quantidade de famílias tipográficas utilizadas na interface para melhorar a consistência visual e a organização do conteúdo.";
        }

        /*
         * =========================================================
         * 9. RESULTADO FINAL
         * =========================================================
         */

        return {
            id: "D01",
            category: "design",
            name: "Quantidade de famílias tipográficas",
            score: score,
            classification: classification,
            evaluated: evaluatedElements.length,
            adequate:
                totalFamilies <= 2
                    ? totalFamilies
                    : 0,
            evidence: evidence,
            elements:
                problematicElements,
            recommendation:
                recommendation
        };
    };


/*
 * =============================================================
 * FUNÇÃO AUXILIAR
 * =============================================================
 *
 * Obtém a primeira família declarada no valor de font-family.
 *
 * Exemplos:
 *
 * Arial, Helvetica, sans-serif
 * -> Arial
 *
 * "Roboto", Arial, sans-serif
 * -> Roboto
 */

function extractPrimaryFontFamily(
    fontFamily
) {

    if (
        !fontFamily ||
        fontFamily.trim().length === 0
    ) {
        return null;
    }

    const firstFamily =
        fontFamily
            .split(",")[0]
            .trim();

    if (
        firstFamily.length === 0
    ) {
        return null;
    }

    return firstFamily
        .replace(/^["']|["']$/g, "")
        .trim();
}


/*
 * =============================================================
 * NORMALIZAÇÃO DA FAMÍLIA
 * =============================================================
 */

function normalizeFontFamily(
    family
) {

    return family
        .trim()
        .replace(/^["']|["']$/g, "")
        .toLowerCase();
}


/*
 * =============================================================
 * OBTENÇÃO DO SELETOR
 * =============================================================
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
                    CSS.escape(className)
            )
            .join(".")}`;
    }

    return element.tagName
        .toLowerCase();
}