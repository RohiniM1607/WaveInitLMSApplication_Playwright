import dotenv from "dotenv";

const environment = process.env.ENV || "qa";

dotenv.config({
    path: `src/resources/env/.env.${environment}`
});

export const config = {
    baseUrl: process.env.BASE_URL!,
    browser: process.env.BROWSER || "chromium",
    headless: process.env.HEADLESS === "true",
    slowMo: Number(process.env.SLOWMO) || 0,
    timeout: Number(process.env.TIMEOUT) || 100000,
    dynamicUrl:process.env.DYNAMIC_FIELD_URL!
};