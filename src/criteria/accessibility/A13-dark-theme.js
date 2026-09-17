globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A13 =
    function evaluateA13() {

        const elements =
            document.querySelectorAll(
                "button, a, input, select, [role='button'], [role='switch'], [role='checkbox'], [aria-label], [title], [id], [class], [data-theme], [data-mode]"
            );

        const matchingElements = [];

        elements.forEach((element) => {

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
             * Obtém informações que podem identificar
             * uma funcionalidade de tema escuro ou
             * alto contraste.
             */
            const text =
                getElementText(element);

            const ariaLabel =
                element.getAttribute(
                    "aria-label"
                ) || "";

            const title =
                element.getAttribute(
                    "title"
                ) || "";

            const id =
                element.getAttribute(
                    "id"
                ) || "";

            const className =
                typeof element.className === "string"
                    ? element.className
                    : "";

            const dataTheme =
                element.getAttribute(
                    "data-theme"
                ) || "";

            const dataMode =
                element.getAttribute(
                    "data-mode"
                ) || "";

            const combinedText =
                [
                    text,
                    ariaLabel,
                    title,
                    id,
                    className,
                    dataTheme,
                    dataMode
                ]
                    .join(" ")
                    .toLowerCase();

            /*
             * Procura indicadores relacionados a
             * tema escuro.
             */
            const hasDarkThemeIndicator =
                containsAny(
                    combinedText,
                    [
                        "dark mode",
                        "dark-mode",
                        "darkmode",
                        "dark theme",
                        "dark-theme",
                        "darktheme",
                        "tema escuro",
                        "tema-escuro",
                        "temanescuro",
                        "modo escuro",
                        "modo-escuro",
                        "modoescuro",
                        "tema dark",
                        "modo dark"
                    ]
                );

            /*
             * Procura indicadores relacionados a
             * alto contraste.
             */
            const hasHighContrastIndicator =
                containsAny(
                    combinedText,
                    [
                        "high contrast",
                        "high-contrast",
                        "highcontrast",
                        "alto contraste",
                        "alto-contraste",
                        "altocontraste",
                        "contraste alto",
                        "contraste-alto",
                        "contrastealto"
                    ]
                );

            /*
             * Verifica valores explícitos de tema.
             */
            const hasDarkDataTheme =
                dataTheme
                    .toLowerCase()
                    .includes("dark");

            const hasDarkDataMode =
                dataMode
                    .toLowerCase()
                    .includes("dark");

            if (
                hasDarkThemeIndicator ||
                hasHighContrastIndicator ||
                hasDarkDataTheme ||
                hasDarkDataMode
            ) {

                matchingElements.push({
                    element: element,

                    reason:
                        getDetectionReason(
                            hasDarkThemeIndicator,
                            hasHighContrastIndicator,
                            hasDarkDataTheme,
                            hasDarkDataMode
                        )
                });
            }
        });

        /*
         * Também verifica se o documento utiliza
         * atributos que indiquem um tema escuro.
         */
        const documentTheme =
            detectDocumentTheme();

        if (
            documentTheme.detected
        ) {

            matchingElements.push({
                element:
                    documentTheme.element,

                reason:
                    documentTheme.reason
            });
        }

        /*
         * Remove possíveis elementos duplicados.
         */
        const uniqueMatches =
            removeDuplicateElements(
                matchingElements
            );

        /*
         * Caso exista pelo menos um mecanismo
         * identificável, o critério é adequado.
         */
        if (
            uniqueMatches.length > 0
        ) {

            return {
                id: "A13",
                category: "accessibility",
                name: "Tema escuro/alto contraste",
                score: 10,
                classification: "Adequado",
                evaluated: 1,
                adequate: 1,

                evidence: [
                    "Foi identificado um mecanismo ou indicação de tema escuro ou alto contraste na interface.",
                    `Elementos relacionados identificados: ${uniqueMatches.length}`
                ],

                elements:
                    uniqueMatches.map(
                        (item) => ({
                            selector:
                                getElementSelector(
                                    item.element
                                ),

                            description:
                                item.reason
                        })
                    ),

                recommendation:
                    "Mantenha o mecanismo de tema escuro ou alto contraste disponível e identificado de forma clara para os usuários."
            };
        }

        /*
         * Caso nenhum mecanismo seja identificado.
         */
        return {
            id: "A13",
            category: "accessibility",
            name: "Tema escuro/alto contraste",
            score: 0,
            classification: "Problema",
            evaluated: 1,
            adequate: 0,

            evidence: [
                "Não foi identificado um mecanismo de tema escuro ou alto contraste na interface."
            ],

            elements: [],

            recommendation:
                "Considere disponibilizar um mecanismo de tema escuro ou alto contraste para oferecer uma alternativa visual aos usuários."
        };
    };


function getElementText(element) {

    /*
     * Obtém somente o texto diretamente relacionado
     * ao elemento para evitar que um container grande
     * seja identificado apenas por causa do texto
     * de seus elementos filhos.
     */
    let text = "";

    element.childNodes.forEach(
        (node) => {

            if (
                node.nodeType ===
                Node.TEXT_NODE
            ) {

                text +=
                    node.textContent;
            }
        }
    );

    return text.trim();
}


function containsAny(
    text,
    terms
) {

    return terms.some(
        (term) =>
            text.includes(term)
    );
}


function getDetectionReason(
    darkTheme,
    highContrast,
    darkDataTheme,
    darkDataMode
) {

    const reasons = [];

    if (darkTheme) {
        reasons.push(
            "Indicação de tema escuro identificada."
        );
    }

    if (highContrast) {
        reasons.push(
            "Indicação de alto contraste identificada."
        );
    }

    if (darkDataTheme) {
        reasons.push(
            "Atributo data-theme indica utilização de tema escuro."
        );
    }

    if (darkDataMode) {
        reasons.push(
            "Atributo data-mode indica utilização de modo escuro."
        );
    }

    return reasons.join(" ");
}


function detectDocumentTheme() {

    const html =
        document.documentElement;

    const body =
        document.body;

    /*
     * Verifica atributos de tema no elemento html.
     */
    const htmlTheme =
        html.getAttribute(
            "data-theme"
        );

    if (
        htmlTheme &&
        htmlTheme
            .toLowerCase()
            .includes("dark")
    ) {

        return {
            detected: true,

            element: html,

            reason:
                "O elemento html possui data-theme indicando tema escuro."
        };
    }

    const htmlMode =
        html.getAttribute(
            "data-mode"
        );

    if (
        htmlMode &&
        htmlMode
            .toLowerCase()
            .includes("dark")
    ) {

        return {
            detected: true,

            element: html,

            reason:
                "O elemento html possui data-mode indicando modo escuro."
        };
    }

    /*
     * Verifica atributos de tema no body.
     */
    if (body) {

        const bodyTheme =
            body.getAttribute(
                "data-theme"
            );

        if (
            bodyTheme &&
            bodyTheme
                .toLowerCase()
                .includes("dark")
        ) {

            return {
                detected: true,

                element: body,

                reason:
                    "O elemento body possui data-theme indicando tema escuro."
            };
        }

        const bodyMode =
            body.getAttribute(
                "data-mode"
            );

        if (
            bodyMode &&
            bodyMode
                .toLowerCase()
                .includes("dark")
        ) {

            return {
                detected: true,

                element: body,

                reason:
                    "O elemento body possui data-mode indicando modo escuro."
            };
        }
    }

    /*
     * Nenhum mecanismo foi identificado.
     */
    return {
        detected: false,

        element: null,

        reason: ""
    };
}


function removeDuplicateElements(
    matches
) {

    const unique = [];

    const seen =
        new Set();

    matches.forEach(
        (item) => {

            if (
                seen.has(
                    item.element
                )
            ) {
                return;
            }

            seen.add(
                item.element
            );

            unique.push(item);
        }
    );

    return unique;
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