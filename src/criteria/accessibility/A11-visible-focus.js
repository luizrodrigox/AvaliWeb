globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A11 =
    function evaluateA11() {

        const focusableElements =
            document.querySelectorAll(
                "a[href], button, input, select, textarea, [tabindex], [contenteditable='true'], [role='button'], [role='link'], [role='checkbox'], [role='radio'], [role='switch'], [role='tab'], [role='menuitem']"
            );

        const evaluatedElements = [];

        focusableElements.forEach((element) => {

            const tagName =
                element.tagName.toLowerCase();

            const type =
                element.getAttribute("type");

            /*
             * Inputs do tipo hidden não recebem foco
             * durante a navegação normal por teclado.
             */
            if (
                tagName === "input" &&
                type === "hidden"
            ) {
                return;
            }

            /*
             * Elementos desabilitados não participam
             * da navegação por teclado.
             */
            if (
                element.disabled === true
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
             * Verifica se o elemento possui condição
             * objetiva para receber foco.
             */
            const tabIndex =
                element.getAttribute("tabindex");

            const naturallyFocusable =
                isNaturallyFocusable(element);

            const hasTabIndex =
                tabIndex !== null &&
                Number(tabIndex) >= 0;

            if (
                naturallyFocusable ||
                hasTabIndex
            ) {
                evaluatedElements.push(element);
            }
        });

        const total =
            evaluatedElements.length;

        /*
         * Não havendo elementos focáveis,
         * não existe foco visual a ser avaliado.
         */
        if (total === 0) {

            return {
                id: "A11",
                category: "accessibility",
                name: "Foco visível",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Nenhum elemento focável foi identificado na página."
                ],

                elements: [],

                recommendation:
                    "Não há elementos focáveis que necessitem de avaliação do foco visual."
            };
        }

        let adequate = 0;

        const problematicElements = [];

        evaluatedElements.forEach((element) => {

            const focusResult =
                evaluateFocusStyle(element);

            if (
                focusResult.hasVisibleFocus
            ) {

                adequate++;

            } else {

                problematicElements.push({
                    selector:
                        getElementSelector(
                            element
                        ),

                    description:
                        "Elemento focável sem indicação visual de foco identificável."
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
            id: "A11",
            category: "accessibility",
            name: "Foco visível",
            score: score,
            classification: classification,
            evaluated: total,
            adequate: adequate,

            evidence: [
                `Elementos focáveis avaliados: ${total}`,
                `Elementos com indicação visual de foco identificável: ${adequate}`,
                `Elementos sem indicação visual de foco identificável: ${problematicElements.length}`
            ],

            elements:
                problematicElements,

            recommendation:
                problematicElements.length > 0
                    ? "Adicione uma indicação visual clara para os elementos quando receberem foco pelo teclado. Evite remover o outline sem fornecer uma alternativa visual."
                    : "Mantenha uma indicação visual clara e perceptível para os elementos quando receberem foco."
        };
    };


function evaluateFocusStyle(element) {

    /*
     * Verifica se o elemento possui uma regra CSS
     * :focus ou :focus-visible com indicação visual.
     */
    const focusRules =
        findFocusRules(element);

    if (focusRules.hasVisibleFocus) {

        return {
            hasVisibleFocus: true
        };
    }

    /*
     * Verifica o estilo inline relacionado ao foco.
     */
    const inlineStyle =
        element.getAttribute("style");

    if (
        inlineStyle &&
        hasInlineFocusIndicator(
            inlineStyle
        )
    ) {

        return {
            hasVisibleFocus: true
        };
    }

    /*
     * Verifica se o elemento não removeu
     * explicitamente o outline.
     *
     * Nesse caso, consideramos que o navegador
     * mantém seu indicador de foco padrão.
     */
    const computedStyle =
        window.getComputedStyle(
            element
        );

    const outlineStyle =
        computedStyle.outlineStyle;

    const outlineWidth =
        parseFloat(
            computedStyle.outlineWidth
        );

    const outlineColor =
        computedStyle.outlineColor;

    const outlineIsVisible =
        outlineStyle !== "none" &&
        outlineWidth > 0 &&
        outlineColor !== "transparent" &&
        outlineColor !==
            "rgba(0, 0, 0, 0)";

    if (outlineIsVisible) {

        return {
            hasVisibleFocus: true
        };
    }

    /*
     * Caso o CSS tenha removido o outline,
     * verifica se existe box-shadow aplicado
     * ao elemento como indicação alternativa.
     */
    const boxShadow =
        computedStyle.boxShadow;

    if (
        boxShadow &&
        boxShadow !== "none"
    ) {

        return {
            hasVisibleFocus: true
        };
    }

    return {
        hasVisibleFocus: false
    };
}


function findFocusRules(element) {

    let hasVisibleFocus = false;

    const stylesheets =
        Array.from(
            document.styleSheets
        );

    stylesheets.forEach((stylesheet) => {

        let rules;

        try {

            rules =
                stylesheet.cssRules;

        } catch (error) {

            /*
             * Folhas de estilo externas de outro
             * domínio podem impedir acesso às regras.
             */
            return;
        }

        if (!rules) {
            return;
        }

        inspectCssRules(
            rules,
            element,
            (visible) => {

                if (visible) {
                    hasVisibleFocus = true;
                }
            }
        );
    });

    return {
        hasVisibleFocus:
            hasVisibleFocus
    };
}


function inspectCssRules(
    rules,
    element,
    callback
) {

    for (
        let index = 0;
        index < rules.length;
        index++
    ) {

        const rule =
            rules[index];

        /*
         * Regras de estilo normais.
         */
        if (
            rule.type ===
            CSSRule.STYLE_RULE
        ) {

            const selectorText =
                rule.selectorText;

            if (!selectorText) {
                continue;
            }

            /*
             * Procura seletores que representam
             * estados de foco.
             */
            if (
                selectorText.includes(":focus") ||
                selectorText.includes(
                    ":focus-visible"
                )
            ) {

                let matches = false;

                try {

                    matches =
                        element.matches(
                            selectorText
                        );

                } catch (error) {

                    matches = false;
                }

                /*
                 * element.matches(":focus") só retorna
                 * verdadeiro se o elemento estiver focado.
                 *
                 * Por isso, para esta análise também
                 * verificamos se o seletor possui o
                 * elemento por sua estrutura.
                 */
                if (
                    !matches &&
                    selectorMatchesElement(
                        selectorText,
                        element
                    )
                ) {
                    matches = true;
                }

                if (matches) {

                    const style =
                        rule.style;

                    if (
                        hasFocusIndicatorStyle(
                            style
                        )
                    ) {

                        callback(true);
                    }
                }
            }
        }

        /*
         * Regras agrupadas, como @media.
         */
        if (
            rule.cssRules
        ) {

            inspectCssRules(
                rule.cssRules,
                element,
                callback
            );
        }
    }
}


function selectorMatchesElement(
    selectorText,
    element
) {

    /*
     * Remove os pseudo-estados para verificar
     * o seletor estrutural.
     */
    const baseSelector =
        selectorText
            .replace(
                /:focus-visible/g,
                ""
            )
            .replace(
                /:focus/g,
                ""
            )
            .trim();

    if (!baseSelector) {
        return false;
    }

    const selectors =
        baseSelector.split(",");

    for (
        const selector of selectors
    ) {

        const cleanSelector =
            selector.trim();

        if (!cleanSelector) {
            continue;
        }

        try {

            if (
                element.matches(
                    cleanSelector
                )
            ) {
                return true;
            }

        } catch (error) {
            continue;
        }
    }

    return false;
}


function hasFocusIndicatorStyle(
    style
) {

    /*
     * Outline.
     */
    const outline =
        style.outline;

    const outlineStyle =
        style.outlineStyle;

    const outlineWidth =
        style.outlineWidth;

    if (
        outline &&
        outline !== "none" &&
        outlineStyle !== "none" &&
        outlineWidth !== "0px"
    ) {
        return true;
    }

    /*
     * Box-shadow.
     */
    const boxShadow =
        style.boxShadow;

    if (
        boxShadow &&
        boxShadow !== "none"
    ) {
        return true;
    }

    /*
     * Alteração de border também pode representar
     * uma indicação visual de foco.
     */
    const borderStyle =
        style.borderStyle;

    const borderWidth =
        style.borderWidth;

    if (
        borderStyle &&
        borderStyle !== "none" &&
        borderWidth &&
        borderWidth !== "0px"
    ) {
        return true;
    }

    return false;
}


function hasInlineFocusIndicator(
    inlineStyle
) {

    const normalized =
        inlineStyle
            .toLowerCase()
            .replace(
                /\s/g,
                ""
            );

    /*
     * Se o estilo inline remover explicitamente
     * o outline, não é considerado indicação.
     */
    if (
        normalized.includes(
            "outline:none"
        ) ||
        normalized.includes(
            "outline:0"
        )
    ) {
        return false;
    }

    /*
     * Box-shadow ou outline definido no estilo
     * inline pode representar indicação visual.
     */
    if (
        normalized.includes(
            "box-shadow:"
        ) ||
        normalized.includes(
            "outline:"
        )
    ) {
        return true;
    }

    return false;
}


function isNaturallyFocusable(
    element
) {

    const tagName =
        element.tagName.toLowerCase();

    /*
     * Links com href são naturalmente focáveis.
     */
    if (
        tagName === "a"
    ) {
        return element.hasAttribute(
            "href"
        );
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
     * Elementos contenteditable podem receber foco.
     */
    if (
        element.hasAttribute(
            "contenteditable"
        )
    ) {

        return (
            element.getAttribute(
                "contenteditable"
            ) !== "false"
        );
    }

    return false;
}


function getElementSelector(
    element
) {

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