
globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.U05 =
    function evaluateU05() {

        /*
         * Textos avaliados:
         * - links
         * - botões
         *
         * São considerados apenas elementos
         * visíveis e com conteúdo textual.
         */

        const elements = document.querySelectorAll(
            'a[href], button'
        );

        const evaluatedElements = [];
        const problematicElements = [];

        /*
         * Termos genéricos definidos pelo critério.
         */
        const genericTexts = [
            "clique aqui",
            "saiba mais",
            "leia mais"
        ];

        elements.forEach(element => {

            const style =
                window.getComputedStyle(element);

            if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                parseFloat(style.opacity) === 0
            ) {
                return;
            }

            const rect =
                element.getBoundingClientRect();

            if (
                rect.width <= 0 ||
                rect.height <= 0
            ) {
                return;
            }

            const text =
                element.textContent
                    .trim()
                    .replace(/\s+/g, " ");

            /*
             * Elementos sem texto não entram
             * na avaliação deste critério.
             */
            if (text.length === 0) {
                return;
            }

            evaluatedElements.push(element);

            const normalizedText =
                text.toLowerCase();

            /*
             * Verifica correspondência exata
             * com os textos genéricos definidos.
             */
            if (
                genericTexts.includes(
                    normalizedText
                )
            ) {

                problematicElements.push({
                    selector:
                        getElementSelector(element),

                    description:
                        `Texto pouco descritivo identificado: "${text}".`
                });
            }
        });

        const total =
            evaluatedElements.length;

        const occurrences =
            problematicElements.length;

        /*
         * Quando não existem textos avaliáveis,
         * o critério não possui ocorrências.
         */
        if (total === 0) {

            return {
                id: "U05",
                category: "usability",
                name: "Textos pouco descritivos",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Nenhum link ou botão com texto visível foi identificado para avaliação.",
                    "Não foram identificados textos pouco descritivos."
                ],

                elements: [],

                recommendation:
                    "Utilize textos descritivos nos elementos interativos, identificando claramente seu destino ou ação."
            };
        }

        /*
         * Redução proporcional às ocorrências.
         */
        const adequate =
            total - occurrences;

        const score =
            Number(
                (
                    (adequate / total) * 10
                ).toFixed(1)
            );

        let classification;

        if (score >= 9.0) {
            classification = "Adequado";
        } else if (score >= 5.0) {
            classification = "Atenção";
        } else {
            classification = "Problema";
        }

        return {
            id: "U05",
            category: "usability",
            name: "Textos pouco descritivos",
            score: score,
            classification: classification,
            evaluated: total,
            adequate: adequate,

            evidence: [
                `Textos interativos avaliados: ${total}`,
                `Textos pouco descritivos identificados: ${occurrences}`,
                `Textos considerados adequados: ${adequate}`,
                `Pontuação: ${score}/10`
            ],

            elements:
                problematicElements,

            recommendation:
                occurrences > 0
                    ? "Substitua textos genéricos como \"Clique aqui\", \"Saiba mais\" e \"Leia mais\" por descrições que identifiquem claramente o destino ou a ação do elemento."
                    : "Mantenha textos descritivos que permitam identificar claramente o destino ou a ação de cada elemento interativo."
        };
    };


function getElementSelector(element) {

    if (element.id) {
        return `#${CSS.escape(element.id)}`;
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
            .map(className =>
                CSS.escape(className)
            )
            .join(".")}`;
    }

    return element.tagName.toLowerCase();
}