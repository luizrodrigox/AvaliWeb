globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A14 =
    function evaluateA14() {

        const elements =
            document.querySelectorAll(
                "p, li, a, button, label, input, select, textarea, h1, h2, h3, h4, h5, h6, td, th, span"
            );

        const evaluatedElements = [];

        elements.forEach((element) => {

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

            const tagName =
                element.tagName.toLowerCase();

            const isFormControl =
                tagName === "input" ||
                tagName === "select" ||
                tagName === "textarea";

            const text =
                element.textContent
                    .trim();

            if (
                text.length === 0 &&
                !isFormControl
            ) {
                return;
            }

            evaluatedElements.push(element);
        });

        const total =
            evaluatedElements.length;

        if (total === 0) {

            return {
                id: "A14",
                category: "accessibility",
                name: "Aumento e redução de fontes",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Nenhum elemento de conteúdo textual foi identificado para avaliação."
                ],

                elements: [],

                recommendation:
                    "Não há elementos textuais que necessitem de avaliação."
            };
        }

        const originalStyles =
            new Map();

        evaluatedElements.forEach(
            (element) => {

                originalStyles.set(
                    element,
                    element.getAttribute("style")
                );
            }
        );

        const problematicElements =
            [];

        let adequate = 0;

        evaluatedElements.forEach(
            (element) => {

                const result =
                    evaluateElementFontResize(
                        element
                    );

                if (
                    result.adequate
                ) {

                    adequate++;

                } else {

                    problematicElements.push({
                        selector:
                            getElementSelector(
                                element
                            ),

                        description:
                            result.description
                    });
                }
            }
        );

        originalStyles.forEach(
            (style, element) => {

                if (style === null) {

                    element.removeAttribute(
                        "style"
                    );

                } else {

                    element.setAttribute(
                        "style",
                        style
                    );
                }
            }
        );

        const score =
            Number(
                (
                    (adequate / total) * 10
                ).toFixed(1)
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

        return {
            id: "A14",
            category: "accessibility",
            name: "Aumento e redução de fontes",
            score: score,
            classification: classification,
            evaluated: total,
            adequate: adequate,

            evidence: [
                `Elementos avaliados: ${total}`,
                `Elementos adequados: ${adequate}`,
                `Elementos com possíveis problemas: ${problematicElements.length}`,
                "Foi simulada a alteração do tamanho das fontes para verificar corte, sobreposição ou perda de conteúdo."
            ],

            elements:
                problematicElements,

            recommendation:
                problematicElements.length > 0
                    ? "Garanta que o conteúdo permaneça visível e utilizável quando o tamanho das fontes for aumentado ou reduzido. Evite dimensões fixas que provoquem corte, sobreposição ou perda de conteúdo."
                    : "Mantenha o conteúdo adaptável às alterações no tamanho das fontes, evitando corte, sobreposição ou perda de informações."
        };
    };


function evaluateElementFontResize(
    element
) {

    const originalStyle =
        element.getAttribute("style");

    const computedStyle =
        window.getComputedStyle(
            element
        );

    const fontSize =
        parseFloat(
            computedStyle.fontSize
        );

    if (
        !Number.isFinite(fontSize) ||
        fontSize <= 0
    ) {

        return {
            adequate: true,
            description: ""
        };
    }

    const originalRect =
        element.getBoundingClientRect();

    const originalScrollWidth =
        element.scrollWidth;

    const originalClientWidth =
        element.clientWidth;

    const originalScrollHeight =
        element.scrollHeight;

    const originalClientHeight =
        element.clientHeight;

    const originalTextOverflow =
        computedStyle.textOverflow;

    const originalWhiteSpace =
        computedStyle.whiteSpace;

    const originalOverflowX =
        computedStyle.overflowX;

    const originalOverflowY =
        computedStyle.overflowY;

    const viewportWidth =
        window.innerWidth;

    const viewportHeight =
        window.innerHeight;

    const tests = [
        {
            name: "aumento",
            multiplier: 2
        },
        {
            name: "redução",
            multiplier: 0.5
        }
    ];

    const problems = [];

    tests.forEach(
        (test) => {

            element.style.setProperty(
                "font-size",
                `${fontSize * test.multiplier}px`,
                "important"
            );

            element.style.setProperty(
                "line-height",
                "normal",
                "important"
            );

            void element.offsetHeight;

            const rect =
                element.getBoundingClientRect();

            const scrollWidth =
                element.scrollWidth;

            const clientWidth =
                element.clientWidth;

            const scrollHeight =
                element.scrollHeight;

            const clientHeight =
                element.clientHeight;

            const hasHorizontalOverflow =
                scrollWidth >
                clientWidth + 1 &&
                originalOverflowX !== "auto" &&
                originalOverflowX !== "scroll";

            const hasVerticalOverflow =
                scrollHeight >
                clientHeight + 1 &&
                originalOverflowY !== "auto" &&
                originalOverflowY !== "scroll";

            const isClippedHorizontally =
                rect.left <
                    -1 ||
                rect.right >
                    viewportWidth + 1;

            const isClippedVertically =
                rect.top <
                    -1 ||
                rect.bottom >
                    viewportHeight + 1;

            const hasEllipsis =
                originalTextOverflow ===
                    "ellipsis" &&
                originalWhiteSpace ===
                    "nowrap";

            const hasPotentialTextLoss =
                hasEllipsis ||
                (
                    originalWhiteSpace ===
                        "nowrap" &&
                    scrollWidth >
                        clientWidth + 1
                );

            if (
                hasHorizontalOverflow ||
                hasVerticalOverflow ||
                isClippedHorizontally ||
                isClippedVertically ||
                hasPotentialTextLoss
            ) {

                const problemsFound = [];

                if (
                    hasHorizontalOverflow
                ) {

                    problemsFound.push(
                        "overflow horizontal"
                    );
                }

                if (
                    hasVerticalOverflow
                ) {

                    problemsFound.push(
                        "overflow vertical"
                    );
                }

                if (
                    isClippedHorizontally
                ) {

                    problemsFound.push(
                        "corte horizontal"
                    );
                }

                if (
                    isClippedVertically
                ) {

                    problemsFound.push(
                        "corte vertical"
                    );
                }

                if (
                    hasPotentialTextLoss
                ) {

                    problemsFound.push(
                        "possível perda de texto"
                    );
                }

                problems.push(
                    `${test.name === "aumento"
                        ? "Aumento para 200%"
                        : "Redução para 50%"}: ${problemsFound.join(", ")}.`
                );
            }

            element.setAttribute(
                "style",
                originalStyle === null
                    ? ""
                    : originalStyle
            );

            if (
                originalStyle === null
            ) {

                element.removeAttribute(
                    "style"
                );
            }

            void element.offsetHeight;
        });

    const finalRect =
        element.getBoundingClientRect();

    const finalWidth =
        element.scrollWidth;

    const finalClientWidth =
        element.clientWidth;

    const finalHeight =
        element.scrollHeight;

    const finalClientHeight =
        element.clientHeight;

    if (
        finalWidth !==
            originalScrollWidth ||
        finalClientWidth !==
            originalClientWidth ||
        finalHeight !==
            originalScrollHeight ||
        finalClientHeight !==
            originalClientHeight ||
        finalRect.width !==
            originalRect.width ||
        finalRect.height !==
            originalRect.height
    ) {

        // A página pode sofrer pequenas diferenças
        // de arredondamento após a restauração.
        // A comparação serve apenas como proteção
        // adicional e não classifica o elemento isoladamente.
    }

    return {
        adequate:
            problems.length === 0,

        description:
            problems.length > 0
                ? `Problemas identificados durante a alteração do tamanho da fonte: ${problems.join(" ")}`
                : ""
    };
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