globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.U02 =
    function evaluateU02() {

        /*
         * Distância mínima adotada pelo sistema.
         *
         * O valor de 24 CSS px foi adotado como referência
         * operacional para avaliar o espaçamento entre alvos
         * interativos, mantendo coerência com o WCAG 2.2.
         */
        const MIN_DISTANCE = 24;

        /*
         * Identifica os elementos interativos avaliáveis.
         */
        const elements = document.querySelectorAll(
            "a[href], button, input, select, textarea, " +
            "[role='button'], [role='link'], [role='checkbox'], " +
            "[role='radio'], [role='switch'], [role='tab']"
        );

        const interactiveElements = [];

        elements.forEach(element => {

            const type =
                element.getAttribute("type");

            /*
             * Campos hidden não são alvos interativos visíveis.
             */
            if (type === "hidden") {
                return;
            }

            const style =
                window.getComputedStyle(element);

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

            const rect =
                element.getBoundingClientRect();

            /*
             * Elementos sem área visível não participam
             * da avaliação.
             */
            if (
                rect.width <= 0 ||
                rect.height <= 0
            ) {
                return;
            }

            interactiveElements.push(element);
        });

        /*
         * Menos de dois alvos não permite estabelecer
         * uma relação de distância.
         */
        if (interactiveElements.length < 2) {

            return {
                id: "U02",
                category: "usability",
                name: "Distância entre alvos",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,
                evidence: [
                    `Alvos interativos identificados: ${interactiveElements.length}`,
                    "Não existem relações suficientes entre alvos para avaliar a distância.",
                    "O critério não identificou uma relação de proximidade inadequada."
                ],
                elements: [],
                recommendation:
                    "Mantenha espaçamento suficiente entre elementos interativos para facilitar sua seleção."
            };
        }

        const relations = [];
        let adequate = 0;

        /*
         * Avalia cada par de elementos interativos.
         *
         * A distância considerada é a menor distância entre
         * as bordas dos dois elementos.
         */
        for (
            let i = 0;
            i < interactiveElements.length;
            i++
        ) {

            const elementA =
                interactiveElements[i];

            const rectA =
                elementA.getBoundingClientRect();

            for (
                let j = i + 1;
                j < interactiveElements.length;
                j++
            ) {

                const elementB =
                    interactiveElements[j];

                const rectB =
                    elementB.getBoundingClientRect();

                /*
                 * Distância horizontal entre as bordas.
                 *
                 * Se houver sobreposição horizontal,
                 * a distância é considerada zero.
                 */
                const horizontalDistance =
                    Math.max(
                        rectA.left - rectB.right,
                        rectB.left - rectA.right,
                        0
                    );

                /*
                 * Distância vertical entre as bordas.
                 *
                 * Se houver sobreposição vertical,
                 * a distância é considerada zero.
                 */
                const verticalDistance =
                    Math.max(
                        rectA.top - rectB.bottom,
                        rectB.top - rectA.bottom,
                        0
                    );

                /*
                 * Distância mínima entre os elementos.
                 *
                 * Quando estão lado a lado, considera a distância
                 * horizontal.
                 *
                 * Quando estão um acima do outro, considera
                 * a distância vertical.
                 *
                 * Quando estão diagonalmente separados, utiliza
                 * a distância geométrica entre os retângulos.
                 */
                const distance = Math.sqrt(
                    Math.pow(
                        horizontalDistance,
                        2
                    ) +
                    Math.pow(
                        verticalDistance,
                        2
                    )
                );

                const isAdequate =
                    distance >= MIN_DISTANCE;

                if (isAdequate) {
                    adequate++;
                }

                relations.push({
                    elementA,
                    elementB,
                    distance,
                    adequate: isAdequate
                });
            }
        }

        const evaluated =
            relations.length;

        /*
         * Fórmula definida na tabela de critérios:
         *
         * (relações adequadas ÷ relações avaliadas) × 10
         */
        const score =
            evaluated > 0
                ? Number(
                    (
                        (adequate / evaluated) *
                        10
                    ).toFixed(1)
                )
                : 10;

        let classification;

        if (score >= 9.0) {
            classification = "Adequado";
        } else if (score >= 5.0) {
            classification = "Atenção";
        } else {
            classification = "Problema";
        }

        /*
         * Registra apenas as relações que apresentam
         * distância inferior ao limite adotado.
         */
        const problematicElements = [];

        relations.forEach(relation => {

            if (relation.adequate) {
                return;
            }

            problematicElements.push({
                selector:
                    getU02ElementSelector(
                        relation.elementA
                    ),

                description:
                    `Distância de ${relation.distance.toFixed(1)} px ` +
                    `em relação ao elemento ` +
                    `${getU02ElementSelector(
                        relation.elementB
                    )}. ` +
                    `O mínimo adotado é de ${MIN_DISTANCE} px.`
            });

            problematicElements.push({
                selector:
                    getU02ElementSelector(
                        relation.elementB
                    ),

                description:
                    `Distância de ${relation.distance.toFixed(1)} px ` +
                    `em relação ao elemento ` +
                    `${getU02ElementSelector(
                        relation.elementA
                    )}. ` +
                    `O mínimo adotado é de ${MIN_DISTANCE} px.`
            });
        });

        /*
         * Remove elementos duplicados.
         */
        const uniqueElements =
            removeDuplicateU02Elements(
                problematicElements
            );

        return {
            id: "U02",
            category: "usability",
            name: "Distância entre alvos",
            score: score,
            classification: classification,

            /*
             * Para U02, "avaliado" representa o número
             * de relações entre os alvos.
             */
            evaluated: evaluated,

            adequate: adequate,

            evidence: [
                `Alvos interativos avaliados: ${interactiveElements.length}`,
                `Relações entre alvos avaliadas: ${evaluated}`,
                `Relações adequadas: ${adequate}`,
                `Relações com distância inferior ao mínimo: ${evaluated - adequate}`,
                `Distância mínima adotada: ${MIN_DISTANCE} CSS px`,
                `Pontuação: ${score}/10`
            ],

            elements:
                uniqueElements,

            recommendation:
                uniqueElements.length > 0
                    ? `Aumente o espaçamento entre alvos interativos que estejam a menos de ${MIN_DISTANCE} CSS px de distância, evitando dificuldades de seleção e cliques acidentais.`
                    : `Mantenha pelo menos ${MIN_DISTANCE} CSS px de espaçamento entre alvos interativos próximos para facilitar sua seleção.`
        };
    };


/*
 * =========================================================
 * SELETOR DE ELEMENTOS
 * =========================================================
 */

function getU02ElementSelector(element) {

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
            .map(className =>
                CSS.escape(className)
            )
            .join(".")}`;
    }

    return element.tagName.toLowerCase();
}


/*
 * =========================================================
 * REMOÇÃO DE DUPLICADOS
 * =========================================================
 */

function removeDuplicateU02Elements(
    elements
) {

    const unique = [];
    const seen = new Set();

    elements.forEach(item => {

        const key =
            `${item.selector}|${item.description}`;

        if (seen.has(key)) {
            return;
        }

        seen.add(key);
        unique.push(item);
    });

    return unique;
}