globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A08 =
    function evaluateA08() {

        const components =
            document.querySelectorAll(
                "button, input, select, textarea, [role='button'], [role='checkbox'], [role='radio'], [role='switch'], [role='tab']"
            );

        const evaluatedComponents = [];

        components.forEach((component) => {

            const type =
                component.getAttribute("type");

            if (
                component.tagName.toLowerCase() === "input" &&
                type === "hidden"
            ) {
                return;
            }

            evaluatedComponents.push(component);
        });

        const total =
            evaluatedComponents.length;

        if (total === 0) {

            return {
                id: "A08",
                category: "accessibility",
                name: "Contraste de componentes",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Nenhum componente gráfico interativo foi identificado na página."
                ],

                elements: [],

                recommendation:
                    "Não há componentes gráficos interativos que necessitem de avaliação."
            };
        }

        let adequate = 0;

        const problematicComponents = [];

        evaluatedComponents.forEach((component) => {

            const style =
                window.getComputedStyle(component);

            const componentColor =
                getComponentColor(
                    component,
                    style
                );

            const backgroundColor =
                getEffectiveBackgroundColor(
                    component
                );

            if (
                !componentColor ||
                !backgroundColor
            ) {
                return;
            }

            const contrast =
                calculateContrastRatio(
                    componentColor,
                    backgroundColor
                );

            const isAdequate =
                contrast >= 3;

            if (isAdequate) {

                adequate++;

            } else {

                problematicComponents.push({
                    selector:
                        getElementSelector(
                            component
                        ),

                    description:
                        `Contraste de ${contrast.toFixed(2)}:1, inferior ao mínimo de 3:1.`,

                    contrast:
                        Number(
                            contrast.toFixed(2)
                        )
                });
            }
        });

        const evaluated =
            adequate +
            problematicComponents.length;

        if (evaluated === 0) {

            return {
                id: "A08",
                category: "accessibility",
                name: "Contraste de componentes",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Não foi possível identificar componentes com cores avaliáveis."
                ],

                elements: [],

                recommendation:
                    "Mantenha os componentes com cores definidas de forma que permitam a avaliação do contraste."
            };
        }

        const score =
            Number(
                (
                    (adequate / evaluated) * 10
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
            id: "A08",
            category: "accessibility",
            name: "Contraste de componentes",

            score: score,

            classification:
                classification,

            evaluated:
                evaluated,

            adequate:
                adequate,

            evidence: [
                `Componentes avaliados: ${evaluated}`,
                `Componentes com contraste adequado: ${adequate}`,
                `Componentes com contraste inadequado: ${problematicComponents.length}`,
                "Referência adotada: contraste mínimo de 3:1 para componentes gráficos relevantes."
            ],

            elements:
                problematicComponents,

            recommendation:
                problematicComponents.length > 0
                    ? "Aumente o contraste dos componentes gráficos relevantes para atingir pelo menos 3:1 em relação ao fundo."
                    : "Mantenha contraste suficiente entre os componentes gráficos e seus respectivos fundos."
        };
    };


function getComponentColor(
    element,
    style
) {

    /*
     * Para componentes preenchidos,
     * utiliza a cor de fundo do próprio componente.
     *
     * Para componentes sem preenchimento,
     * utiliza a cor da borda.
     *
     * Caso não exista borda relevante,
     * utiliza a cor do texto.
     */

    const background =
        parseColor(
            style.backgroundColor
        );

    if (
        background &&
        background.a > 0
    ) {

        return background;
    }


    const borderColors = [
        style.borderTopColor,
        style.borderRightColor,
        style.borderBottomColor,
        style.borderLeftColor
    ];

    for (
        const borderColor of borderColors
    ) {

        const parsedBorder =
            parseColor(borderColor);

        if (
            parsedBorder &&
            parsedBorder.a > 0
        ) {

            return parsedBorder;
        }
    }


    return parseColor(
        style.color
    );
}


function getEffectiveBackgroundColor(
    element
) {

    /*
     * O fundo utilizado para a comparação
     * é o primeiro fundo não transparente
     * encontrado fora do componente.
     *
     * Dessa forma, quando o componente possui
     * fundo próprio, ele não é comparado
     * contra ele mesmo.
     */

    let current =
        element.parentElement;

    while (current) {

        const style =
            window.getComputedStyle(
                current
            );

        const background =
            parseColor(
                style.backgroundColor
            );

        if (
            background &&
            background.a > 0
        ) {

            return background;
        }

        current =
            current.parentElement;
    }


    /*
     * Caso nenhum elemento ancestral
     * possua uma cor de fundo definida,
     * considera-se o fundo padrão branco.
     */

    return {
        r: 255,
        g: 255,
        b: 255,
        a: 1
    };
}


function parseColor(color) {

    if (!color) {
        return null;
    }


    /*
     * rgb()
     */

    const rgb =
        color.match(
            /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/
        );

    if (rgb) {

        return {
            r: Number(rgb[1]),
            g: Number(rgb[2]),
            b: Number(rgb[3]),
            a: 1
        };
    }


    /*
     * rgba()
     */

    const rgba =
        color.match(
            /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/
        );

    if (rgba) {

        return {
            r: Number(rgba[1]),
            g: Number(rgba[2]),
            b: Number(rgba[3]),
            a: Number(rgba[4])
        };
    }


    return null;
}


function calculateContrastRatio(
    foreground,
    background
) {

    const foregroundLuminance =
        getRelativeLuminance(
            foreground
        );

    const backgroundLuminance =
        getRelativeLuminance(
            background
        );

    const lighter =
        Math.max(
            foregroundLuminance,
            backgroundLuminance
        );

    const darker =
        Math.min(
            foregroundLuminance,
            backgroundLuminance
        );

    return (
        (lighter + 0.05) /
        (darker + 0.05)
    );
}


function getRelativeLuminance(
    color
) {

    const values = [
        color.r,
        color.g,
        color.b
    ].map((value) => {

        const channel =
            value / 255;

        return channel <= 0.03928
            ? channel / 12.92
            : Math.pow(
                (
                    channel + 0.055
                ) / 1.055,
                2.4
            );
    });


    return (
        0.2126 * values[0] +
        0.7152 * values[1] +
        0.0722 * values[2]
    );
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