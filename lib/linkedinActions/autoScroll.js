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

module.exports = autoScroll;
