globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.R01 =
    function evaluateR01() {

        /*
         * =========================================================
         * R01 — OVERFLOW HORIZONTAL
         * =========================================================
         *
         * Verifica se elementos visíveis da página ultrapassam
         * horizontalmente a largura disponível da viewport.
         *
         * O objetivo é identificar conteúdo que possa exigir
         * rolagem horizontal para ser visualizado.
         *
         * O critério não avalia:
         * - meta viewport;
         * - tamanho de fontes;
         * - espaçamento entre elementos;
         * - sobreposição de componentes.
         */

        const viewportWidth =
            document.documentElement.clientWidth;

        const elements =
            document.querySelectorAll(
                "body *"
            );

        const problematicElements = [];

        /*
         * Pequena tolerância para diferenças de arredondamento
         * entre valores calculados pelo navegador.
         */
        const tolerance = 2;

        elements.forEach(
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

                const rect =
                    element.getBoundingClientRect();

                /*
                 * Ignora elementos sem dimensão.
                 */
                if (
                    rect.width <= 0 ||
                    rect.height <= 0
                ) {
                    return;
                }

                /*
                 * Ignora elementos completamente fora da
                 * área vertical atualmente disponível.
                 */
                if (
                    rect.bottom <= 0 ||
                    rect.top >= window.innerHeight
                ) {
                    return;
                }

                /*
                 * Verifica se o elemento ultrapassa o limite
                 * horizontal da viewport.
                 */
                const exceedsLeft =
                    rect.left < -tolerance;

                const exceedsRight =
                    rect.right >
                    viewportWidth + tolerance;

                if (
                    !exceedsLeft &&
                    !exceedsRight
                ) {
                    return;
                }

                /*
                 * Ignora elementos que estão dentro de um
                 * ancestral que possui rolagem horizontal
                 * intencionalmente configurada.
                 *
                 * Nesse caso, o overflow pode pertencer ao
                 * próprio componente e não representar overflow
                 * horizontal indevido da página.
                 */
                if (
                    hasHorizontalScrollingAncestor(
                        element
                    )
                ) {
                    return;
                }

                const problems = [];

                if (exceedsLeft) {
                    problems.push(
                        "ultrapassa o limite esquerdo da viewport"
                    );
                }

                if (exceedsRight) {
                    problems.push(
                        "ultrapassa o limite direito da viewport"
                    );
                }

                problematicElements.push({

                    selector:
                        getElementSelector(
                            element
                        ),

                    description:
                        `Elemento identificado com overflow horizontal: ${problems.join(
                            " e "
                        )}.`
                });
            }
        );

        /*
         * Remove possíveis duplicações.
         */
        const uniqueProblematicElements =
            removeDuplicateElements(
                problematicElements
            );

        /*
         * =========================================================
         * CÁLCULO DA PONTUAÇÃO
         * =========================================================
         *
         * Regra definida:
         *
         * 10 sem ocorrências;
         * redução conforme ocorrências.
         *
         * Para manter a avaliação proporcional ao número de
         * elementos afetados, utiliza-se:
         *
         * (elementos sem overflow / elementos avaliados) × 10
         */

        const evaluatedElements =
            countEvaluableElements(
                elements
            );

        const problematicCount =
            uniqueProblematicElements.length;

        const adequate =
            Math.max(
                0,
                evaluatedElements -
                problematicCount
            );

        let score = 10;

        if (
            evaluatedElements > 0
        ) {
            score =
                Number(
                    (
                        (
                            adequate /
                            evaluatedElements
                        ) *
                        10
                    ).toFixed(1)
                );
        }

        /*
         * Garante que a nota fique entre 0 e 10.
         */
        score =
            Math.max(
                0,
                Math.min(
                    10,
                    score
                )
            );

        let classification;

        if (
            score >= 9.0
        ) {

            classification =
                "Adequado";

        } else if (
            score >= 5.0
        ) {

            classification =
                "Atenção";

        } else {

            classification =
                "Problema";
        }

        /*
         * =========================================================
         * RESULTADO
         * =========================================================
         */

        return {

            id: "R01",

            category:
                "responsive",

            name:
                "Overflow horizontal",

            score:
                score,

            classification:
                classification,

            evaluated:
                evaluatedElements,

            adequate:
                adequate,

            evidence: [

                `Elementos avaliados: ${evaluatedElements}`,

                `Elementos com overflow horizontal: ${problematicCount}`,

                `Elementos sem overflow horizontal: ${adequate}`,

                `Largura disponível da viewport: ${viewportWidth} CSS px`,

                `Pontuação: ${score}/10`
            ],

            elements:
                uniqueProblematicElements,

            recommendation:
                problematicCount > 0
                    ? "Ajuste os elementos que ultrapassam horizontalmente a largura disponível da viewport. Utilize layouts fluidos, dimensões relativas e técnicas responsivas para evitar a necessidade de rolagem horizontal para acessar o conteúdo."
                    : "Mantenha o conteúdo dentro da largura disponível da viewport, utilizando técnicas responsivas para diferentes dimensões de tela."
        };
    };


/*
 * =============================================================
 * CONTA ELEMENTOS AVALIÁVEIS
 * =============================================================
 */

function countEvaluableElements(
    elements
) {

    let count = 0;

    elements.forEach(
        (element) => {

            const style =
                window.getComputedStyle(
                    element
                );

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

            if (
                rect.bottom <= 0 ||
                rect.top >= window.innerHeight
            ) {
                return;
            }

            if (
                hasHorizontalScrollingAncestor(
                    element
                )
            ) {
                return;
            }

            count++;
        }
    );

    return count;
}


/*
 * =============================================================
 * VERIFICA ANCESTRAL COM ROLAGEM HORIZONTAL
 * =============================================================
 */

function hasHorizontalScrollingAncestor(
    element
) {

    let parent =
        element.parentElement;

    while (
        parent &&
        parent !== document.body
    ) {

        const style =
            window.getComputedStyle(
                parent
            );

        const scrollable =
            style.overflowX === "auto" ||
            style.overflowX === "scroll";

        if (
            scrollable &&
            parent.scrollWidth >
                parent.clientWidth + 2
        ) {
            return true;
        }

        parent =
            parent.parentElement;
    }

    return false;
}


/*
 * =============================================================
 * REMOVE DUPLICAÇÕES
 * =============================================================
 */

function removeDuplicateElements(
    elements
) {

    const unique = [];

    const seen =
        new Set();

    elements.forEach(
        (item) => {

            const key =
                `${item.selector}|${item.description}`;

            if (
                seen.has(key)
            ) {
                return;
            }

            seen.add(key);

            unique.push(
                item
            );
        }
    );

    return unique;
}


/*
 * =============================================================
 * SELETOR DO ELEMENTO
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