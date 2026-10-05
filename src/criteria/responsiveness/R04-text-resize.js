globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.R04 =
    function evaluateR04() {
        const originalElements =
            Array.from(document.body.querySelectorAll("*"));

        const elements = originalElements.filter(
            (element) => {
                const style =
                    window.getComputedStyle(element);

                const rect =
                    element.getBoundingClientRect();

                if (
                    style.display === "none" ||
                    style.visibility === "hidden" ||
                    Number(style.opacity) === 0
                ) {
                    return false;
                }

                if (
                    rect.width <= 0 ||
                    rect.height <= 0
                ) {
                    return false;
                }

                const tag =
                    element.tagName.toLowerCase();

                const isTextElement =
                    [
                        "p",
                        "span",
                        "a",
                        "button",
                        "label",
                        "li",
                        "td",
                        "th",
                        "h1",
                        "h2",
                        "h3",
                        "h4",
                        "h5",
                        "h6",
                        "input",
                        "textarea",
                        "select"
                    ].includes(tag);

                const hasText =
                    element.textContent.trim().length > 0;

                const isFormControl =
                    [
                        "input",
                        "textarea",
                        "select",
                        "button"
                    ].includes(tag);

                return (
                    isTextElement &&
                    (hasText || isFormControl)
                );
            }
        );

        if (elements.length === 0) {
            return {
                id: "R04",
                category: "responsive",
                name:
                    "Redimensionamento de textos e componentes",
                score: 10,
                classification: "Adequado",
                evidence: [
                    "Nenhum elemento textual ou componente avaliável foi encontrado.",
                    "A análise não identificou conteúdo que pudesse ser avaliado quanto ao redimensionamento."
                ],
                elements: [],
                recommendation:
                    "Não foram identificados elementos avaliáveis. Mantenha os textos e componentes adaptáveis ao redimensionamento."
            };
        }

        const originalStyles =
            new Map();

        elements.forEach((element) => {
            originalStyles.set(element, {
                fontSize:
                    element.style.fontSize,
                lineHeight:
                    element.style.lineHeight,
                overflow:
                    element.style.overflow,
                overflowX:
                    element.style.overflowX,
                overflowY:
                    element.style.overflowY,
                whiteSpace:
                    element.style.whiteSpace,
                height:
                    element.style.height,
                maxHeight:
                    element.style.maxHeight,
                width:
                    element.style.width,
                maxWidth:
                    element.style.maxWidth
            });
        });

        const problematicElements =
            new Set();

        const adequateElements =
            new Set(elements);

        function getTextContent(element) {
            return element.textContent
                .replace(/\s+/g, " ")
                .trim();
        }

        function isClipped(element) {
            const rect =
                element.getBoundingClientRect();

            const scrollWidth =
                element.scrollWidth;

            const scrollHeight =
                element.scrollHeight;

            const clientWidth =
                element.clientWidth;

            const clientHeight =
                element.clientHeight;

            const style =
                window.getComputedStyle(element);

            const horizontalClip =
                scrollWidth >
                    clientWidth + 1 &&
                (
                    style.overflow === "hidden" ||
                    style.overflowX === "hidden" ||
                    style.overflow === "clip" ||
                    style.overflowX === "clip"
                );

            const verticalClip =
                scrollHeight >
                    clientHeight + 1 &&
                (
                    style.overflow === "hidden" ||
                    style.overflowY === "hidden" ||
                    style.overflow === "clip" ||
                    style.overflowY === "clip"
                );

            const text =
                getTextContent(element);

            const hasText =
                text.length > 0;

            const visualHeight =
                rect.height;

            const lineHeight =
                parseFloat(style.lineHeight);

            const fontSize =
                parseFloat(style.fontSize);

            const suspiciousFixedHeight =
                hasText &&
                Number.isFinite(lineHeight) &&
                Number.isFinite(fontSize) &&
                visualHeight < fontSize * 1.1;

            return (
                horizontalClip ||
                verticalClip ||
                suspiciousFixedHeight
            );
        }

        function getElementRect(element) {
            return element.getBoundingClientRect();
        }

        function overlaps(
            firstElement,
            secondElement
        ) {
            if (
                firstElement === secondElement
            ) {
                return false;
            }

            const first =
                getElementRect(firstElement);

            const second =
                getElementRect(secondElement);

            const horizontal =
                first.left < second.right &&
                first.right > second.left;

            const vertical =
                first.top < second.bottom &&
                first.bottom > second.top;

            return horizontal && vertical;
        }

        function hasMeaningfulOverlap(
            firstElement,
            secondElement
        ) {
            const first =
                getElementRect(firstElement);

            const second =
                getElementRect(secondElement);

            const overlapWidth =
                Math.min(
                    first.right,
                    second.right
                ) -
                Math.max(
                    first.left,
                    second.left
                );

            const overlapHeight =
                Math.min(
                    first.bottom,
                    second.bottom
                ) -
                Math.max(
                    first.top,
                    second.top
                );

            if (
                overlapWidth <= 1 ||
                overlapHeight <= 1
            ) {
                return false;
            }

            const overlapArea =
                overlapWidth *
                overlapHeight;

            const firstArea =
                first.width *
                first.height;

            const secondArea =
                second.width *
                second.height;

            if (
                firstArea <= 0 ||
                secondArea <= 0
            ) {
                return false;
            }

            return (
                overlapArea >
                Math.min(
                    firstArea,
                    secondArea
                ) * 0.05
            );
        }

        function checkOverlaps() {
            for (
                let i = 0;
                i < elements.length;
                i++
            ) {
                for (
                    let j = i + 1;
                    j < elements.length;
                    j++
                ) {
                    const first =
                        elements[i];

                    const second =
                        elements[j];

                    if (
                        overlaps(
                            first,
                            second
                        ) &&
                        hasMeaningfulOverlap(
                            first,
                            second
                        )
                    ) {
                        problematicElements.add(
                            first
                        );

                        problematicElements.add(
                            second
                        );

                        adequateElements.delete(
                            first
                        );

                        adequateElements.delete(
                            second
                        );
                    }
                }
            }
        }

        const originalFontSizes =
            new Map();

        elements.forEach((element) => {
            const computed =
                window.getComputedStyle(element);

            const fontSize =
                parseFloat(
                    computed.fontSize
                );

            if (
                Number.isFinite(fontSize)
            ) {
                originalFontSizes.set(
                    element,
                    fontSize
                );
            }
        });

        /*
         * Estado 1:
         * tamanho original
         */
        elements.forEach((element) => {
            if (
                isClipped(element)
            ) {
                problematicElements.add(
                    element
                );

                adequateElements.delete(
                    element
                );
            }
        });

        /*
         * Estado 2:
         * texto ampliado para 150%
         */
        elements.forEach((element) => {
            const originalSize =
                originalFontSizes.get(
                    element
                );

            if (
                Number.isFinite(originalSize)
            ) {
                element.style.fontSize =
                    `${originalSize * 1.5}px`;
            }
        });

        checkOverlaps();

        elements.forEach((element) => {
            if (
                isClipped(element)
            ) {
                problematicElements.add(
                    element
                );

                adequateElements.delete(
                    element
                );
            }
        });

        /*
         * Estado 3:
         * texto ampliado para 200%
         */
        elements.forEach((element) => {
            const originalSize =
                originalFontSizes.get(
                    element
                );

            if (
                Number.isFinite(originalSize)
            ) {
                element.style.fontSize =
                    `${originalSize * 2}px`;
            }
        });

        checkOverlaps();

        elements.forEach((element) => {
            if (
                isClipped(element)
            ) {
                problematicElements.add(
                    element
                );

                adequateElements.delete(
                    element
                );
            }
        });

        /*
         * Restaura os estilos originais.
         */
        originalStyles.forEach(
            (styles, element) => {
                element.style.fontSize =
                    styles.fontSize;

                element.style.lineHeight =
                    styles.lineHeight;

                element.style.overflow =
                    styles.overflow;

                element.style.overflowX =
                    styles.overflowX;

                element.style.overflowY =
                    styles.overflowY;

                element.style.whiteSpace =
                    styles.whiteSpace;

                element.style.height =
                    styles.height;

                element.style.maxHeight =
                    styles.maxHeight;

                element.style.width =
                    styles.width;

                element.style.maxWidth =
                    styles.maxWidth;
            }
        );

        const total =
            elements.length;

        const adequate =
            total -
            problematicElements.size;

        const score =
            Number(
                (
                    (adequate / total) *
                    10
                ).toFixed(1)
            );

        let classification;

        if (score >= 9) {
            classification = "Adequado";
        } else if (score >= 5) {
            classification = "Atenção";
        } else {
            classification = "Problema";
        }

        const evidence = [
            `Elementos avaliados: ${total}`,
            `Elementos adequados: ${adequate}`,
            `Elementos com problemas: ${problematicElements.size}`,
            "Redimensionamentos avaliados: 150% e 200% do tamanho original do texto."
        ];

        if (
            problematicElements.size > 0
        ) {
            evidence.push(
                "Foram identificados elementos com corte, sobreposição ou perda de conteúdo após o redimensionamento."
            );
        } else {
            evidence.push(
                "Não foram identificados cortes, sobreposições ou perda de conteúdo após o redimensionamento."
            );
        }

        const relatedElements =
            Array.from(
                problematicElements
            ).map((element) => {
                let selector;

                if (element.id) {
                    selector = `#${element.id}`;
                } else if (
                    element.classList &&
                    element.classList.length > 0
                ) {
                    selector =
                        element.tagName.toLowerCase() +
                        "." +
                        Array.from(
                            element.classList
                        ).join(".");
                } else {
                    selector =
                        element.tagName.toLowerCase();
                }

                return {
                    selector
                };
            });

        return {
            id: "R04",
            category: "responsive",
            name:
                "Redimensionamento de textos e componentes",
            score,
            classification,
            evidence,
            elements:
                relatedElements,
            recommendation:
                problematicElements.size > 0
                    ? "Utilize dimensões flexíveis, permita que textos ocupem o espaço necessário e evite alturas fixas, overflow oculto e posicionamentos que provoquem corte ou sobreposição durante o redimensionamento."
                    : "Mantenha dimensões flexíveis e permita que textos e componentes se adaptem ao aumento do conteúdo."
        };
    };