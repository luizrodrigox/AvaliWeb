globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};
 
globalThis.AvaliWebCriteria.R03 =
    function evaluateR03() {

        const mobileViewports = [360, 375, 390, 393, 412, 430];

        const indicators = [];

        const html =
            document.documentElement.outerHTML;

        mobileViewports.forEach(
            (viewportWidth) => {

                const result =
                    evaluateMobileViewport(
                        html,
                        viewportWidth
                    );

                indicators.push(result);
            }
        );

        const total =
            indicators.length;

        const adequate =
            indicators.filter(
                (indicator) =>
                    indicator.adequate
            ).length;

        const score =
            Number(
                (
                    (adequate / total) *
                    10
                ).toFixed(1)
            );

        let classification;

        if (score >= 9) {
            classification =
                "Adequado";
        } else if (score >= 5) {
            classification =
                "Atenção";
        } else {
            classification =
                "Problema";
        }

        const problematicViewports =
            indicators.filter(
                (indicator) =>
                    !indicator.adequate
            );

        const relatedElements = [];

        problematicViewports.forEach(
            (viewport) => {

                viewport.elements.forEach(
                    (element) => {

                        const key =
                            `${viewport.viewport}|${element.selector}`;

                        const alreadyExists =
                            relatedElements.some(
                                (item) =>
                                    item.key === key
                            );

                        if (!alreadyExists) {

                            relatedElements.push({
                                key:
                                    key,

                                selector:
                                    element.selector,

                                description:
                                    `${element.description} (${viewport.viewport}px)`
                            });
                        }
                    }
                );
            }
        );

        const evidence = [
            `Viewports mobile avaliadas: ${mobileViewports.join(", ")} CSS px`,
            `Indicadores avaliados: ${total}`,
            `Indicadores adequados: ${adequate}`,
            `Indicadores com problemas: ${problematicViewports.length}`
        ];

        indicators.forEach(
            (indicator) => {

                evidence.push(
                    `${indicator.viewport}px: ${
                        indicator.adequate
                            ? "adequado"
                            : "problema"
                    }`
                );
            }
        );

        return {

            id:
                "R03",

            category:
                "responsive",

            name:
                "Layout em largura mobile",

            score:
                score,

            classification:
                classification,

            evaluated:
                total,

            adequate:
                adequate,

            evidence:
                evidence,

            elements:
                relatedElements.map(
                    (element) => ({

                        selector:
                            element.selector,

                        description:
                            element.description
                    })
                ),

            recommendation:
                problematicViewports.length > 0
                    ? "Adapte o layout para diferentes larguras de dispositivos móveis, utilizando dimensões flexíveis, media queries e posicionamento adequado dos elementos."
                    : "Mantenha o layout adaptável às diferentes larguras de dispositivos móveis avaliadas."
        };
    };


function evaluateMobileViewport(
    html,
    viewportWidth
) {

    const iframe =
        document.createElement(
            "iframe"
        );

    iframe.style.position =
        "fixed";

    iframe.style.left =
        "-10000px";

    iframe.style.top =
        "0";

    iframe.style.width =
        `${viewportWidth}px`;

    iframe.style.height =
        "800px";

    iframe.style.border =
        "0";

    iframe.style.overflow =
        "hidden";

    iframe.setAttribute(
        "scrolling",
        "no"
    );

    iframe.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.appendChild(
        iframe
    );

    const frameDocument =
        iframe.contentDocument;

    const frameWindow =
        iframe.contentWindow;

    if (
        !frameDocument ||
        !frameWindow
    ) {

        iframe.remove();

        return {

            viewport:
                viewportWidth,

            adequate:
                false,

            elements: [
                {
                    selector:
                        "document",

                    description:
                        "Não foi possível avaliar a viewport."
                }
            ]
        };
    }

    frameDocument.open();

    frameDocument.write(
        `<!DOCTYPE html>${html}`
    );

    frameDocument.close();

    const body =
        frameDocument.body;

    const documentElement =
        frameDocument.documentElement;

    if (
        !body ||
        !documentElement
    ) {

        iframe.remove();

        return {

            viewport:
                viewportWidth,

            adequate:
                false,

            elements: [
                {
                    selector:
                        "document",

                    description:
                        "Não foi possível avaliar o conteúdo da página."
                }
            ]
        };
    }

    /*
     * O R03 avalia a adaptação horizontal
     * do layout.
     *
     * A largura do documento de teste é
     * igualada à viewport analisada.
     */
    documentElement.style.width =
        `${viewportWidth}px`;

    body.style.width =
        `${viewportWidth}px`;

    documentElement.style.overflowX =
        "hidden";

    documentElement.style.overflowY =
        "hidden";

    body.style.overflowX =
        "hidden";

    body.style.overflowY =
        "hidden";

    const problems = [];

    /*
     * Verifica a largura real do conteúdo.
     *
     * Caso o conteúdo como um todo seja maior
     * que a viewport, existe problema de adaptação.
     */
    const scrollWidth =
        Math.max(
            documentElement.scrollWidth,
            body.scrollWidth
        );

    if (
        scrollWidth >
        viewportWidth + 1
    ) {

        /*
         * O scrollWidth pode refletir somente
         * posicionamento centralizado de um
         * elemento maior que a viewport.
         *
         * Por isso, a confirmação é feita
         * também pela largura dos elementos.
         */
    }

    /*
     * Elementos visíveis da página.
     */
    const elements =
        Array.from(
            frameDocument.querySelectorAll(
                "body *"
            )
        );

    elements.forEach(
        (element) => {

            const style =
                frameWindow.getComputedStyle(
                    element
                );

            if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                parseFloat(
                    style.opacity
                ) === 0
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

            /*
             * Regra principal do R03:
             *
             * Se o próprio elemento possui
             * largura maior que a viewport,
             * ele não se adapta àquela largura.
             */
            const widthExceedsViewport =
                rect.width >
                viewportWidth + 1;

            /*
             * Elementos com posicionamento explícito
             * podem ultrapassar a viewport mesmo
             * quando sua largura individual cabe nela.
             *
             * Para elementos normais em fluxo,
             * não usamos rect.left < 0, pois isso
             * geraria falso positivo em layouts
             * centralizados com margin: auto.
             */
            const explicitPosition =
                style.position === "absolute" ||
                style.position === "fixed" ||
                style.position === "sticky";

            const positionedOutside =
                explicitPosition &&
                (
                    rect.left < -1 ||
                    rect.right >
                        viewportWidth + 1
                );

            if (
                widthExceedsViewport ||
                positionedOutside
            ) {

                let description;

                if (
                    widthExceedsViewport
                ) {

                    description =
                        `Elemento possui largura de ${Math.round(
                            rect.width
                        )}px e ultrapassa a viewport de ${viewportWidth}px.`;

                } else {

                    description =
                        "Elemento com posicionamento explícito ultrapassa horizontalmente os limites da viewport.";
                }

                problems.push({

                    selector:
                        getElementSelector(
                            element
                        ),

                    description:
                        description
                });
            }
        }
    );

    /*
     * Verifica elementos de mídia que possam
     * manter largura fixa maior que a viewport.
     *
     * Essa verificação é feita diretamente
     * pelas dimensões renderizadas.
     */
    const mediaElements =
        Array.from(
            frameDocument.querySelectorAll(
                "img, video, iframe, canvas, svg"
            )
        );

    mediaElements.forEach(
        (element) => {

            const style =
                frameWindow.getComputedStyle(
                    element
                );

            if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                parseFloat(
                    style.opacity
                ) === 0
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

            if (
                rect.width >
                viewportWidth + 1
            ) {

                problems.push({

                    selector:
                        getElementSelector(
                            element
                        ),

                    description:
                        `Elemento de mídia possui largura de ${Math.round(
                            rect.width
                        )}px e ultrapassa a viewport de ${viewportWidth}px.`
                });
            }
        }
    );

    /*
     * Remove problemas duplicados.
     */
    const uniqueProblems =
        problems.filter(
            (problem, index, array) =>
                index ===
                array.findIndex(
                    (item) =>
                        item.selector ===
                            problem.selector &&
                        item.description ===
                            problem.description
                )
        );

    iframe.remove();

    return {

        viewport:
            viewportWidth,

        adequate:
            uniqueProblems.length === 0,

        elements:
            uniqueProblems
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
            .map(
                (className) =>
                    CSS.escape(
                        className
                    )
            )
            .join(".")}`;
    }

    return element.tagName
        .toLowerCase();
}