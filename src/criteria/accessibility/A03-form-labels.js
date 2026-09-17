globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A03 =
    function evaluateA03() {

        const fields =
            document.querySelectorAll(
                "input, select, textarea"
            );

        const evaluatedFields = [];

        fields.forEach((field) => {

            const type =
                field.getAttribute("type");

            if (type === "hidden") {
                return;
            }

            evaluatedFields.push(field);
        });

        const total =
            evaluatedFields.length;

        if (total === 0) {

            return {
                id: "A03",
                category: "accessibility",
                name: "Labels em formulários",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Nenhum campo de formulário foi identificado na página."
                ],

                elements: [],

                recommendation:
                    "Não há campos de formulário que necessitem de avaliação."
            };
        }

        let adequate = 0;

        const problematicFields = [];

        evaluatedFields.forEach((field) => {

            const id =
                field.getAttribute("id");

            const ariaLabel =
                field.getAttribute("aria-label");

            const ariaLabelledby =
                field.getAttribute(
                    "aria-labelledby"
                );

            let hasAccessibleName = false;

            /*
             * aria-label
             */
            if (
                ariaLabel &&
                ariaLabel.trim().length > 0
            ) {
                hasAccessibleName = true;
            }

            /*
             * aria-labelledby
             */
            if (
                !hasAccessibleName &&
                ariaLabelledby &&
                ariaLabelledby.trim().length > 0
            ) {

                const ids =
                    ariaLabelledby
                        .trim()
                        .split(/\s+/);

                const hasReferencedText =
                    ids.some((referenceId) => {

                        const element =
                            document.getElementById(
                                referenceId
                            );

                        return (
                            element &&
                            element.textContent
                                .trim()
                                .length > 0
                        );
                    });

                if (hasReferencedText) {
                    hasAccessibleName = true;
                }
            }

            /*
             * label[for]
             */
            if (
                !hasAccessibleName &&
                id
            ) {

                const label =
                    document.querySelector(
                        `label[for="${CSS.escape(id)}"]`
                    );

                if (
                    label &&
                    label.textContent
                        .trim()
                        .length > 0
                ) {
                    hasAccessibleName = true;
                }
            }

            /*
             * Campo dentro de <label>
             */
            if (!hasAccessibleName) {

                const parentLabel =
                    field.closest("label");

                if (
                    parentLabel &&
                    parentLabel.textContent
                        .trim()
                        .length > 0
                ) {
                    hasAccessibleName = true;
                }
            }

            if (hasAccessibleName) {

                adequate++;

            } else {

                problematicFields.push({
                    selector:
                        getElementSelector(field),

                    description:
                        "Campo de formulário sem label, aria-label ou aria-labelledby associado."
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
            id: "A03",
            category: "accessibility",
            name: "Labels em formulários",
            score: score,
            classification: classification,

            evaluated: total,

            adequate: adequate,

            evidence: [
                `Campos avaliados: ${total}`,
                `Campos com nome acessível: ${adequate}`,
                `Campos sem nome acessível: ${problematicFields.length}`
            ],

            elements:
                problematicFields,

            recommendation:
                problematicFields.length > 0
                    ? "Associe os campos de formulário a um elemento label, aria-label ou aria-labelledby."
                    : "Mantenha os campos de formulário associados a nomes acessíveis."
        };
    };


function getElementSelector(element) {

    if (element.id) {
        return `#${CSS.escape(element.id)}`;
    }

    if (element.name) {
        return `${element.tagName.toLowerCase()}[name="${CSS.escape(element.name)}"]`;
    }

    return element.tagName.toLowerCase();
}