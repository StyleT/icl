import * as locators from './locators';

Feature('news ilc demo application');

Before((I) => {
    // @ts-ignore
    I.mockServer((server) => {
        // @ts-ignore
        server.get('https://newsapi.org/v1/sources').intercept((req, res) => {
            res.status(200).json(require('./data/news.sources.json'));
        });

        // @ts-ignore
        server.get('https://newsapi.org/v1/articles?source=wirtschafts-woche&apiKey=97c568e8528f40be944a8c047aef2210').intercept((req, res) => {
            res.status(200).json(require('./data/news.source.articles.json'));
        });

        // @ts-ignore
        server.get('https://www.wiwo.de/unternehmen/auto/wandel-kostet-milliarden-suv-und-china-sollen-audi-wieder-nach-vorne-bringen/21069566.html').intercept((req, res) => {
            res.status(200).send();
        });
    });

    I.amOnPage('/');
});

Scenario('a user tries to interact with a news page', async (I) => {
    I.waitInUrl('/');
    I.click(locators.goToNews);
    I.waitInUrl(locators.newsUrl);
    I.seeAttributesOnElements(locators.goToNews, {
        'aria-current': 'page',
    });
    I.waitForElement(locators.newsSources);
    I.see('Pick a news source', locators.bannerHeadline);

    I.scrollPageToBottom();

    const lastNewsSourceLinkHref = await I.grabAttributeFrom(locators.lastNewsSourceLink, 'href');

    I.click(locators.lastNewsSourceLink);
    I.seeInCurrentUrl(lastNewsSourceLinkHref);
    I.scrollPageToTop();
    I.waitNumberOfVisibleElements(locators.newsSourceArticles, 10);

    /**
     * Should open a new page from a direct link which ILC does not handle
     */
    const firstNewsSourceArticleHref = await I.grabAttributeFrom(locators.firstNewsSourceArticle, 'href');

    I.click(locators.firstNewsSourceArticle);
    I.switchToNextTab();
    I.seeInCurrentUrl(firstNewsSourceArticleHref);
    I.switchToPreviousTab();
    I.seeInCurrentUrl(lastNewsSourceLinkHref);
    I.closeOtherTabs();

    I.click(locators.goToNewsSources);
    I.waitInUrl(locators.newsUrl);
    I.waitForElement(locators.newsSources);
    I.see('Pick a news source', locators.bannerHeadline);

    /**
     * Should handle an application error by ILC
     */
    I.click(locators.generateError);
    I.waitForText('Error ID');
    I.seeInCurrentUrl(locators.newsUrl);
});