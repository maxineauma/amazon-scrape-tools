# Amazon Scraping Tools
---------
This is a pair of tools used for scraping Amazon information.
You will find:
1. `scrapeData.js` -- always use this first to scrape and generate `ASIN_data.txt`.
2. `scrapeASINs.js` -- once the above text file has generated, run this to scrape individual data, generates `Amazon Report.xlsx`.

###### Prerequisite Packages
Please install prerequisites with `npm install` before attempting to run any of these programs.

## Usage 
* `node scrapeASINs.js [-h] [-u URL] [-p PAGES]`
* **Output**:
```
optional arguments:
  -h, --help            show this help message and exit
  -u URL, --url URL     Amazon search results page URL, in quotes. Required.
  -p PAGES, --pages PAGES
                        Maximum number of pages to scrape. Default is 1.
```

* `node scrapeData.js`
* **Output**:
```
Currently scraping Amazon... |░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░| 0% | ETA: 0s | 0/48 Chunks
```