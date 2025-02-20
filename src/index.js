const puppeteer = require("puppeteer");
const loadCookies = require("../lib/linkedinActions/loadCookies.js");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

url =
  "https://sg.linkedin.com/jobs/search?keywords=Software%2BEngineer&location=Indonesia&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0";

module.exports = async function () {
  // launch browser and open new blank page
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--proxy-server=http://100.117.26.52:44355"],
  });
  const page = await browser.newPage();
  let counter = 0;
  // navigate the page to url
  await loadCookies(page);
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 300000,
  });

  await delay(3000 + counter);
  console.log("selesai mengakses web");
  // Tunggu elemen daftar pekerjaan muncul

  await page.waitForSelector(".jobs-search__results-list");

  const autoScroll = require("../lib/linkedinActions/autoScroll.js");

  await autoScroll(page); // Panggil fungsi scroll otomatis

  console.log("evaluate list card element...");
  const jobListing = await page.evaluate(async () => {
    const jobs = [];
    document
      .querySelectorAll(".jobs-search__results-list>li")
      .forEach((job) => {
        const isDateNew =
          job.querySelector(".job-search-card__listdate--new") && true;
        const dateSelector = isDateNew
          ? job.querySelector(".job-search-card__listdate--new")
          : job.querySelector(".job-search-card__listdate");

        let cardResult = {
          job: job.querySelector(".base-search-card__title").innerText,
          company: job.querySelector(".hidden-nested-link").innerText,
          address: job.querySelector(".job-search-card__location").innerText,
          date: dateSelector.getAttribute("datetime"),
        };
        jobs.push(cardResult);
      });
    return jobs;
  });

  const fs = require("fs");
  fs.writeFileSync("data/raw_data.json", JSON.stringify(jobListing, null, 2));

  console.log("selesai scrapping web");
  await browser.close();
};
