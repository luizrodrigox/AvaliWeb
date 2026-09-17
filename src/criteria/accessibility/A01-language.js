globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A01 =
    function evaluateA01() {

        const html =
            document.documentElement;

        const lang =
            html.getAttribute("lang");

        const valid =
            lang !== null &&
            lang.trim().length > 0;

        const score =
            valid ? 10 : 0;

        return {
            id: "A01",
            category: "accessibility",
            name: "Idioma da página",
            score: score,
            classification:
                valid
                    ? "Adequado"
                    : "Problema",

            evaluated: 1,

            adequate:
                valid ? 1 : 0,

            evidence: [
                valid
                    ? `Idioma identificado: ${lang}`
                    : "Atributo lang não identificado."
            ],

            elements:
                valid
                    ? []
                    : [
                        {
                            selector: "html",
                            description:
                                "Elemento html sem atributo lang válido."
                        }
                    ],

            recommendation:
                valid
                    ? "Mantenha o atributo lang definido corretamente."
                    : "Defina o atributo lang no elemento HTML."
        };
    };