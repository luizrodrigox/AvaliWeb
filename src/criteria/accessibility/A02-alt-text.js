globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A02 =
    function evaluateA02() {

        const images =
            document.querySelectorAll("img");

        const total =
            images.length;

        if (total === 0) {

            return {
                id: "A02",
                category: "accessibility",
                name: "Texto alternativo em imagens",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Nenhuma imagem foi identificada na página."
                ],

                elements: [],

                recommendation:
                    "Não há imagens que necessitem de avaliação."
            };
        }

        let adequate = 0;

        const problematicImages = [];

        images.forEach((image) => {

            const hasAlt =
                image.hasAttribute("alt");

            if (hasAlt) {

                adequate++;

            } else {

                problematicImages.push({
                    selector:
                        getElementSelector(image),

                    description:
                        "Imagem sem atributo alt."
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
            id: "A02",
            category: "accessibility",
            name: "Texto alternativo em imagens",
            score: score,
            classification: classification,

            evaluated: total,

            adequate: adequate,

            evidence: [
                `Imagens avaliadas: ${total}`,
                `Imagens com atributo alt: ${adequate}`,
                `Imagens sem atributo alt: ${problematicImages.length}`
            ],

            elements:
                problematicImages,

            recommendation:
                problematicImages.length > 0
                    ? "Adicione o atributo alt às imagens que transmitem informações relevantes. Imagens decorativas podem utilizar alt=\"\"."
                    : "Mantenha o atributo alt definido adequadamente nas imagens."
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