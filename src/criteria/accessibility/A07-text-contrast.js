globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A07 =
    function evaluateA07() {

        const textElements =
            getTextElements();

        const total =
            textElements.length;

        if (total === 0) {

            return {
                id: "A07",
                category: "accessibility",
                name: "Contraste de texto",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Nenhum elemento textual visível foi identificado na página."
                ],

                elements: [],

                recommendation:
                    "Não há elementos textuais que necessitem de avaliação."
            };
        }

        let adequate = 0;

        const problematicTexts = [];

        textElements.forEach((element) => {

            const style =
                window.getComputedStyle(element);

            const textColor =
                parseColor(style.color);

            const backgroundColor =
                getEffectiveBackgroundColor(element);

            if (
                !textColor ||
                !backgroundColor
            ) {
                return;
            }

            const contrast =
                calculateContrastRatio(
                    textColor,
                    backgroundColor
                );

            const fontSize =
                parseFloat(style.fontSize);

            const fontWeight =
                parseInt(style.fontWeight, 10);

            const isLargeText =
                fontSize >= 24 ||
                (
                    fontSize >= 18.66 &&
                    fontWeight >= 700
                );

            const minimumContrast =
                isLargeText
                    ? 3
                    : 4.5;

            const isAdequate =
                contrast >= minimumContrast;

            if (isAdequate) {

                adequate++;

            } else {

                problematicTexts.push({
                    selector:
                        getElementSelector(element),

                    description:
                        `Contraste de ${contrast.toFixed(2)}:1, inferior ao mínimo de ${minimumContrast}:1.`,

                    contrast:
                        Number(
                            contrast.toFixed(2)
                        )
                });
            }
        });

        /*
         * Alguns elementos podem não ter sido
         * avaliados por não ser possível determinar
         * suas cores de forma confiável.
         */
        const evaluated =
            adequate +
            problematicTexts.length;

        if (evaluated === 0) {

            return {
                id: "A07",
                category: "accessibility",
                name: "Contraste de texto",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,

                evidence: [
                    "Não foi possível identificar elementos textuais com cores de primeiro plano e fundo avaliáveis."
                ],

                elements: [],

                recommendation:
                    "Mantenha cores de texto e fundo definidas de forma que permitam a avaliação do contraste."
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
            id: "A07",
            category: "accessibility",
            name: "Contraste de texto",
            score: score,
            classification: classification,

            evaluated: evaluated,

            adequate: adequate,

            evidence: [
                `Textos avaliados: ${evaluated}`,
                `Textos com contraste adequado: ${adequate}`,
                `Textos com contraste inadequado: ${problematicTexts.length}`,
                "Referência adotada: WCAG 2.2 nível AA."
            ],

            elements:
                problematicTexts,

            recommendation:
                problematicTexts.length > 0
                    ? "Aumente o contraste entre o texto e o fundo para atingir pelo menos 4,5:1 para texto normal ou 3:1 para texto grande."
                    : "Mantenha contraste suficiente entre textos e seus respectivos fundos."
        };
    };


function getTextElements() {

    const allElements =
        document.querySelectorAll(
            "body *"
        );

    const elements = [];

    allElements.forEach((element) => {

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

        const text =
            getDirectText(element);

        if (!text) {
            return;
        }

        elements.push(element);
    });

    return elements;
}


function getDirectText(element) {

    let text = "";

    element.childNodes.forEach((node) => {

        if (
            node.nodeType === Node.TEXT_NODE
        ) {
            text += node.textContent;
        }
    });

    return text.trim();
}


function getEffectiveBackgroundColor(element) {

    let current =
        element;

    while (current) {

        const style =
            window.getComputedStyle(current);

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
     * Se nenhum elemento possuir fundo
     * definido, considera-se o fundo padrão
     * branco para a avaliação.
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

    const rgb =
        color.match(
            /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/
        );

    if (rgb) {

        return {
            r: Number(rgb[1]),
            g: Number(rgb[2]),
            b: Number(rgb[3]),
            a:
                rgb[4] !== undefined
                    ? Number(rgb[4])
                    : 1
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


function getRelativeLuminance(color) {

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