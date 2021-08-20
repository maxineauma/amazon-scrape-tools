const got = require('got');
const fs = require('fs').promises;
const { ArgumentParser } = require('argparse');

const parser = new ArgumentParser({ description: "Amazon scraping tool." });
parser.add_argument('-u', '--url', { help: 'Amazon search results page URL, in quotes. Required.', required: true });
parser.add_argument('-p', '--pages', { help: 'Maximum number of pages to scrape. Default is 1.', default: 1 });

let url = parser.parse_args()['url'];
let max_pages = parseInt(parser.parse_args()['pages']);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async() => {

    await fs.writeFile('ASIN_data.txt', '');
    for(x = 1; x<max_pages + 1; x++) {
        const res = await got.get(url + "&page=" + x, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'},
            retry: { limit: 5 }
        });
        let re = /<a class="a-link-normal a-text-normal" href="\/[\w\-]+\/dp\/([a-zA-Z0-9]+)/gm;
        let match = res.body.matchAll(re);
        for(const m of match) await fs.appendFile('ASIN_data.txt', m[1] + '\n');
        await sleep(2000);
    }

})();