globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A04 =
    function evaluateA04() {

        const controls =
            document.querySelectorAll(
                "button, a, input, select, textarea, [role='button'], [role='link'], [role='checkbox'], [role='radio'], [role='switch'], [role='tab'], [role='menuitem']"
            );

        const evaluatedControls = [];

        controls.forEach((control) => {

            const type =
                control.getAttribute("type");

            if (
                control.tagName.toLowerCase() === "input" &&
                type === "hidden"
            ) {
                return;
            }

            evaluatedControls.push(control);
        });

        const total =
            evaluatedControls.length;

        if (total === 0) {

            return {
                id: "A04",
                category: "accessibility",
                name: "Nome acessível",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Nenhum controle interativo foi identificado na página."
                ],

                elements: [],

                recommendation:
                    "Não há controles interativos que necessitem de avaliação."
            };
        }

        let adequate = 0;

        const problematicControls = [];

        evaluatedControls.forEach((control) => {

            const accessibleName =
                getAccessibleName(control);

            if (
                accessibleName &&
                accessibleName.trim().length > 0
            ) {

                adequate++;

            } else {

                problematicControls.push({
                    selector:
                        getElementSelector(control),

                    description:
                        "Controle interativo sem nome acessível."
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
            id: "A04",
            category: "accessibility",
            name: "Nome acessível",
            score: score,
            classification: classification,

            evaluated: total,

            adequate: adequate,

            evidence: [
                `Controles avaliados: ${total}`,
                `Controles com nome acessível: ${adequate}`,
                `Controles sem nome acessível: ${problematicControls.length}`
            ],

            elements:
                problematicControls,

            recommendation:
                problematicControls.length > 0
                    ? "Adicione um nome acessível aos controles utilizando texto visível, aria-label ou aria-labelledby."
                    : "Mantenha os controles interativos com nomes acessíveis."
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

    if (element.name) {
        return `${element.tagName.toLowerCase()}[name="${CSS.escape(element.name)}"]`;
    }

    return element.tagName.toLowerCase();
}