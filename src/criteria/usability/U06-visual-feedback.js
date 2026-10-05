globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.U06 =
    function evaluateU06() {

        /*
         * Elementos interativos avaliados.
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

        /*
         * Não há elementos interativos para avaliar.
         */
        if (evaluatedElements.length === 0) {

            return {
                id: "U06",
                category: "usability",
                name: "Feedback visual",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Nenhum elemento interativo visível foi identificado para avaliação."
                ],

                elements: [],

                recommendation:
                    "Mantenha estados visuais de interação nos elementos interativos da interface."
            };
        }

        /*
         * Coleta as regras CSS da página.
         */
        const styleSheets =
            Array.from(document.styleSheets);

        const stateRules = [];

        styleSheets.forEach(sheet => {

            let rules;

            try {
                rules = sheet.cssRules;
            } catch (error) {
                /*
                 * Folhas externas que não permitem acesso
                 * às regras são ignoradas.
                 */
                return;
            }

            if (!rules) {
                return;
            }

            collectStateRules(
                rules,
                stateRules
            );
        });

        let adequate = 0;

        const problematicElements = [];

        evaluatedElements.forEach(element => {

            const states =
                getElementStates(
                    element,
                    stateRules
                );

            const hasFeedback =
                states.hover ||
                states.focus ||
                states.active;

            if (hasFeedback) {

                adequate++;

            } else {

                problematicElements.push({
                    selector:
                        getElementSelector(element),

                    description:
                        "Nenhuma regra visual de hover, focus ou active aplicável foi identificada para este elemento."
                });
            }
        });

        const total =
            evaluatedElements.length;

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
         * Conta os elementos que possuem cada estado.
         */
        let hoverCount = 0;
        let focusCount = 0;
        let activeCount = 0;

        evaluatedElements.forEach(element => {

            const states =
                getElementStates(
                    element,
                    stateRules
                );

            if (states.hover) {
                hoverCount++;
            }

            if (states.focus) {
                focusCount++;
            }

            if (states.active) {
                activeCount++;
            }
        });

        return {
            id: "U06",
            category: "usability",
            name: "Feedback visual",
            score: score,
            classification: classification,
            evaluated: total,
            adequate: adequate,

            evidence: [
                `Elementos interativos avaliados: ${total}`,
                `Elementos com feedback visual identificado: ${adequate}`,
                `Elementos sem feedback visual identificado: ${problematicElements.length}`,
                `Elementos com estado hover identificado: ${hoverCount}`,
                `Elementos com estado focus identificado: ${focusCount}`,
                `Elementos com estado active identificado: ${activeCount}`,
                `Pontuação: ${score}/10`
            ],

            elements:
                problematicElements,

            recommendation:
                problematicElements.length > 0
                    ? "Defina estados visuais de interação, como hover, focus ou active, para fornecer feedback ao usuário durante a interação com os elementos."
                    : "Mantenha estados visuais de interação consistentes nos elementos interativos da interface."
        };
    };


/*
 * Percorre as regras CSS, incluindo regras
 * dentro de media queries.
 */
function collectStateRules(
    rules,
    stateRules
) {

    Array.from(rules).forEach(rule => {

        /*
         * CSSStyleRule
         */
        if (
            rule.selectorText &&
            rule.style
        ) {

            const selectorText =
                rule.selectorText;

            const lowerSelector =
                selectorText.toLowerCase();

            const hasHover =
                lowerSelector.includes(":hover");

            const hasFocus =
                lowerSelector.includes(":focus");

            const hasActive =
                lowerSelector.includes(":active");

            if (
                hasHover ||
                hasFocus ||
                hasActive
            ) {

                stateRules.push({
                    selectorText:
                        selectorText,

                    hasHover:
                        hasHover,

                    hasFocus:
                        hasFocus,

                    hasActive:
                        hasActive
                });
            }
        }

        /*
         * CSSMediaRule / outras regras que
         * possuam cssRules.
         */
        if (rule.cssRules) {

            collectStateRules(
                rule.cssRules,
                stateRules
            );
        }
    });
}


/*
 * Verifica quais estados possuem uma regra
 * aplicável ao elemento.
 */
function getElementStates(
    element,
    stateRules
) {

    const states = {
        hover: false,
        focus: false,
        active: false
    };

    stateRules.forEach(rule => {

        const selectors =
            rule.selectorText
                .split(",");

        selectors.forEach(selector => {

            const cleanSelector =
                selector.trim();

            /*
             * Remove o pseudoestado para testar
             * se o seletor base corresponde ao elemento.
             */
            const baseSelector =
                cleanSelector
                    .replace(
                        /:(hover|focus|active)/gi,
                        ""
                    )
                    .trim();

            if (!baseSelector) {
                return;
            }

            try {

                if (
                    element.matches(
                        baseSelector
                    )
                ) {

                    if (rule.hasHover) {
                        states.hover = true;
                    }

                    if (rule.hasFocus) {
                        states.focus = true;
                    }

                    if (rule.hasActive) {
                        states.active = true;
                    }
                }

            } catch (error) {
                /*
                 * Seletores complexos que não possam
                 * ser avaliados são ignorados.
                 */
            }
        });
    });

    return states;
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
            .map(className =>
                CSS.escape(className)
            )
            .join(".")}`;
    }

    return element.tagName.toLowerCase();
}