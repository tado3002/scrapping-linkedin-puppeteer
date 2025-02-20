require("dotenv").config();
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--proxy-server=http://100.117.26.52:44355"],
  });
  const page = await browser.newPage();

  // Set User-Agent agar tidak terdeteksi sebagai bot
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );

  await page.goto("https://www.linkedin.com/login", {
    waitUntil: "networkidle2",
  });

  await page.waitForSelector("#username");

  await page.type("#username", process.env.LINKEDIN_EMAIL, { delay: 500 });
  await page.type("#password", process.env.LINKEDIN_PASSWORD, { delay: 500 });

  // Klik tombol login
  await page.click("button[type='submit']");

  setTimeout(() => {
    console.log("berhasil login");
  }, 10000);

  // Simpan cookie agar bisa digunakan nanti tanpa login ulang
  const cookies = await page.cookies();
  const fs = require("fs");
  fs.writeFileSync("data/cookies.json", JSON.stringify(cookies, null, 2));

  console.log("Login berhasil. Cookie disimpan ke cookies.json.");

  await browser.close();
})();
