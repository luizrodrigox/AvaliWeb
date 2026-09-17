globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A06 =
    function evaluateA06() {

        const headings =
            document.querySelectorAll(
                "h1, h2, h3, h4, h5, h6"
            );

        const total =
            headings.length;

        if (total === 0) {

            return {
                id: "A06",
                category: "accessibility",
                name: "Hierarquia de títulos",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Nenhum título foi identificado na página."
                ],

                elements: [],

                recommendation:
                    "Não há títulos que necessitem de avaliação."
            };
        }

        const headingData =
            Array.from(headings).map(
                (heading) => ({
                    element: heading,
                    level: Number(
                        heading.tagName.substring(1)
                    )
                })
            );

        let adequate = 0;

        const problematicHeadings = [];

        headingData.forEach(
            (current, index) => {

                let isAdequate = true;

                /*
                 * O primeiro título deve iniciar
                 * preferencialmente em h1.
                 */
                if (
                    index === 0 &&
                    current.level !== 1
                ) {
                    isAdequate = false;
                }

                /*
                 * Um título não deve saltar
                 * mais de um nível em relação
                 * ao título anterior.
                 */
                if (index > 0) {

                    const previous =
                        headingData[index - 1];

                    if (
                        current.level >
                        previous.level + 1
                    ) {
                        isAdequate = false;
                    }
                }

                if (isAdequate) {

                    adequate++;

                } else {

                    problematicHeadings.push({
                        selector:
                            getElementSelector(
                                current.element
                            ),

                        description:
                            `Título ${current.element.tagName.toLowerCase()} apresenta hierarquia inadequada.`
                    });
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
            classification = "Adequado";
        } else if (score >= 5.0) {
            classification = "Atenção";
        } else {
            classification = "Problema";
        }

        return {
            id: "A06",
            category: "accessibility",
            name: "Hierarquia de títulos",
            score: score,
            classification: classification,

            evaluated: total,

            adequate: adequate,

            evidence: [
                `Títulos avaliados: ${total}`,
                `Títulos com hierarquia adequada: ${adequate}`,
                `Títulos com hierarquia inadequada: ${problematicHeadings.length}`
            ],

            elements:
                problematicHeadings,

            recommendation:
                problematicHeadings.length > 0
                    ? "Organize os títulos em uma sequência hierárquica adequada, evitando saltos de níveis."
                    : "Mantenha uma hierarquia de títulos organizada e consistente."
        };
    };


function getElementSelector(element) {

    if (element.id) {
        return `#${CSS.escape(element.id)}`;
    }

    if (element.classList.length > 0) {

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