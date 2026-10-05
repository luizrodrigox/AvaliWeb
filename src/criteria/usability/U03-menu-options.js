globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.U03 =
    function evaluateU03() {

        /*
         * =========================================================
         * U03 — QUANTIDADE DE OPÇÕES EM MENUS
         * =========================================================
         *
         * Base:
         * Lei de Hick.
         *
         * Faixas definidas pelo projeto:
         *
         * <= 4   -> 10
         * 5–7    -> 8
         * 8–10   -> 6
         * 11–15  -> 4
         * > 15   -> 2
         *
         * O critério avalia menus de navegação e suas opções
         * disponíveis ao usuário.
         */

        const menus = document.querySelectorAll(
            "nav, [role='navigation'], menu"
        );

        const evaluatedMenus = [];

        menus.forEach((menu) => {

            const style =
                window.getComputedStyle(menu);

            /*
             * Ignora menus que não estão visíveis.
             */
            if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                parseFloat(style.opacity) === 0
            ) {
                return;
            }

            /*
             * Procura as opções diretamente relacionadas
             * ao menu.
             *
             * São considerados links e elementos com funções
             * de menu/opção.
             */
            const options = menu.querySelectorAll(
                ":scope a[href], " +
                ":scope [role='menuitem'], " +
                ":scope [role='option']"
            );

            const visibleOptions = [];

            options.forEach((option) => {

                const optionStyle =
                    window.getComputedStyle(option);

                if (
                    optionStyle.display === "none" ||
                    optionStyle.visibility === "hidden" ||
                    parseFloat(optionStyle.opacity) === 0
                ) {
                    return;
                }

                visibleOptions.push(option);
            });

            /*
             * Evita considerar estruturas sem opções.
             */
            if (visibleOptions.length === 0) {
                return;
            }

            evaluatedMenus.push({
                element: menu,
                options: visibleOptions
            });
        });

        /*
         * =========================================================
         * CASO SEM MENUS
         * =========================================================
         */

        if (evaluatedMenus.length === 0) {
            return {
                id: "U03",
                category: "usability",
                name: "Quantidade de opções em menus",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,
                evidence: [
                    "Nenhum menu de navegação visível foi identificado para avaliação."
                ],
                elements: [],
                recommendation:
                    "Não foram identificados menus de navegação que necessitem de avaliação."
            };
        }

        /*
         * =========================================================
         * AVALIAÇÃO DOS MENUS
         * =========================================================
         */

        const problematicMenus = [];

        let totalOptions = 0;
        let adequateMenus = 0;

        evaluatedMenus.forEach((menuData) => {

            const optionCount =
                menuData.options.length;

            totalOptions += optionCount;

            let menuScore;

            /*
             * Faixas definidas na tabela do projeto.
             */
            if (optionCount <= 4) {
                menuScore = 10;
            } else if (optionCount <= 7) {
                menuScore = 8;
            } else if (optionCount <= 10) {
                menuScore = 6;
            } else if (optionCount <= 15) {
                menuScore = 4;
            } else {
                menuScore = 2;
            }

            if (menuScore >= 9) {
                adequateMenus++;
            } else {
                problematicMenus.push({
                    selector:
                        getElementSelector(
                            menuData.element
                        ),
                    description:
                        `Menu com ${optionCount} opções, acima do limite de 4 opções definido como faixa adequada.`
                });
            }
        });

        /*
         * =========================================================
         * PONTUAÇÃO FINAL
         * =========================================================
         *
         * A pontuação final corresponde à média das notas
         * obtidas pelos menus avaliados.
         */

        const menuScores =
            evaluatedMenus.map((menuData) => {

                const count =
                    menuData.options.length;

                if (count <= 4) {
                    return 10;
                }

                if (count <= 7) {
                    return 8;
                }

                if (count <= 10) {
                    return 6;
                }

                if (count <= 15) {
                    return 4;
                }

                return 2;
            });

        const score =
            Number(
                (
                    menuScores.reduce(
                        (sum, value) =>
                            sum + value,
                        0
                    ) /
                    menuScores.length
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

        /*
         * =========================================================
         * RESULTADO
         * =========================================================
         */

        return {
            id: "U03",
            category: "usability",
            name: "Quantidade de opções em menus",
            score: score,
            classification: classification,
            evaluated: evaluatedMenus.length,
            adequate: adequateMenus,

            evidence: [
                `Menus avaliados: ${evaluatedMenus.length}`,
                `Opções de menu identificadas: ${totalOptions}`,
                `Menus dentro da faixa adequada: ${adequateMenus}`,
                `Menus com quantidade elevada de opções: ${problematicMenus.length}`,
                "Faixas adotadas: até 4 opções = 10; 5–7 = 8; 8–10 = 6; 11–15 = 4; acima de 15 = 2.",
                `Pontuação: ${score}/10`
            ],

            elements:
                problematicMenus,

            recommendation:
                problematicMenus.length > 0
                    ? "Reduza ou reorganize a quantidade de opções nos menus que apresentam excesso de alternativas, utilizando agrupamentos ou submenus quando necessário para diminuir a complexidade da escolha."
                    : "Mantenha os menus com quantidade de opções dentro das faixas de menor complexidade e organize as opções de forma clara e consistente."
        };
    };


/*
 * =========================================================
 * SELETOR DE ELEMENTOS
 * =========================================================
 */

function getElementSelector(element) {

    if (element.id) {
        return `#${CSS.escape(element.id)}`;
    }

    if (element.getAttribute("name")) {
        return `${element.tagName.toLowerCase()}[name="${CSS.escape(
            element.getAttribute("name")
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
                    CSS.escape(className)
            )
            .join(".")}`;
    }

    return element.tagName.toLowerCase();
}