(() => {

    const pageData =
        globalThis.AvaliWeb
            .collectPageData();

    const results = [];

    const criteria =
        globalThis.AvaliWebCriteria || {};

    Object.values(criteria).forEach(
        (evaluateCriterion) => {

            const result =
                evaluateCriterion();

            results.push(result);
        }
    );

    const scores =
        globalThis.AvaliWeb
            .calculateScores(results);

    const analysis = {

        pageData: pageData,

        categories:
            scores.categories,

        criteria:
            scores.criteria
    };

    globalThis.AvaliWebAnalysis =
        analysis;

    return analysis;

})();