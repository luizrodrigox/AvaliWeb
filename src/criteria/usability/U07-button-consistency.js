globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.U07 =
    function evaluateU07() {

        /*
         * =========================================================
         * U07 — CONSISTÊNCIA DOS BOTÕES
         * =========================================================
         *
         * Base:
         * - Nielsen / UX
         *
         * Regra:
         * Comparar características visuais de botões semelhantes,
         * considerando:
         * - tamanho
         * - fonte
         * - cor
         * - borda
         * - raio da borda
         *
         * Pontuação:
         * (elementos consistentes ÷ elementos avaliados) × 10
         */

        const buttons = document.querySelectorAll(
            "button, input[type='button'], input[type='submit'], input[type='reset'], [role='button']"
        );

        const evaluatedButtons = [];

        /*
         * =========================================================
         * 1. FILTRA BOTÕES VISÍVEIS
         * =========================================================
         */

        buttons.forEach((button) => {

            const style =
                window.getComputedStyle(button);

            if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                parseFloat(style.opacity) === 0
            ) {
                return;
            }

            const rect =
                button.getBoundingClientRect();

            if (
                rect.width <= 0 ||
                rect.height <= 0
            ) {
                return;
            }

            evaluatedButtons.push(button);
        });

        const total =
            evaluatedButtons.length;

        /*
         * =========================================================
         * 2. CASO NÃO EXISTAM BOTÕES
         * =========================================================
         */

        if (total === 0) {

            return {
                id: "U07",
                category: "usability",
                name: "Consistência dos botões",
                score: 10,
                classification: "Adequado",
                evaluated: 0,
                adequate: 0,
                evidence: [
                    "Nenhum botão visível foi identificado para avaliação."
                ],
                elements: [],
                recommendation:
                    "Não há botões visíveis que necessitem de avaliação."
            };
        }

        /*
         * =========================================================
         * 3. OBTÉM AS CARACTERÍSTICAS VISUAIS
         * =========================================================
         */

        const buttonStyles =
            evaluatedButtons.map((button) => {

                const style =
                    window.getComputedStyle(button);

                const rect =
                    button.getBoundingClientRect();

                return {
                    element: button,

                    width:
                        Math.round(rect.width),

                    height:
                        Math.round(rect.height),

                    fontFamily:
                        normalizeFontFamily(
                            style.fontFamily
                        ),

                    fontSize:
                        normalizeNumber(
                            style.fontSize
                        ),

                    fontWeight:
                        normalizeFontWeight(
                            style.fontWeight
                        ),

                    color:
                        normalizeColor(
                            style.color
                        ),

                    backgroundColor:
                        normalizeColor(
                            style.backgroundColor
                        ),

                    borderStyle:
                        style.borderStyle,

                    borderWidth:
                        normalizeNumber(
                            style.borderWidth
                        ),

                    borderColor:
                        normalizeColor(
                            style.borderColor
                        ),

                    borderRadius:
                        normalizeNumber(
                            style.borderRadius
                        )
                };
            });

        /*
         * =========================================================
         * 4. IDENTIFICA O PADRÃO VISUAL DOS BOTÕES
         * =========================================================
         *
         * O padrão utilizado é o conjunto de características
         * mais frequente entre os botões avaliados.
         *
         * Isso permite verificar se os demais botões seguem
         * o padrão visual predominante da interface.
         */

        const styleGroups =
            new Map();

        buttonStyles.forEach((item) => {

            const key =
                createStyleKey(item);

            if (!styleGroups.has(key)) {
                styleGroups.set(key, []);
            }

            styleGroups
                .get(key)
                .push(item);
        });

        let referenceGroup = [];

        styleGroups.forEach((group) => {

            if (
                group.length >
                referenceGroup.length
            ) {
                referenceGroup = group;
            }

        });

        /*
         * =========================================================
         * 5. AVALIA CONSISTÊNCIA
         * =========================================================
         */

        let adequate = 0;

        const problematicElements = [];

        buttonStyles.forEach((item) => {

            const isConsistent =
                isVisuallyConsistent(
                    item,
                    referenceGroup[0]
                );

            if (isConsistent) {

                adequate++;

            } else {

                const differences =
                    getStyleDifferences(
                        item,
                        referenceGroup[0]
                    );

                problematicElements.push({
                    selector:
                        getElementSelector(
                            item.element
                        ),

                    description:
                        `Botão apresenta características visuais diferentes do padrão predominante: ${differences.join(", ")}.`
                });
            }
        });

        /*
         * =========================================================
         * 6. CALCULA A PONTUAÇÃO
         * =========================================================
         */

        const score =
            Number(
                (
                    (adequate / total) *
                    10
                ).toFixed(1)
            );

        let classification;

        if (score >= 9.0) {

            classification =
                "Adequado";

        } else if (score >= 5.0) {

            classification =
                "Atenção";

        } else {

            classification =
                "Problema";
        }

        /*
         * =========================================================
         * 7. RETORNO DO CRITÉRIO
         * =========================================================
         */

        return {

            id: "U07",

            category:
                "usability",

            name:
                "Consistência dos botões",

            score:
                score,

            classification:
                classification,

            evaluated:
                total,

            adequate:
                adequate,

            evidence: [

                `Botões avaliados: ${total}`,

                `Botões consistentes: ${adequate}`,

                `Botões com inconsistências: ${problematicElements.length}`,

                `Pontuação: ${score}/10`

            ],

            elements:
                problematicElements,

            recommendation:

                problematicElements.length > 0

                    ? "Mantenha características visuais consistentes entre botões semelhantes, especialmente tamanho, fonte, cor, borda e raio da borda."

                    : "Mantenha a consistência visual entre os botões da interface, preservando padrões semelhantes de tamanho, fonte, cor, borda e raio."
        };
    };


/*
 * =============================================================
 * FUNÇÕES AUXILIARES
 * =============================================================
 */


/*
 * Normaliza valores numéricos em pixels.
 */

function normalizeNumber(value) {

    const number =
        parseFloat(value);

    return Number.isFinite(number)
        ? Math.round(number * 100) / 100
        : 0;
}


/*
 * Normaliza peso da fonte.
 */

function normalizeFontWeight(value) {

    if (value === "normal") {
        return "400";
    }

    if (value === "bold") {
        return "700";
    }

    return value;
}


/*
 * Normaliza família tipográfica.
 */

function normalizeFontFamily(value) {

    return value
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}


/*
 * Normaliza cores RGB/RGBA.
 */

function normalizeColor(value) {

    return value
        .toLowerCase()
        .replace(/\s+/g, "")
        .trim();
}


/*
 * Cria uma chave representando o padrão visual
 * do botão.
 */

function createStyleKey(item) {

    return [

        item.width,

        item.height,

        item.fontFamily,

        item.fontSize,

        item.fontWeight,

        item.color,

        item.backgroundColor,

        item.borderStyle,

        item.borderWidth,

        item.borderColor,

        item.borderRadius

    ].join("|");
}


/*
 * Verifica se um botão segue o padrão visual
 * predominante.
 */

function isVisuallyConsistent(
    item,
    reference
) {

    if (!reference) {
        return true;
    }

    return (

        item.width ===
            reference.width &&

        item.height ===
            reference.height &&

        item.fontFamily ===
            reference.fontFamily &&

        item.fontSize ===
            reference.fontSize &&

        item.fontWeight ===
            reference.fontWeight &&

        item.color ===
            reference.color &&

        item.backgroundColor ===
            reference.backgroundColor &&

        item.borderStyle ===
            reference.borderStyle &&

        item.borderWidth ===
            reference.borderWidth &&

        item.borderColor ===
            reference.borderColor &&

        item.borderRadius ===
            reference.borderRadius
    );
}


/*
 * Identifica quais características diferem
 * do padrão predominante.
 */

function getStyleDifferences(
    item,
    reference
) {

    if (!reference) {
        return [];
    }

    const differences = [];

    if (
        item.width !==
        reference.width
    ) {
        differences.push("tamanho");
    }

    if (
        item.height !==
        reference.height
    ) {
        if (
            !differences.includes("tamanho")
        ) {
            differences.push("tamanho");
        }
    }

    if (
        item.fontFamily !==
        reference.fontFamily
    ) {
        differences.push("família da fonte");
    }

    if (
        item.fontSize !==
        reference.fontSize
    ) {
        differences.push("tamanho da fonte");
    }

    if (
        item.fontWeight !==
        reference.fontWeight
    ) {
        differences.push("peso da fonte");
    }

    if (
        item.color !==
        reference.color
    ) {
        differences.push("cor do texto");
    }

    if (
        item.backgroundColor !==
        reference.backgroundColor
    ) {
        differences.push("cor de fundo");
    }

    if (
        item.borderStyle !==
        reference.borderStyle
    ) {
        differences.push("estilo da borda");
    }

    if (
        item.borderWidth !==
        reference.borderWidth
    ) {
        differences.push("espessura da borda");
    }

    if (
        item.borderColor !==
        reference.borderColor
    ) {
        differences.push("cor da borda");
    }

    if (
        item.borderRadius !==
        reference.borderRadius
    ) {
        differences.push("raio da borda");
    }

    return differences;
}


/*
 * Retorna um seletor CSS simples para o elemento.
 */

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
            .map(
                (className) =>
                    CSS.escape(
                        className
                    )
            )
            .join(".")}`;
    }

    return element.tagName
        .toLowerCase();
}