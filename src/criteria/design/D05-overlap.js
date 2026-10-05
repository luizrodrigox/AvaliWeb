globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.D05 =
    function evaluateD05() {

        /*
         * =========================================================
         * D05 — SOBREPOSIÇÃO DE COMPONENTES
         * =========================================================
         *
         * Verifica se elementos visíveis e relevantes da interface
         * ocupam regiões visuais sobrepostas de maneira potencialmente
         * inadequada.
         *
         * O critério não considera:
         * - elementos invisíveis;
         * - elementos fora da área visual;
         * - relação pai/filho;
         * - elementos que possuem sobreposição intencional
         *   identificável pela estrutura da interface.
         *
         * A pontuação parte de 10 e é reduzida proporcionalmente
         * conforme a quantidade de sobreposições identificadas.
         */

        const elements = document.querySelectorAll(
            "button, a, input, select, textarea, " +
            "img, video, iframe, nav, header, footer, " +
            "main, aside, section, article, " +
            "[role='button'], [role='dialog'], " +
            "[role='menu'], [role='tooltip'], " +
            "[role='tab'], [role='checkbox'], " +
            "[role='radio'], [class], [id]"
        );

        const evaluatedElements = [];

        elements.forEach((element) => {

            /*
             * Ignora elementos que não fazem parte da apresentação
             * visual atual.
             */
            const style =
                window.getComputedStyle(element);

            if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                parseFloat(style.opacity) === 0
            ) {
                return;
            }

            /*
             * Ignora elementos que não possuem dimensões visíveis.
             */
            const rect =
                element.getBoundingClientRect();

            if (
                rect.width <= 0 ||
                rect.height <= 0
            ) {
                return;
            }

            /*
             * Ignora elementos completamente fora da área visível.
             */
            if (
                rect.right <= 0 ||
                rect.bottom <= 0 ||
                rect.left >= window.innerWidth ||
                rect.top >= window.innerHeight
            ) {
                return;
            }

            evaluatedElements.push({
                element: element,
                rect: rect
            });
        });

        /*
         * =========================================================
         * IDENTIFICAÇÃO DAS SOBREPOSIÇÕES
         * =========================================================
         */

        const overlapPairs = [];

        for (
            let i = 0;
            i < evaluatedElements.length;
            i++
        ) {

            const first =
                evaluatedElements[i];

            for (
                let j = i + 1;
                j < evaluatedElements.length;
                j++
            ) {

                const second =
                    evaluatedElements[j];

                /*
                 * Não avalia elementos que possuem relação
                 * hierárquica direta.
                 *
                 * Isso evita classificar como problema situações
                 * normais, como:
                 *
                 * <button>
                 *     <span>Texto</span>
                 * </button>
                 */
                if (
                    first.element.contains(
                        second.element
                    ) ||
                    second.element.contains(
                        first.element
                    )
                ) {
                    continue;
                }

                /*
                 * Verifica interseção real entre os retângulos.
                 */
                const overlaps =
                    first.rect.left <
                        second.rect.right &&
                    first.rect.right >
                        second.rect.left &&
                    first.rect.top <
                        second.rect.bottom &&
                    first.rect.bottom >
                        second.rect.top;

                if (!overlaps) {
                    continue;
                }

                /*
                 * Calcula a área aproximada da interseção.
                 */
                const overlapWidth =
                    Math.min(
                        first.rect.right,
                        second.rect.right
                    ) -
                    Math.max(
                        first.rect.left,
                        second.rect.left
                    );

                const overlapHeight =
                    Math.min(
                        first.rect.bottom,
                        second.rect.bottom
                    ) -
                    Math.max(
                        first.rect.top,
                        second.rect.top
                    );

                const overlapArea =
                    overlapWidth *
                    overlapHeight;

                if (overlapArea <= 0) {
                    continue;
                }

                /*
                 * Identifica sobreposição intencional em alguns
                 * casos comuns de interface.
                 */
                if (
                    isLikelyIntentionalOverlap(
                        first.element,
                        second.element
                    )
                ) {
                    continue;
                }

                overlapPairs.push({
                    first: first.element,
                    second: second.element,
                    area: overlapArea
                });
            }
        }

        /*
         * =========================================================
         * REMOVE RELAÇÕES DUPLICADAS
         * =========================================================
         */

        const uniquePairs =
            removeDuplicateOverlapPairs(
                overlapPairs
            );

        /*
         * =========================================================
         * CÁLCULO DA PONTUAÇÃO
         * =========================================================
         *
         * Conforme a tabela:
         *
         * 10 sem ocorrências;
         * redução proporcional às ocorrências.
         *
         * Para manter a escala limitada a 0–10, cada ocorrência
         * representa uma fração do total de relações avaliadas.
         */

        const totalEvaluated =
            evaluatedElements.length;

        const totalPossibleRelations =
            totalEvaluated > 1
                ? (
                    totalEvaluated *
                    (totalEvaluated - 1)
                ) / 2
                : 0;

        const problematicRelations =
            uniquePairs.length;

        let score = 10;

        if (
            totalPossibleRelations > 0 &&
            problematicRelations > 0
        ) {

            score =
                Number(
                    (
                        (
                            (
                                totalPossibleRelations -
                                problematicRelations
                            ) /
                            totalPossibleRelations
                        ) *
                        10
                    ).toFixed(1)
                );
        }

        /*
         * Garante que a nota permaneça entre 0 e 10.
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
         * ELEMENTOS AFETADOS
         * =========================================================
         */

        const problematicElements =
            [];

        uniquePairs.forEach(
            (pair) => {

                problematicElements.push({

                    selector:
                        getElementSelector(
                            pair.first
                        ),

                    description:
                        "Elemento identificado em região visual sobreposta a outro componente."
                });

                problematicElements.push({

                    selector:
                        getElementSelector(
                            pair.second
                        ),

                    description:
                        "Elemento identificado em região visual sobreposta a outro componente."
                });
            }
        );

        const uniqueProblematicElements =
            removeDuplicateElements(
                problematicElements
            );

        /*
         * =========================================================
         * RESULTADO FINAL
         * =========================================================
         */

        return {

            id: "D05",

            category:
                "design",

            name:
                "Sobreposição de componentes",

            score:
                score,

            classification:
                classification,

            evaluated:
                totalPossibleRelations,

            adequate:
                Math.max(
                    0,
                    totalPossibleRelations -
                    problematicRelations
                ),

            evidence: [

                `Elementos visíveis avaliados: ${totalEvaluated}`,

                `Relações entre elementos avaliadas: ${totalPossibleRelations}`,

                `Relações com possível sobreposição inadequada: ${problematicRelations}`,

                `Relações sem sobreposição inadequada: ${Math.max(
                    0,
                    totalPossibleRelations -
                    problematicRelations
                )}`,

                `Pontuação: ${score}/10`
            ],

            elements:
                uniqueProblematicElements,

            recommendation:
                problematicRelations > 0
                    ? "Evite sobreposições inadequadas entre componentes da interface. Ajuste posicionamento, dimensões, margens ou camadas dos elementos para preservar a organização visual e evitar que componentes encubram ou dificultem a utilização de outros elementos."
                    : "Mantenha os componentes visualmente organizados, evitando sobreposições inadequadas que possam prejudicar a compreensão ou utilização da interface."
        };
    };


/*
 * =============================================================
 * VERIFICA SOBREPOSIÇÃO PROVAVELMENTE INTENCIONAL
 * =============================================================
 */

function isLikelyIntentionalOverlap(
    first,
    second
) {

    const firstStyle =
        window.getComputedStyle(
            first
        );

    const secondStyle =
        window.getComputedStyle(
            second
        );

    /*
     * Elementos posicionados de forma fixa ou absoluta podem
     * representar componentes sobrepostos intencionalmente,
     * como menus, modais, tooltips e elementos flutuantes.
     */
    const firstPosition =
        firstStyle.position;

    const secondPosition =
        secondStyle.position;

    const floatingPositions = [
        "fixed",
        "sticky"
    ];

    /*
     * Dialogs e tooltips normalmente aparecem sobre o conteúdo
     * principal de forma intencional.
     */
    const firstRole =
        first.getAttribute("role");

    const secondRole =
        second.getAttribute("role");

    const intentionalRoles = [
        "dialog",
        "menu",
        "tooltip",
        "listbox"
    ];

    if (
        intentionalRoles.includes(
            firstRole
        ) ||
        intentionalRoles.includes(
            secondRole
        )
    ) {
        return true;
    }

    /*
     * Elementos fixos/sticky podem representar componentes
     * flutuantes da interface.
     */
    if (
        floatingPositions.includes(
            firstPosition
        ) &&
        floatingPositions.includes(
            secondPosition
        )
    ) {
        return true;
    }

    return false;
}


/*
 * =============================================================
 * REMOVE DUPLICAÇÃO DAS RELAÇÕES
 * =============================================================
 */

function removeDuplicateOverlapPairs(
    pairs
) {

    const unique = [];
    const seen =
        new Set();

    pairs.forEach(
        (pair) => {

            const first =
                getElementSelector(
                    pair.first
                );

            const second =
                getElementSelector(
                    pair.second
                );

            const key =
                [first, second]
                    .sort()
                    .join("|");

            if (
                seen.has(key)
            ) {
                return;
            }

            seen.add(key);

            unique.push(
                pair
            );
        }
    );

    return unique;
}


/*
 * =============================================================
 * REMOVE ELEMENTOS DUPLICADOS
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