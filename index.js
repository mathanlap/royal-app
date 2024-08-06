const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const express = require("express");
const moment = require("moment-timezone");
const nodemailer = require("nodemailer");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;
const { NAUKRI_EMAILID, NAUKRI_PASSWORD, BOT_EMAILID, BOT_MAIL_PASSWORD, RECEIVEING_EMAILID } = process.env;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = (min, max) => delay(Math.floor(Math.random() * (max - min + 1) + min));

function convertGMTToIST(gmtDateString) {
  const istDate = moment(gmtDateString).tz("Asia/Kolkata");
  return istDate.format("YYYY-MM-DD hh:mm:ss A");
}

const sendEmail = async (subject, text, attachment) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: BOT_EMAILID,
      pass: BOT_MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let mailOptions = {
    from: `"NaukriUpdateBot" <${BOT_EMAILID}>`,
    to: RECEIVEING_EMAILID,
    subject: subject,
    text: text,
  };

  if (attachment) {
    mailOptions.attachments = [{ filename: "Screenshot.png", content: attachment }];
  }

  let info = await transporter.sendMail(mailOptions);
  console.log("Email sent: %s", info.messageId);
};

const naukriUpdater = async (emailID, password) => {
  let browser;
  try {
    console.log(`Browser launching...!`);
    const now = new Date();
    console.log(`Launching started at: ${convertGMTToIST(now)}`);

    browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--disable-http2",
      ],
      headless: true,
      slowMo: 100,
      protocolTimeout: 120000, // Increase the protocol timeout to 2 minutes
    });

    console.log(`Browser launched...!`);
    const page = await browser.newPage();

    // Set user agent and viewport
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
    await page.setViewport({ width: 1280, height: 800 });

    // Set WebGL and plugins
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (parameters.name === "notifications" ? Promise.resolve({ state: Notification.permission }) : originalQuery(parameters));
    });

    await page.goto("https://www.naukri.com/nlogin/login", { waitUntil: "networkidle2" });

    // Check if already logged in
    const loginCheck = await page.evaluate(() => document.querySelector(".dashboard") !== null);
    if (!loginCheck) {
      console.log("Navigated to Naukri login page");
      // Wait for the username field to be available
      await page.waitForSelector("#usernameField");

      if (!emailID || !password || typeof emailID !== "string" || typeof password !== "string") {
        throw new Error("EmailID or password is not set or not a string.");
      }

      console.log("Entering EmailID...!");
      await page.type("#usernameField", emailID);
      await randomDelay(1000, 3000);
      console.log("Entered EmailID");

      console.log("Entering Password...!");
      await page.type("#passwordField", password);
      await randomDelay(1000, 2000);
      console.log("Entered Password");

      console.log("Filled login form");
      console.log("Clicking on Login button...!");
      await page.click("button[data-ga-track='spa-event|login|login|Save||||true']");
      await randomDelay(2000, 4000);
      console.log("Clicked on Login button");

      // Wait for OTP input field
      console.log("Waiting for OTP input...");
      if (await page.evaluate(() => document.querySelector(".otp-input") !== null)) {
        console.log("OTP input found");
        // const OTPscreenshotBuffer = await page.screenshot({ fullPage: true });
        // sendEmail("Naukri Profile Update", "Reached Naukri Profile Page", OTPscreenshotBuffer.toString());
        console.log("Sent OTP screenshot");
      } else {
        console.log("No OTP found");
      }

    }

    console.log("Navigating to profile update section...!");
    await page.goto("https://www.naukri.com/mnjuser/profile?id=&altresid", { waitUntil: "networkidle2" });
    await randomDelay(2000, 4000);
    console.log("Navigated to profile update section");

    console.log("Navigating to profile update section");
    console.log("Browser Closing");
    console.log("Waiting for widget Head Loading...");

    // Click on <span> "editOneTheme"
    await sendEmail("Naukri Profile Update", "Reached Naukri Profile Page", await page.screenshot({ fullPage: true }));
    await page.waitForSelector(".widgetHead>.edit");
    await Promise.all([page.click(".widgetHead>.edit"), page.waitForNavigation()]);
    console.log("Widget Head loaded...");

    console.log("Loading Key Skills...");
    // Click on <input> #keySkillSugg
    await randomDelay(2000, 4000);
    await page.waitForSelector("#keySkillSugg");
    await page.click("#keySkillSugg");
    console.log("Key Skills loaded...");

    console.log("Loading Key Skills...");
    console.log("Typing Nodejs...");
    // Fill "Nodejs" on <input> #keySkillSugg
    await page.waitForSelector("#keySkillSugg:not([disabled])");
    await page.type("#keySkillSugg", "Nodejs");
    await randomDelay(2000, 4000);
    console.log("Key Skills typed...");

    console.log("Clicking on NodeJs Framework...");
    // Click on <div> "NodeJs Framework"
    await page.waitForSelector(".Sbtn");
    await page.click(".Sbtn");
    await randomDelay(2000, 4000);
    console.log("NodeJs Framework clicked...");

    // Scroll wheel by X: 0, Y: 131
    await page.evaluate(() => window.scrollBy(0, 131));
    // Scroll wheel by X: 0, Y: -44
    await page.evaluate(() => window.scrollBy(0, -44));
    // Scroll wheel by X: 0, Y: 253
    await page.evaluate(() => window.scrollBy(0, 253));
    console.log("Saving Key Skills...");

    // Click on <button> "Save"
    await page.waitForSelector("#saveKeySkills");
    await randomDelay(2000, 4000);
    await page.click("#saveKeySkills");
    console.log("Key Skills saved...");

    // const screenshotBuffer = await page.screenshot({ fullPage: true });
    // sendEmail("Naukri Profile Update", "Saved key skills and reached Naukri Profile Page", screenshotBuffer);
    console.log("Sending Profile screenshot");

    console.log("Key skills section loaded");
  } catch (error) {
    console.log(`Error occurred while creating the browser instance => ${error}`);
  } finally {
    if (browser) {
      await browser.close();
      const now = new Date();
      console.log(`Browser closed`);
      console.log(`Closing started at: ${convertGMTToIST(now)}`);
    }
  }
};

app.get("/", (req, res) => {
  res.send("Naukri-BOT is running");
});

app.listen(PORT, () => {
  console.log(`Naukri-BOT app listening on port ${PORT}!`);
  naukriUpdater(NAUKRI_EMAILID, NAUKRI_PASSWORD);
});
