const got = require('got');
const fs = require('fs').promises;
const _ = require('lodash');
const excel = require('excel4node');
const progress = require('cli-progress');
const _colors = require('colors');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const bar = new progress.SingleBar({
    format: 'Currently scraping Amazon... |' + _colors.red('{bar}') + '| {percentage}% | ETA: {eta_formatted} | {value}/{total} Chunks',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});

(async() => {

    // Read ASINs file:
    let ASINs_file = (await fs.readFile('ASIN_data.txt')).toString().split('\n');
    let ASINs = _.compact(ASINs_file);
    bar.start(ASINs.length, 0);

    // Configure Spreadsheet:
    let wb = new excel.Workbook();
    let ws = wb.addWorksheet('Amazon Report');

    // Set Spreadsheet Headers:
    let headerStyle = wb.createStyle({ font: { bold: true }});
    let headers = ["ASIN","Title","Rating","Reviews","Price","Rank","Fulfilled By","Available?"];
    for(h in headers) ws.cell(1, parseInt(h)+1).string(headers[h]).style(headerStyle);

    // Set Column Sizes:
    let widths = [20,70,20,10,20,10,20,30];
    for(w in widths) ws.column(parseInt(w)+1).setWidth(widths[w]);

    // Scrape each Amazon page:
    for(a in ASINs) {
        const res = await got.get("https://amazon.com/dp/"+ASINs[a]+"?th=1&psc=1", {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'},
            retry: { limit: 5 }
        });

        let curr_row = parseInt(a) + 2;
        ws.cell(curr_row, 1).string(ASINs[a]);

        // get title
        let title = /<span id="productTitle" class="a-size-large product-title-word-break">[\r\n\s]+([a-zA-Z0-9].+)/gm;         
        try {
            let title_match = res.body.matchAll(title);
            for(t of title_match) ws.cell(curr_row, 2).string(t[1]);
        } catch(e) { ws.cell(curr_row, 2).string("N/A"); }

        // get rating 
        let rate = /<span id="acrPopover" class="reviewCountTextLinkedHistogram noUnderline" title="(.+)"/;
        try {
            let rate_match = res.body.match(rate);
            ws.cell(curr_row, 3).string(rate_match[1]);
        } catch(e) { ws.cell(curr_row, 3).string("N/A"); }

        // get reviews
        let reviews = /<span id="acrCustomerReviewText" class="a-size-base">([0-9, ]+)/;
        try {
            let review_match = res.body.match(reviews);
            ws.cell(curr_row, 4).string(review_match[1]);
        } catch(e) { ws.cell(curr_row, 4).string("N/A"); }

        // get price
        let price = /priceBlockBuyingPriceString">([\$0-9 \-\.]+)/;
        try {
            let price_match = res.body.match(price);
            ws.cell(curr_row, 5).string(price_match[1]);
        } catch(e) { ws.cell(curr_row, 5).string("N/A"); }

        // get rank
        let rank = /:<\/b> #([0-9,]+)/;
        try {
            let rank_match = res.body.match(rank);
            ws.cell(curr_row, 6).string(rank_match[1]);
        } catch(e) { ws.cell(curr_row, 6).string("N/A"); }

        // get fulfiller
        let shipper = /<span class="tabular-buybox-text">([\w.]+)<\/span>/;
        try {
            let ship_match = res.body.match(shipper);
            ws.cell(curr_row, 7).string(ship_match[1]); 
        } catch(e) { ws.cell(curr_row, 7).string("N/A"); }

        // get available
        let available = /<div id="availability" class="a-section a-spacing-base">[\r\n\s]+<span.+>[\r\n\s]+([\w ]+)/;
        try {
            let avail_match = res.body.match(available);
            ws.cell(curr_row, 8).string(avail_match[1]); 
        } catch(e) { ws.cell(curr_row, 8).string("N/A"); }

        wb.write('Amazon Report.xlsx'); // add line to spreadsheet each time data is retrieved
        bar.increment();
        await sleep(2000);
    }

    // End of program
    console.log("\n");
    process.exit(0);

})();