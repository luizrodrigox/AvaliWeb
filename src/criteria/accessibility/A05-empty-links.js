globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A05 =
    function evaluateA05() {

        const links =
            document.querySelectorAll("a");

        const total =
            links.length;

        if (total === 0) {

            return {
                id: "A05",
                category: "accessibility",
                name: "Links sem texto",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Nenhum link foi identificado na página."
                ],

                elements: [],

                recommendation:
                    "Não há links que necessitem de avaliação."
            };
        }

        let adequate = 0;

        const problematicLinks = [];

        links.forEach((link) => {

            const accessibleName =
                getAccessibleName(link);

            if (
                accessibleName &&
                accessibleName.trim().length > 0
            ) {

                adequate++;

            } else {

                problematicLinks.push({
                    selector:
                        getElementSelector(link),

                    description:
                        "Link sem texto ou nome acessível que permita compreender sua finalidade."
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
            id: "A05",
            category: "accessibility",
            name: "Links sem texto",
            score: score,
            classification: classification,

            evaluated: total,

            adequate: adequate,

            evidence: [
                `Links avaliados: ${total}`,
                `Links com nome acessível: ${adequate}`,
                `Links sem nome acessível: ${problematicLinks.length}`
            ],

            elements:
                problematicLinks,

            recommendation:
                problematicLinks.length > 0
                    ? "Adicione texto descritivo ou um nome acessível aos links para indicar claramente sua finalidade."
                    : "Mantenha os links com textos ou nomes acessíveis e descritivos."
        };
    };


function getAccessibleName(element) {

    const ariaLabel =
        element.getAttribute("aria-label");

    if (
        ariaLabel &&
        ariaLabel.trim().length > 0
    ) {
        return ariaLabel.trim();
    }

    const ariaLabelledby =
        element.getAttribute(
            "aria-labelledby"
        );

    if (
        ariaLabelledby &&
        ariaLabelledby.trim().length > 0
    ) {

        const ids =
            ariaLabelledby
                .trim()
                .split(/\s+/);

        const text =
            ids
                .map((id) => {

                    const referenced =
                        document.getElementById(id);

                    return referenced
                        ? referenced.textContent.trim()
                        : "";

                })
                .filter(Boolean)
                .join(" ");

        if (text.length > 0) {
            return text;
        }
    }

    const text =
        element.textContent
            ? element.textContent.trim()
            : "";

    if (text.length > 0) {
        return text;
    }

    return "";
}


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