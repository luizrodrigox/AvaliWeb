globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A12 =
    function evaluateA12() {

        const viewport =
            document.querySelector(
                'meta[name="viewport"]'
            );

        /*
         * Verifica se a meta viewport existe.
         */
        if (!viewport) {

            return {
                id: "A12",
                category: "accessibility",
                name: "Meta viewport",
                score: 0,
                classification: "Problema",
                evaluated: 1,
                adequate: 0,

                evidence: [
                    "A meta viewport não foi identificada na página."
                ],

                elements: [
                    {
                        selector:
                            "meta[name=\"viewport\"]",

                        description:
                            "A página não possui uma meta viewport configurada."
                    }
                ],

                recommendation:
                    "Adicione uma meta viewport adequada, como <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">."
            };
        }

        const content =
            viewport.getAttribute(
                "content"
            );

        /*
         * Caso o atributo content esteja ausente
         * ou vazio, a configuração é considerada
         * inadequada.
         */
        if (
            !content ||
            content.trim().length === 0
        ) {

            return {
                id: "A12",
                category: "accessibility",
                name: "Meta viewport",
                score: 0,
                classification: "Problema",
                evaluated: 1,
                adequate: 0,

                evidence: [
                    "A meta viewport foi identificada, mas o atributo content está ausente ou vazio."
                ],

                elements: [
                    {
                        selector:
                            "meta[name=\"viewport\"]",

                        description:
                            "Meta viewport sem configuração adequada no atributo content."
                    }
                ],

                recommendation:
                    "Configure o atributo content da meta viewport com width=device-width e initial-scale=1."
            };
        }

        /*
         * Normaliza o conteúdo para facilitar
         * a identificação das configurações.
         */
        const normalizedContent =
            content
                .toLowerCase()
                .replace(/\s/g, "");

        /*
         * Verifica width=device-width.
         */
        const hasDeviceWidth =
            /(?:^|,)width=device-width(?:,|$)/.test(
                normalizedContent
            );

        /*
         * Verifica initial-scale=1 ou initial-scale=1.0.
         */
        const hasInitialScale =
            /(?:^|,)initial-scale=1(?:\.0)?(?:,|$)/.test(
                normalizedContent
            );

        const valid =
            hasDeviceWidth &&
            hasInitialScale;

        /*
         * Configuração adequada.
         */
        if (valid) {

            return {
                id: "A12",
                category: "accessibility",
                name: "Meta viewport",
                score: 10,
                classification: "Adequado",
                evaluated: 1,
                adequate: 1,

                evidence: [
                    `Meta viewport identificada: ${content}`,
                    "Configuração width=device-width identificada.",
                    "Configuração initial-scale=1 identificada."
                ],

                elements: [],

                recommendation:
                    "Mantenha a meta viewport configurada para adaptar a página às diferentes larguras de dispositivos."
            };
        }

        /*
         * Configuração inadequada.
         */
        const problems = [];

        if (!hasDeviceWidth) {
            problems.push(
                "width=device-width não identificado."
            );
        }

        if (!hasInitialScale) {
            problems.push(
                "initial-scale=1 não identificado."
            );
        }

        return {
            id: "A12",
            category: "accessibility",
            name: "Meta viewport",
            score: 0,
            classification: "Problema",
            evaluated: 1,
            adequate: 0,

            evidence: [
                `Meta viewport identificada: ${content}`,
                ...problems
            ],

            elements: [
                {
                    selector:
                        "meta[name=\"viewport\"]",

                    description:
                        "Meta viewport identificada, mas com configuração inadequada."
                }
            ],

            recommendation:
                "Configure a meta viewport com width=device-width e initial-scale=1 para favorecer a adaptação da interface a diferentes dispositivos."
        };
    };