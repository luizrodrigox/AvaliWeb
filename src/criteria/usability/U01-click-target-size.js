globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.U01 =
    function evaluateU01() {

        /*
         * =========================================================
         * CONFIGURAÇÃO
         * =========================================================
         *
         * Tamanho mínimo adotado pelo projeto:
         * 24 CSS px.
         *
         * O valor é aplicado tanto à largura quanto à altura
         * do alvo interativo.
         */

        const MIN_SIZE = 24;

        /*
         * =========================================================
         * ELEMENTOS INTERATIVOS
         * =========================================================
         */

        const elements =
            document.querySelectorAll(
                'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="tab"]'
            );

        const evaluatedElements = [];

        elements.forEach(element => {

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
             * Ignora elementos sem dimensões.
             */

            if (
                rect.width <= 0 ||
                rect.height <= 0
            ) {
                return;
            }

            evaluatedElements.push({
                element,
                rect
            });
        });

        const total =
            evaluatedElements.length;

        /*
         * =========================================================
         * NENHUM ELEMENTO
         * =========================================================
         */

        if (total === 0) {

            return {
                id: "U01",
                category: "usability",
                name: "Tamanho dos alvos clicáveis",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,
                evidence: [
                    "Nenhum alvo interativo visível foi identificado para avaliação."
                ],
                elements: [],
                recommendation:
                    "Não há alvos interativos visíveis que necessitem de avaliação."
            };
        }

        /*
         * =========================================================
         * AVALIAÇÃO
         * =========================================================
         */

        let adequate = 0;
        const problematicElements = [];

        evaluatedElements.forEach(item => {

            const width =
                item.rect.width;

            const height =
                item.rect.height;

            const isAdequate =
                width >= MIN_SIZE &&
                height >= MIN_SIZE;

            if (isAdequate) {

                adequate++;

            } else {

                const problems = [];

                if (width < MIN_SIZE) {
                    problems.push(
                        `largura inferior a ${MIN_SIZE} CSS px`
                    );
                }

                if (height < MIN_SIZE) {
                    problems.push(
                        `altura inferior a ${MIN_SIZE} CSS px`
                    );
                }

                problematicElements.push({
                    selector:
                        getElementSelector(
                            item.element
                        ),
                    description:
                        `Alvo com ${width.toFixed(1)} × ${height.toFixed(1)} CSS px; ${problems.join(" e ")}.`
                });
            }
        });

        /*
         * =========================================================
         * CÁLCULO DA PONTUAÇÃO
         * =========================================================
         */

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

        /*
         * =========================================================
         * RESULTADO
         * =========================================================
         */

        return {

            id: "U01",

            category:
                "usability",

            name:
                "Tamanho dos alvos clicáveis",

            score:
                score,

            classification:
                classification,

            evaluated:
                total,

            adequate:
                adequate,

            evidence: [
                `Alvos interativos avaliados: ${total}`,
                `Alvos com tamanho adequado: ${adequate}`,
                `Alvos com tamanho inferior ao mínimo: ${problematicElements.length}`,
                `Tamanho mínimo adotado: ${MIN_SIZE} CSS px`,
                `Pontuação: ${score}/10`
            ],

            elements:
                problematicElements,

            recommendation:
                problematicElements.length > 0
                    ? `Garanta que os alvos interativos possuam pelo menos ${MIN_SIZE} × ${MIN_SIZE} CSS px, evitando dificuldades de seleção e interação.`
                    : `Mantenha os alvos interativos com pelo menos ${MIN_SIZE} × ${MIN_SIZE} CSS px.`
        };
    };


/*
 * =============================================================
 * SELETOR DE ELEMENTOS
 * =============================================================
 */

function getElementSelector(element) {

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