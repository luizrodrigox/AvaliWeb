globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.R02 =
    function evaluateR02() {

        const elements =
            document.querySelectorAll(
                "body *"
            );

        const evaluatedElements = [];

        elements.forEach(
            (element) => {

                const style =
                    window.getComputedStyle(
                        element
                    );

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

                evaluatedElements.push(
                    element
                );
            }
        );

        const total =
            evaluatedElements.length;

        if (total === 0) {
            return {
                id: "R02",
                category: "responsive",
                name:
                    "Elementos ultrapassando a viewport",
                score: 10,
                classification:
                    "Adequado",
                evaluated: 0,
                adequate: 0,
                evidence: [
                    "Nenhum elemento visível foi identificado para avaliação."
                ],
                elements: [],
                recommendation:
                    "Não há elementos visíveis que necessitem de avaliação."
            };
        }

        let adequate = 0;
        const problematicElements = [];

        const viewportWidth =
            window.innerWidth;

        const viewportHeight =
            window.innerHeight;

        evaluatedElements.forEach(
            (element) => {

                const rect =
                    element.getBoundingClientRect();

                const exceedsLeft =
                    rect.left < -1;

                const exceedsRight =
                    rect.right >
                    viewportWidth + 1;

                const exceedsTop =
                    rect.top < -1;

                const exceedsBottom =
                    rect.bottom >
                    viewportHeight + 1;

                const exceedsViewport =
                    exceedsLeft ||
                    exceedsRight ||
                    exceedsTop ||
                    exceedsBottom;

                if (!exceedsViewport) {

                    adequate++;

                    return;
                }

                const problems = [];

                if (exceedsLeft) {
                    problems.push(
                        "ultrapassa o limite esquerdo"
                    );
                }

                if (exceedsRight) {
                    problems.push(
                        "ultrapassa o limite direito"
                    );
                }

                if (exceedsTop) {
                    problems.push(
                        "ultrapassa o limite superior"
                    );
                }

                if (exceedsBottom) {
                    problems.push(
                        "ultrapassa o limite inferior"
                    );
                }

                problematicElements.push({
                    selector:
                        getElementSelector(
                            element
                        ),
                    description:
                        `Elemento ${problems.join(
                            ", "
                        )} da viewport.`
                });
            }
        );

        const score =
            Number(
                (
                    (adequate / total) *
                    10
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
            id: "R02",
            category: "responsive",
            name:
                "Elementos ultrapassando a viewport",
            score: score,
            classification:
                classification,
            evaluated: total,
            adequate: adequate,
            evidence: [
                `Elementos avaliados: ${total}`,
                `Elementos dentro da viewport: ${adequate}`,
                `Elementos que ultrapassam a viewport: ${problematicElements.length}`,
                `Viewport avaliada: ${viewportWidth} × ${viewportHeight} CSS px`
            ],
            elements:
                problematicElements,
            recommendation:
                problematicElements.length > 0
                    ? "Ajuste o posicionamento e as dimensões dos elementos que ultrapassam os limites da viewport, garantindo que a interface permaneça adequadamente adaptada ao espaço disponível."
                    : "Mantenha os elementos dentro dos limites da viewport e preserve o comportamento adequado em diferentes dimensões de tela."
        };
    };


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