globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A09 =
    function evaluateA09() {

        const interactiveElements =
            document.querySelectorAll(
                "a, button, input, select, textarea, [tabindex], [contenteditable='true'], [role='button'], [role='link'], [role='checkbox'], [role='radio'], [role='switch'], [role='tab'], [role='menuitem']"
            );

        const evaluatedElements = [];

        interactiveElements.forEach((element) => {

            const tagName =
                element.tagName.toLowerCase();

            const type =
                element.getAttribute("type");

            /*
             * Campos input do tipo hidden não
             * participam da navegação por teclado.
             */
            if (
                tagName === "input" &&
                type === "hidden"
            ) {
                return;
            }

            /*
             * Elementos desabilitados não precisam
             * participar da navegação por teclado.
             */
            if (element.disabled === true) {
                return;
            }

            /*
             * Elementos invisíveis não são considerados
             * na avaliação da navegação por teclado.
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

            evaluatedElements.push(element);
        });

        const total =
            evaluatedElements.length;

        /*
         * Caso não existam elementos interativos
         * para avaliação, o critério é considerado
         * adequado por não haver elementos que
         * necessitem de navegação por teclado.
         */
        if (total === 0) {

            return {
                id: "A09",
                category: "accessibility",
                name: "Navegação por teclado",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Nenhum elemento interativo foi identificado na página."
                ],

                elements: [],

                recommendation:
                    "Não há elementos interativos que necessitem de avaliação da navegação por teclado."
            };
        }

        let adequate = 0;

        const problematicElements = [];

        evaluatedElements.forEach((element) => {

            const tabIndex =
                element.getAttribute("tabindex");

            /*
             * tabindex="-1" remove o elemento da
             * navegação sequencial pelo teclado.
             *
             * O valor -1 pode ser utilizado de forma
             * apropriada em alguns contextos, mas,
             * para este critério, elementos interativos
             * identificados com tabindex negativo são
             * considerados pontos de atenção.
             */
            if (
                tabIndex !== null &&
                Number(tabIndex) < 0
            ) {

                problematicElements.push({
                    selector:
                        getElementSelector(element),

                    description:
                        "Elemento interativo com tabindex negativo, não participando da navegação sequencial por teclado."
                });

                return;
            }

            /*
             * tabindex positivo altera a ordem natural
             * de navegação e será tratado como problema
             * no critério A10.
             *
             * Portanto, aqui ele não reduz a nota do A09.
             */
            if (
                tabIndex !== null &&
                Number(tabIndex) > 0
            ) {

                adequate++;
                return;
            }

            /*
             * Verifica se o elemento possui comportamento
             * naturalmente focável ou se possui tabindex
             * igual a zero.
             */
            const naturallyFocusable =
                isNaturallyFocusable(element);

            const hasTabIndexZero =
                tabIndex !== null &&
                Number(tabIndex) === 0;

            if (
                naturallyFocusable ||
                hasTabIndexZero
            ) {

                adequate++;

            } else {

                problematicElements.push({
                    selector:
                        getElementSelector(element),

                    description:
                        "Elemento interativo identificado, mas sem condição adequada de foco por teclado."
                });
            }
        });

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
            id: "A09",
            category: "accessibility",
            name: "Navegação por teclado",
            score: score,
            classification: classification,
            evaluated: total,
            adequate: adequate,

            evidence: [
                `Elementos interativos avaliados: ${total}`,
                `Elementos com condição adequada de foco por teclado: ${adequate}`,
                `Elementos com possível problema de navegação por teclado: ${problematicElements.length}`
            ],

            elements:
                problematicElements,

            recommendation:
                problematicElements.length > 0
                    ? "Garanta que os elementos interativos possam receber foco e ser acessados pela navegação por teclado. Evite remover elementos interativos da ordem de foco sem necessidade."
                    : "Mantenha os elementos interativos acessíveis por teclado e preserve uma ordem de foco adequada."
        };
    };


function isNaturallyFocusable(element) {

    const tagName =
        element.tagName.toLowerCase();

    /*
     * Links são naturalmente focáveis quando
     * possuem um href.
     */
    if (
        tagName === "a"
    ) {
        return element.hasAttribute("href");
    }

    /*
     * Botões são naturalmente focáveis.
     */
    if (
        tagName === "button"
    ) {
        return true;
    }

    /*
     * Campos de formulário são naturalmente
     * focáveis quando não estão desabilitados.
     */
    if (
        tagName === "input" ||
        tagName === "select" ||
        tagName === "textarea"
    ) {
        return true;
    }

    /*
     * Elementos contenteditable podem receber foco
     * e participar da interação por teclado.
     */
    if (
        element.hasAttribute("contenteditable")
    ) {
        return (
            element.getAttribute(
                "contenteditable"
            ) !== "false"
        );
    }

    return false;
}


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