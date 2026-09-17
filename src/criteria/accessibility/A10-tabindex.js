globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A10 =
    function evaluateA10() {

        const elements =
            document.querySelectorAll(
                "[tabindex]"
            );

        const evaluatedElements = [];

        elements.forEach((element) => {

            const tabindex =
                element.getAttribute("tabindex");

            /*
             * Considera apenas valores numéricos
             * de tabindex.
             */
            if (
                tabindex === null ||
                tabindex.trim() === ""
            ) {
                return;
            }

            const value =
                Number(tabindex);

            if (
                Number.isNaN(value)
            ) {
                return;
            }

            /*
             * Elementos invisíveis não participam
             * da avaliação.
             */
            const style =
                window.getComputedStyle(element);

            if (
                style.display === "none" ||
                style.visibility === "hidden"
            ) {
                return;
            }

            if (
                parseFloat(style.opacity) === 0
            ) {
                return;
            }

            /*
             * tabindex negativo pode ser utilizado
             * para permitir foco programático e será
             * tratado pelo critério A09.
             */
            if (value < 0) {
                return;
            }

            evaluatedElements.push({
                element: element,
                value: value
            });
        });

        const total =
            evaluatedElements.length;

        /*
         * Caso não existam elementos com tabindex
         * numérico não negativo, não há ocorrência
         * a ser avaliada.
         */
        if (total === 0) {

            return {
                id: "A10",
                category: "accessibility",
                name: "Uso inadequado de tabindex",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Nenhum elemento com tabindex numérico não negativo foi identificado na página."
                ],

                elements: [],

                recommendation:
                    "Não há uso de tabindex que necessite de avaliação."
            };
        }

        let adequate = 0;

        const problematicElements = [];

        evaluatedElements.forEach((item) => {

            const element =
                item.element;

            const tabindex =
                item.value;

            /*
             * tabindex positivo altera a ordem natural
             * de navegação por teclado e é considerado
             * inadequado neste critério.
             */
            if (
                tabindex > 0
            ) {

                problematicElements.push({

                    selector:
                        getElementSelector(
                            element
                        ),

                    description:
                        `Elemento com tabindex="${tabindex}", alterando a ordem natural de navegação por teclado.`,

                    tabindex:
                        tabindex
                });

                return;
            }

            /*
             * tabindex="0" mantém o elemento na ordem
             * natural de navegação e é considerado adequado.
             */
            adequate++;
        });

        /*
         * A pontuação é proporcional à quantidade
         * de elementos avaliados sem uso inadequado.
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

        return {
            id: "A10",
            category: "accessibility",
            name: "Uso inadequado de tabindex",
            score: score,
            classification: classification,
            evaluated: total,
            adequate: adequate,

            evidence: [
                `Elementos com tabindex avaliados: ${total}`,
                `Elementos com tabindex adequado: ${adequate}`,
                `Elementos com tabindex positivo: ${problematicElements.length}`
            ],

            elements:
                problematicElements,

            recommendation:
                problematicElements.length > 0
                    ? "Evite valores positivos de tabindex, pois eles alteram a ordem natural de navegação pelo teclado. Prefira a ordem natural do documento ou tabindex=\"0\" quando necessário."
                    : "Mantenha o uso de tabindex sem valores positivos e preserve a ordem natural de navegação."
        };
    };


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
            .map((className) =>
                CSS.escape(className)
            )
            .join(".")}`;
    }

    return element.tagName.toLowerCase();
}