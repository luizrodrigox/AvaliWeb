globalThis.AvaliWeb = globalThis.AvaliWeb || {};
globalThis.AvaliWebCriteria = globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.D04 = function evaluateD04() {
    /*
     * D04 — Espaçamento entre elementos
     *
     * Avalia relações espaciais entre elementos visuais da interface,
     * considerando:
     * - sobreposição;
     * - distância entre caixas;
     * - consistência básica de espaçamento entre elementos relacionados.
     *
     * Regra operacional do AvaliWeb:
     * uma relação é considerada adequada quando:
     * - os elementos não estão sobrepostos; e
     * - quando existe espaço entre eles, a distância mínima é de 8 CSS px.
     *
     * Observação:
     * o valor de 8 CSS px é um parâmetro operacional definido pelo
     * projeto para tornar a avaliação objetiva e reproduzível.
     */

    const MIN_SPACING = 8;

    const candidateSelector = [
        "header",
        "nav",
        "main",
        "section",
        "article",
        "aside",
        "footer",
        "form",
        "fieldset",
        "div",
        "ul",
        "ol",
        "li",
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "button",
        "a",
        "input",
        "select",
        "textarea",
        "img",
        "table",
        "figure",
        "label"
    ].join(",");

    const elements = Array.from(
        document.querySelectorAll(candidateSelector)
    );

    /*
     * Remove elementos que não possuem conteúdo visual relevante
     * ou que estão ocultos.
     */
    const evaluatedElements = elements.filter((element) => {
        const style = window.getComputedStyle(element);

        if (
            style.display === "none" ||
            style.visibility === "hidden" ||
            parseFloat(style.opacity) === 0
        ) {
            return false;
        }

        const rect = element.getBoundingClientRect();

        if (
            rect.width <= 0 ||
            rect.height <= 0
        ) {
            return false;
        }

        /*
         * Evita avaliar containers gigantes que apenas agrupam
         * praticamente toda a página.
         */
        if (
            rect.width >= window.innerWidth * 0.98 &&
            rect.height >= window.innerHeight * 0.98 &&
            !["header", "main", "footer"].includes(
                element.tagName.toLowerCase()
            )
        ) {
            return false;
        }

        return true;
    });

    /*
     * Remove elementos aninhados quando o elemento pai representa
     * praticamente a mesma área do filho.
     *
     * Isso evita que uma relação artificial entre um container e
     * seu próprio conteúdo seja contabilizada.
     */
    const filteredElements = evaluatedElements.filter(
        (element) => {
            let parent = element.parentElement;

            while (parent) {
                if (
                    evaluatedElements.includes(parent)
                ) {
                    const parentRect =
                        parent.getBoundingClientRect();

                    const elementRect =
                        element.getBoundingClientRect();

                    const parentArea =
                        parentRect.width *
                        parentRect.height;

                    const elementArea =
                        elementRect.width *
                        elementRect.height;

                    if (
                        parentArea > 0 &&
                        elementArea / parentArea > 0.90
                    ) {
                        return false;
                    }
                }

                parent = parent.parentElement;
            }

            return true;
        }
    );

    const relations = [];
    const problematicElements = [];

    /*
     * Verifica relações entre elementos próximos.
     *
     * A avaliação é feita somente quando existe possibilidade
     * de os elementos pertencerem à mesma região visual.
     */
    for (
        let i = 0;
        i < filteredElements.length;
        i++
    ) {
        const elementA = filteredElements[i];

        for (
            let j = i + 1;
            j < filteredElements.length;
            j++
        ) {
            const elementB = filteredElements[j];

            /*
             * Elementos ancestrais não são comparados entre si.
             */
            if (
                elementA.contains(elementB) ||
                elementB.contains(elementA)
            ) {
                continue;
            }

            const rectA =
                elementA.getBoundingClientRect();

            const rectB =
                elementB.getBoundingClientRect();

            /*
             * Calcula distância horizontal e vertical entre
             * as caixas dos elementos.
             *
             * Se houver sobreposição em um eixo, a distância
             * daquele eixo é considerada 0.
             */
            const horizontalDistance =
                Math.max(
                    0,
                    Math.max(
                        rectA.left - rectB.right,
                        rectB.left - rectA.right
                    )
                );

            const verticalDistance =
                Math.max(
                    0,
                    Math.max(
                        rectA.top - rectB.bottom,
                        rectB.top - rectA.bottom
                    )
                );

            const horizontalOverlap =
                rectA.left < rectB.right &&
                rectA.right > rectB.left;

            const verticalOverlap =
                rectA.top < rectB.bottom &&
                rectA.bottom > rectB.top;

            const overlapping =
                horizontalOverlap &&
                verticalOverlap;

            /*
             * Só consideramos uma relação quando os elementos
             * estão suficientemente próximos na interface.
             *
             * Isso evita comparar, por exemplo, um header com
             * um footer de uma página longa.
             */
            const proximityLimit = 300;

            const isNearby =
                horizontalDistance <= proximityLimit &&
                verticalDistance <= proximityLimit;

            if (!isNearby) {
                continue;
            }

            /*
             * Se houver sobreposição, a relação é inadequada.
             */
            if (overlapping) {
                relations.push({
                    elementA,
                    elementB,
                    distance: 0,
                    adequate: false,
                    reason: "sobreposição"
                });

                continue;
            }

            /*
             * Para elementos alinhados horizontalmente,
             * avaliamos a distância horizontal.
             *
             * Para elementos alinhados verticalmente,
             * avaliamos a distância vertical.
             */
            let distance;

            const verticallyAligned =
                rectA.bottom >= rectB.top &&
                rectB.bottom >= rectA.top;

            const horizontallyAligned =
                rectA.right >= rectB.left &&
                rectB.right >= rectA.left;

            if (verticallyAligned) {
                distance = horizontalDistance;
            } else if (horizontallyAligned) {
                distance = verticalDistance;
            } else {
                /*
                 * Elementos diagonalmente próximos.
                 * Utilizamos a menor distância entre os eixos.
                 */
                distance = Math.min(
                    horizontalDistance,
                    verticalDistance
                );
            }

            const adequate =
                distance >= MIN_SPACING;

            relations.push({
                elementA,
                elementB,
                distance,
                adequate,
                reason: adequate
                    ? "espaçamento adequado"
                    : "distância inferior ao mínimo"
            });
        }
    }

    /*
     * Caso não existam relações suficientes para avaliação.
     */
    if (relations.length === 0) {
        return {
            id: "D04",
            category: "design",
            name: "Espaçamento entre elementos",
            score: 10,
            classification: "Adequado",
            evaluated: 0,
            adequate: 0,
            evidence: [
                "Nenhuma relação espacial relevante foi identificada para avaliação.",
                `Distância mínima adotada: ${MIN_SPACING} CSS px`
            ],
            elements: [],
            recommendation:
                "Não foram identificadas relações espaciais suficientes para avaliação."
        };
    }

    /*
     * Identifica relações inadequadas.
     */
    const problematicRelations =
        relations.filter(
            (relation) => !relation.adequate
        );

    problematicRelations.forEach(
        (relation) => {
            problematicElements.push({
                selector: getElementSelector(
                    relation.elementA
                ),
                description:
                    `Relação com ${getElementSelector(
                        relation.elementB
                    )}: ${relation.reason}. Distância identificada: ${Math.round(
                        relation.distance
                    )} CSS px.`
            });

            problematicElements.push({
                selector: getElementSelector(
                    relation.elementB
                ),
                description:
                    `Relação com ${getElementSelector(
                        relation.elementA
                    )}: ${relation.reason}. Distância identificada: ${Math.round(
                        relation.distance
                    )} CSS px.`
            });
        }
    );

    /*
     * Remove duplicações de elementos afetados.
     */
    const uniqueElements =
        removeDuplicateElements(
            problematicElements
        );

    /*
     * Cálculo:
     *
     * (relações adequadas ÷ relações avaliadas) × 10
     */
    const adequateRelations =
        relations.filter(
            (relation) => relation.adequate
        ).length;

    const totalRelations =
        relations.length;

    const score = Number(
        (
            (adequateRelations /
                totalRelations) *
            10
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
        id: "D04",
        category: "design",
        name: "Espaçamento entre elementos",
        score: score,
        classification: classification,
        evaluated: totalRelations,
        adequate: adequateRelations,

        evidence: [
            `Relações espaciais avaliadas: ${totalRelations}`,
            `Relações adequadas: ${adequateRelations}`,
            `Relações com espaçamento inadequado: ${problematicRelations.length}`,
            `Distância mínima adotada: ${MIN_SPACING} CSS px`,
            `Pontuação: ${score}/10`
        ],

        elements: uniqueElements,

        recommendation:
            problematicRelations.length > 0
                ? `Ajuste o espaçamento entre elementos relacionados, evitando sobreposição e mantendo pelo menos ${MIN_SPACING} CSS px de separação quando aplicável.`
                : "Mantenha espaçamentos consistentes entre elementos relacionados e evite sobreposição ou proximidade excessiva."
    };
};

/*
 * ============================================================
 * FUNÇÕES AUXILIARES
 * ============================================================
 */

function removeDuplicateElements(elements) {
    const unique = [];
    const seen = new Set();

    elements.forEach((item) => {
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
            .map((className) =>
                CSS.escape(className)
            )
            .join(".")}`;
    }

    return element.tagName.toLowerCase();
}