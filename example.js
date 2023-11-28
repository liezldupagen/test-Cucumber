const { BeforeAll, AfterAll, Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Builder, until, By } = require('selenium-webdriver');

setDefaultTimeout(30_000);

/**
 * @type {import("selenium-webdriver").ThenableWebDriver}
 */
let driver;

BeforeAll(async function () {
    let builder = new Builder().forBrowser('chrome');
    driver = await builder.build();
    await driver.manage().window().maximize();
});

AfterAll(async function () {
    if (driver) {
        await driver.quit();
    }
});

Given('User navigates to Gmail website', async function () {
    await driver.get('https://mail.google.com');
});

When('User enters the email as {string}', async function (email) {
    await driver.findElement(By.css('#identifierId')).sendKeys(email);
    await driver.findElement(By.css('#identifierNext')).click();
});

When('User enters the password as {string}', async function (password) {
    await retryStep(async () => {
        await driver.findElement(By.css('input[type=password]')).sendKeys(password);
        await driver.findElement(By.css('#passwordNext')).click();
    }, {
        ignoreErrors: ['ElementNotInteractableError']
    });
});

Then('Verify email with subject line {string} is present', async function (subject) {
    const locator = By.xpath(`//*[@role='grid']//*[@role='row' and descendant::*[contains(normalize-space(),'${subject}')]]`);
    const element = await driver.wait(until.elementLocated(locator));
    await driver.wait(until.elementIsVisible(element));
});

async function retryStep(asyncFn, options) {
    const timeout = options.timeout ?? 20_000;
    const interval = options.interval ?? 500;
    const ignoreErrors = options.ignoreErrors ?? [];
    let start = new Date().getTime();
    while (true) {
        try {
            await asyncFn();
            break;
        } catch (error) {
            let end = new Date().getTime();
            if (end - start >= timeout) {
                const timeoutError = new Error('Timeout when retrying step', { cause: error });
                timeoutError.name = 'TimeoutError';
                throw timeoutError;
            }
            if (error instanceof Error && ignoreErrors.includes(error.name)) {
                await sleep(interval);
                continue;
            }
            throw error;
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}