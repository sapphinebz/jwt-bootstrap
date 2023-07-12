const puppeteer = require("puppeteer");
const { defer, using, Observable } = require("rxjs");
const { switchMap, finalize } = require("rxjs/operators");

module.exports = {
  puppeteer,
  puppet,
  currentGoldPrice,
};

function puppet(project) {
  return new Observable((subscriber) => {
    async function run() {
      const browser = await puppeteer.launch({ headless: "new" });
      subscriber.add(() => browser.close());

      try {
        const result = await project(browser);
        subscriber.next(result);
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    }

    run();
  });
}

function currentGoldPrice() {
  return puppet(async (browser) => {
    const page = await browser.newPage();
    await page.goto(`https://www.goldtraders.or.th/`);

    return await page.evaluate(() => {
      const results = [];

      const trlist = document.querySelectorAll(
        "#DetailPlace_uc_goldprices1_GoldPricesUpdatePanel tbody tr"
      );

      if (trlist) {
        trlist.forEach((tr) => {
          if (tr.children.length === 3) {
            const tdList = tr.querySelectorAll("td");
            results.push(Array.from(tdList, (el) => el.textContent.trim()));
          }
        });
      }

      const finalResult = {
        [results[0][0]]: {
          sell: toCurreny(results[0][2]),
          purchase: toCurreny(results[1][2]),
        },
        [results[2][0]]: {
          sell: toCurreny(results[2][2]),
          purchase: toCurreny(results[3][2]),
        },
      };

      function toCurreny(value) {
        return parseInt(value.replace(/\,/, ""));
      }

      return finalResult;
    });
  });
}
