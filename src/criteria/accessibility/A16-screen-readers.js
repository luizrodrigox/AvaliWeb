globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWebCriteria =
    globalThis.AvaliWebCriteria || {};

globalThis.AvaliWebCriteria.A16 =
    function evaluateA16() {

        const subcriteria = [];

        const problematicElements = [];


        /*
         * =========================================================
         * SUBCRITÉRIO 1 — SEMÂNTICA HTML
         * =========================================================
         */

        const semanticElements =
            document.querySelectorAll(
                "main, nav, header, footer, aside, section, article"
            );

        const genericContainers =
            document.querySelectorAll(
                "div"
            );

        const totalSemanticCandidates =
            semanticElements.length +
            genericContainers.length;

        let semanticScore = 10;

        if (
            totalSemanticCandidates > 0
        ) {

            const semanticRatio =
                semanticElements.length /
                totalSemanticCandidates;

            semanticScore =
                Number(
                    (
                        semanticRatio * 10
                    ).toFixed(1)
                );
        }

        if (
            semanticElements.length === 0 &&
            genericContainers.length > 0
        ) {

            semanticScore = 0;
        }

        if (
            semanticScore < 10
        ) {

            genericContainers.forEach(
                (element) => {

                    if (
                        hasMeaningfulContent(
                            element
                        )
                    ) {

                        problematicElements.push({
                            selector:
                                getElementSelector(
                                    element
                                ),

                            description:
                                "Conteúdo agrupado em elemento genérico sem elemento semântico identificável."
                        });
                    }
                }
            );
        }

        subcriteria.push({
            name: "Semântica HTML",
            score: semanticScore,
            evaluated:
                totalSemanticCandidates,
            adequate:
                semanticElements.length
        });


        /*
         * =========================================================
         * SUBCRITÉRIO 2 — TEXTOS ALTERNATIVOS
         * =========================================================
         */

        const images =
            document.querySelectorAll(
                "img"
            );

        let altScore = 10;
        let adequateImages = 0;

        if (
            images.length > 0
        ) {

            images.forEach(
                (image) => {

                    if (
                        image.hasAttribute(
                            "alt"
                        )
                    ) {

                        adequateImages++;

                    } else {

                        problematicElements.push({
                            selector:
                                getElementSelector(
                                    image
                                ),

                            description:
                                "Imagem sem atributo alt, podendo dificultar sua interpretação por leitores de tela."
                        });
                    }
                }
            );

            altScore =
                Number(
                    (
                        (
                            adequateImages /
                            images.length
                        ) * 10
                    ).toFixed(1)
                );
        }

        subcriteria.push({
            name: "Textos alternativos",
            score: altScore,
            evaluated:
                images.length,
            adequate:
                adequateImages
        });


        /*
         * =========================================================
         * SUBCRITÉRIO 3 — LABELS DE FORMULÁRIOS
         * =========================================================
         */

        const fields =
            document.querySelectorAll(
                "input, select, textarea"
            );

        const evaluatedFields = [];

        fields.forEach(
            (field) => {

                const type =
                    field.getAttribute(
                        "type"
                    );

                if (
                    type !== "hidden"
                ) {

                    evaluatedFields.push(
                        field
                    );
                }
            }
        );

        let labelScore = 10;
        let adequateFields = 0;

        evaluatedFields.forEach(
            (field) => {

                if (
                    hasAccessibleName(
                        field
                    )
                ) {

                    adequateFields++;

                } else {

                    problematicElements.push({
                        selector:
                            getElementSelector(
                                field
                            ),

                        description:
                            "Campo de formulário sem nome acessível identificável para leitores de tela."
                    });
                }
            }
        );

        if (
            evaluatedFields.length > 0
        ) {

            labelScore =
                Number(
                    (
                        (
                            adequateFields /
                            evaluatedFields.length
                        ) * 10
                    ).toFixed(1)
                );
        }

        subcriteria.push({
            name: "Labels de formulários",
            score: labelScore,
            evaluated:
                evaluatedFields.length,
            adequate:
                adequateFields
        });


        /*
         * =========================================================
         * SUBCRITÉRIO 4 — HIERARQUIA DE HEADINGS
         * =========================================================
         */

        const headings =
            document.querySelectorAll(
                "h1, h2, h3, h4, h5, h6"
            );

        let headingScore = 10;
        let adequateHeadings = 0;

        if (
            headings.length > 0
        ) {

            const headingLevels =
                Array.from(
                    headings
                ).map(
                    (heading) =>
                        Number(
                            heading.tagName
                                .substring(1)
                        )
                );

            let previousLevel =
                headingLevels[0];

            let hierarchyProblems =
                0;

            headingLevels.forEach(
                (level, index) => {

                    if (
                        index === 0
                    ) {
                        return;
                    }

                    if (
                        level >
                        previousLevel + 1
                    ) {

                        hierarchyProblems++;
                    }

                    previousLevel =
                        level;
                }
            );

            adequateHeadings =
                headings.length -
                hierarchyProblems;

            headingScore =
                Number(
                    (
                        (
                            adequateHeadings /
                            headings.length
                        ) * 10
                    ).toFixed(1)
                );

            if (
                hierarchyProblems > 0
            ) {

                headings.forEach(
                    (heading) => {

                        problematicElements.push({
                            selector:
                                getElementSelector(
                                    heading
                                ),

                            description:
                                "Possível quebra na hierarquia estrutural dos títulos."
                        });
                    }
                );
            }
        }

        subcriteria.push({
            name: "Hierarquia de headings",
            score: headingScore,
            evaluated:
                headings.length,
            adequate:
                adequateHeadings
        });


        /*
         * =========================================================
         * SUBCRITÉRIO 5 — NOMES ACESSÍVEIS
         * =========================================================
         */

        const controls =
            document.querySelectorAll(
                "button, a[href], input, select, textarea, [role='button'], [role='link'], [role='checkbox'], [role='radio'], [role='switch'], [role='tab']"
            );

        const evaluatedControls = [];

        controls.forEach(
            (control) => {

                const type =
                    control.getAttribute(
                        "type"
                    );

                if (
                    type === "hidden"
                ) {
                    return;
                }

                const style =
                    window.getComputedStyle(
                        control
                    );

                if (
                    style.display === "none" ||
                    style.visibility === "hidden"
                ) {
                    return;
                }

                evaluatedControls.push(
                    control
                );
            }
        );

        let accessibleNameScore = 10;
        let adequateControls = 0;

        evaluatedControls.forEach(
            (control) => {

                if (
                    hasAccessibleName(
                        control
                    )
                ) {

                    adequateControls++;

                } else {

                    problematicElements.push({
                        selector:
                            getElementSelector(
                                control
                            ),

                        description:
                            "Controle sem nome acessível identificável para leitores de tela."
                    });
                }
            }
        );

        if (
            evaluatedControls.length > 0
        ) {

            accessibleNameScore =
                Number(
                    (
                        (
                            adequateControls /
                            evaluatedControls.length
                        ) * 10
                    ).toFixed(1)
                );
        }

        subcriteria.push({
            name: "Nomes acessíveis",
            score:
                accessibleNameScore,
            evaluated:
                evaluatedControls.length,
            adequate:
                adequateControls
        });


        /*
         * =========================================================
         * CÁLCULO FINAL
         * =========================================================
         */

        const totalSubcriteria =
            subcriteria.length;

        const totalScore =
            subcriteria.reduce(
                (sum, item) =>
                    sum + item.score,
                0
            );

        const score =
            Number(
                (
                    totalScore /
                    totalSubcriteria
                ).toFixed(1)
            );


        let classification;

        if (
            score >= 9.0
        ) {

            classification =
                "Adequado";

        } else if (
            score >= 5.0
        ) {

            classification =
                "Atenção";

        } else {

            classification =
                "Problema";
        }


        /*
         * Remove elementos duplicados.
         */

        const uniqueElements =
            removeDuplicateElements(
                problematicElements
            );


        return {

            id: "A16",

            category:
                "accessibility",

            name:
                "Suporte a leitores de tela",

            score:
                score,

            classification:
                classification,

            evaluated:
                totalSubcriteria,

            adequate:
                subcriteria.filter(
                    (item) =>
                        item.score >= 9
                ).length,

            evidence: [

                `Subcritérios avaliados: ${totalSubcriteria}`,

                `Pontuação de semântica HTML: ${semanticScore}`,

                `Pontuação de textos alternativos: ${altScore}`,

                `Pontuação de labels de formulários: ${labelScore}`,

                `Pontuação de hierarquia de headings: ${headingScore}`,

                `Pontuação de nomes acessíveis: ${accessibleNameScore}`,

                `Média final: ${score}/10`
            ],

            elements:
                uniqueElements.map(
                    (item) => ({
                        selector:
                            item.selector,

                        description:
                            item.description
                    })
                ),

            recommendation:
                uniqueElements.length > 0
                    ? "Utilize elementos HTML semânticos, textos alternativos, labels, hierarquia adequada de títulos e nomes acessíveis para facilitar a interpretação da interface por leitores de tela."
                    : "Mantenha a estrutura semântica, os textos alternativos, os labels, a hierarquia de títulos e os nomes acessíveis adequadamente definidos."
        };
    };


function hasAccessibleName(
    element
) {

    const ariaLabel =
        element.getAttribute(
            "aria-label"
        );

    if (
        ariaLabel &&
        ariaLabel.trim().length > 0
    ) {

        return true;
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

        const hasReference =
            ids.some(
                (id) => {

                    const reference =
                        document.getElementById(
                            id
                        );

                    return (
                        reference &&
                        reference.textContent
                            .trim()
                            .length > 0
                    );
                }
            );

        if (
            hasReference
        ) {

            return true;
        }
    }


    const tagName =
        element.tagName
            .toLowerCase();


    if (
        tagName === "input" ||
        tagName === "select" ||
        tagName === "textarea"
    ) {

        const id =
            element.getAttribute(
                "id"
            );

        if (
            id
        ) {

            const label =
                document.querySelector(
                    `label[for="${CSS.escape(
                        id
                    )}"]`
                );

            if (
                label &&
                label.textContent
                    .trim()
                    .length > 0
            ) {

                return true;
            }
        }


        const parentLabel =
            element.closest(
                "label"
            );

        if (
            parentLabel &&
            parentLabel.textContent
                .trim()
                .length > 0
        ) {

            return true;
        }
    }


    const text =
        element.textContent
            .trim();

    if (
        text.length > 0
    ) {

        return true;
    }


    const title =
        element.getAttribute(
            "title"
        );

    if (
        title &&
        title.trim().length > 0
    ) {

        return true;
    }


    return false;
}


function hasMeaningfulContent(
    element
) {

    return (
        element.textContent
            .trim()
            .length > 0
    );
}


function removeDuplicateElements(
    elements
) {

    const unique = [];

    const seen =
        new Set();

    elements.forEach(
        (item) => {

            const key =
                `${item.selector}|${item.description}`;

            if (
                seen.has(key)
            ) {
                return;
            }

            seen.add(key);

            unique.push(item);
        }
    );

    return unique;
}


function getElementSelector(
    element
) {

    if (
        element.id
    ) {

        return `#${CSS.escape(
            element.id
        )}`;
    }


    if (
        element.name
    ) {

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