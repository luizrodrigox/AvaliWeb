globalThis.AvaliWeb =
    globalThis.AvaliWeb || {};

globalThis.AvaliWeb.collectPageData =
    function collectPageData() {

        return {
            document: {
                title: document.title,
                url: window.location.href,
                language:
                    document.documentElement
                        .getAttribute("lang") || null
            },

            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },

            elements: {
                total:
                    document.querySelectorAll("*").length,

                images:
                    document.querySelectorAll("img").length,

                links:
                    document.querySelectorAll("a").length,

                buttons:
                    document.querySelectorAll("button").length,

                forms:
                    document.querySelectorAll(
                        "input, select, textarea"
                    ).length,

                headings:
                    document.querySelectorAll(
                        "h1, h2, h3, h4, h5, h6"
                    ).length
            }
        };
    };