const { defineConfig } = require("cypress");

exports.default = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:8080',
        watchForFileChanges: false,
        parseSpecialCharSequences: false,
        supportFile: "cypress/support/commands.js",
        retries: {
            "runMode": 2,
            "openMode": 2
        }
    }
});