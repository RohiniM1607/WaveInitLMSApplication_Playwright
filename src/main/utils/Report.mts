import * as report from "multiple-cucumber-html-reporter";
report.generate({
    jsonDir: "reports",
    reportPath: "./reports/detailed-html",
    reportName: "Playwright BDD Report",
    pageTitle: "LMS test Report",
    displayDuration: false,
    metadata: {
        browser: {
            name: "chrome",
            version: "118",
        },
        device: "Machine",
        platform: {
            name: "Windows",
            version: "11",
        },
    },
});