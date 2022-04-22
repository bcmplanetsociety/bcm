const puppeteer = require('puppeteer');

//TEST1

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1100,
        height: 860
    });
    await page.goto('http://localhost:3000/');
    await page.screenshot({
        path: './screenshots/todo_main_page.png'
    });

    await browser.close();
}) ();

//TEST2



//TEST3
