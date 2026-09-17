globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWeb.calculateScores =
    function calculateScores(results) {

        const categories = {
            accessibility: [],
            usability: [],
            design: [],
            responsive: []
        };

        results.forEach((result) => {

            if (
                categories[result.category]
            ) {
                categories[result.category]
                    .push(result);
            }

        });


        const scores = {};


        Object.keys(categories).forEach(
            (category) => {

                const categoryResults =
                    categories[category];

                if (
                    categoryResults.length === 0
                ) {
                    scores[category] = null;
                    return;
                }

                const total =
                    categoryResults.reduce(
                        (sum, result) =>
                            sum + result.score,
                        0
                    );

                const average =
                    total /
                    categoryResults.length;

                scores[category] =
                    Number(
                        average.toFixed(1)
                    );
            }
        );


        return {
            categories: scores,
            criteria: results
        };
    };