const fs = require("fs");
// Fungsi untuk memuat cookie sebelum scraping
const loadCookies = async (page) => {
  if (fs.existsSync("data/cookies.json")) {
    const cookies = JSON.parse(fs.readFileSync("data/cookies.json"));
    await page.setCookie(...cookies);
    console.log("Cookies dimuat, login tidak diperlukan.");
  }
};
module.exports = loadCookies;
