globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.U04 =
    function evaluateU04() {

        /*
         * Elementos considerados interativos:
         * - links
         * - buttons
         * - controles de formulário
         * - elementos com papéis interativos
         */

        const elements = document.querySelectorAll(
            'a[href], button, input, select, textarea, ' +
            '[role="button"], [role="link"], [role="checkbox"], ' +
            '[role="radio"], [role="switch"], [role="tab"], ' +
            '[role="menuitem"], [role="option"], [role="combobox"]'
        );

        const evaluatedElements = [];

        elements.forEach(element => {

            const type =
                element.getAttribute("type");

            if (type === "hidden") {
                return;
            }

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

            evaluatedElements.push(element);
        });

        const total =
            evaluatedElements.length;

        let score;

        if (total <= 20) {
            score = 10;
        } else if (total <= 40) {
            score = 8;
        } else if (total <= 60) {
            score = 6;
        } else if (total <= 100) {
            score = 4;
        } else {
            score = 2;
        }

        let classification;

        if (score >= 9) {
            classification = "Adequado";
        } else if (score >= 5) {
            classification = "Atenção";
        } else {
            classification = "Problema";
        }

        const problematicElements = [];

        /*
         * Elementos relacionados são apresentados
         * quando a quantidade ultrapassa o limite
         * considerado adequado.
         */
        if (total > 20) {

            evaluatedElements.forEach(element => {

                problematicElements.push({
                    selector:
                        getElementSelector(element),
                    description:
                        "Elemento interativo considerado na quantidade total da interface."
                });

            });
        }

        let recommendation;

        if (score === 10) {

            recommendation =
                "Mantenha uma quantidade de elementos interativos compatível com a complexidade da interface, evitando adicionar controles desnecessários.";

        } else {

            recommendation =
                "Avalie a necessidade dos elementos interativos presentes na interface e considere reduzir controles desnecessários ou agrupar ações relacionadas para diminuir a complexidade.";

        }

        return {
            id: "U04",
            category: "usability",
            name: "Quantidade de elementos interativos",
            score: score,
            classification: classification,
            evaluated: total,
            adequate: total <= 20 ? total : 20,

            evidence: [
                `Elementos interativos avaliados: ${total}`,
                `Faixa de complexidade aplicada: ${
                    total <= 20
                        ? "até 20 elementos"
                        : total <= 40
                            ? "21–40 elementos"
                            : total <= 60
                                ? "41–60 elementos"
                                : total <= 100
                                    ? "61–100 elementos"
                                    : "mais de 100 elementos"
                }`,
                `Pontuação: ${score}/10`
            ],

            elements:
                problematicElements,

            recommendation:
                recommendation
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
