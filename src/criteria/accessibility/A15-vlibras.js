globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A15 =
    function evaluateA15() {

        const detectedElements = [];

        /*
         * 1. Verifica scripts relacionados ao VLibras.
         */
        const scripts =
            document.querySelectorAll("script");

        scripts.forEach((script) => {

            const src =
                script.getAttribute("src") || "";

            const text =
                script.textContent || "";

            const normalizedSrc =
                src.toLowerCase();

            const normalizedText =
                text.toLowerCase();

            const hasVlibrasScript =
                normalizedSrc.includes(
                    "vlibras-plugin.js"
                ) ||
                normalizedSrc.includes(
                    "vlibras.gov.br"
                );

            const hasVlibrasWidget =
                normalizedText.includes(
                    "window.vlibras.widget"
                ) ||
                normalizedText.includes(
                    "new window.vlibras.widget"
                );

            if (
                hasVlibrasScript ||
                hasVlibrasWidget
            ) {

                detectedElements.push({
                    element: script,

                    description:
                        hasVlibrasScript
                            ? "Script relacionado à integração do VLibras identificado."
                            : "Inicialização do VLibras Widget identificada."
                });
            }
        });


        /*
         * 2. Procura elementos característicos
         *    da integração do VLibras.
         */
        const vlibrasElements =
            document.querySelectorAll(
                "[vw], #vlibras, #vlibras-toggle, [data-vlibras], [data-vlibras-widget]"
            );

        vlibrasElements.forEach(
            (element) => {

                detectedElements.push({
                    element: element,

                    description:
                        "Elemento associado à integração do VLibras identificado."
                });
            }
        );


        /*
         * 3. Procura classes e identificadores
         *    explicitamente relacionados ao VLibras.
         */
        const allElements =
            document.querySelectorAll(
                "[id], [class]"
            );

        allElements.forEach(
            (element) => {

                const id =
                    element.getAttribute(
                        "id"
                    ) || "";

                const className =
                    typeof element.className ===
                        "string"
                        ? element.className
                        : "";

                const combined =
                    `${id} ${className}`
                        .toLowerCase();

                const hasVlibrasIdentifier =
                    combined.includes(
                        "vlibras"
                    );

                if (
                    hasVlibrasIdentifier
                ) {

                    detectedElements.push({
                        element: element,

                        description:
                            "Elemento com identificador ou classe relacionada ao VLibras identificado."
                    });
                }
            }
        );


        /*
         * 4. Procura referências ao objeto
         *    global do VLibras na página.
         */
        let globalVlibrasDetected =
            false;

        try {

            globalVlibrasDetected =
                typeof window.VLibras !==
                    "undefined";

        } catch (error) {

            globalVlibrasDetected =
                false;
        }

        if (
            globalVlibrasDetected
        ) {

            detectedElements.push({
                element:
                    document.documentElement,

                description:
                    "Objeto global window.VLibras identificado na página."
            });
        }


        /*
         * Remove elementos duplicados.
         */
        const uniqueElements =
            removeDuplicateElements(
                detectedElements
            );


        /*
         * VLibras identificado.
         */
        if (
            uniqueElements.length > 0
        ) {

            return {
                id: "A15",
                category: "accessibility",
                name: "VLibras",
                score: 10,
                classification: "Adequado",
                evaluated: 1,
                adequate: 1,

                evidence: [
                    "Foi identificada uma integração ou mecanismo relacionado ao VLibras na página.",
                    `Evidências técnicas identificadas: ${uniqueElements.length}`
                ],

                elements:
                    uniqueElements.map(
                        (item) => ({
                            selector:
                                getElementSelector(
                                    item.element
                                ),

                            description:
                                item.description
                        })
                    ),

                recommendation:
                    "Mantenha a integração com o VLibras disponível e funcional para oferecer suporte à tradução de conteúdo para Libras."
            };
        }


        /*
         * VLibras não identificado.
         */
        return {
            id: "A15",
            category: "accessibility",
            name: "VLibras",
            score: 0,
            classification: "Problema",
            evaluated: 1,
            adequate: 0,

            evidence: [
                "Não foi identificada integração do VLibras ou mecanismo equivalente de tradução para Libras."
            ],

            elements: [],

            recommendation:
                "Considere disponibilizar uma integração com o VLibras ou mecanismo equivalente de tradução de conteúdo para Libras."
        };
    };


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

            unique.push(
                item
            );
        }
    );

    return unique;
}


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
            .map((className) =>
                CSS.escape(
                    className
                )
            )
            .join(".")}`;
    }

    return element.tagName.toLowerCase();
}