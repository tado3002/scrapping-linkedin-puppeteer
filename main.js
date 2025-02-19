const puppeteer = require("puppeteer");
const fs = require("fs");

url =
  "https://sg.linkedin.com/jobs/search?keywords=Software%2BEngineer&location=Indonesia&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0";

// Fungsi untuk memuat cookie sebelum scraping
const loadCookies = async (page) => {
  if (fs.existsSync("cookies.json")) {
    const cookies = JSON.parse(fs.readFileSync("cookies.json"));
    await page.setCookie(...cookies);
    console.log("Cookies dimuat, login tidak diperlukan.");
  }
};

// fungsi delay menghindari terdeteksi sebagai bot
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  // launch browser and open new blank page
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--proxy-server=http://10.248.223.162:44355"],
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
  // Scroll sampai semua pekerjaan dimuat
  const autoScroll = async (page) => {
    let previousHeight;
    while (true) {
      previousHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay agar data sempat dimuat

      let newHeight = await page.evaluate("document.body.scrollHeight");
      if (newHeight === previousHeight) break; // Berhenti jika tidak ada perubahan tinggi halaman
    }
  };

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
  fs.writeFileSync("raw_data.json", JSON.stringify(jobListing, null, 2));

  console.log("selesai scrapping web");
  await browser.close();
})();
//
