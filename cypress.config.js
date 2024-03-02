const { defineConfig } = require("cypress");

// module.exports = defineConfig({
//   e2e: {
//     setupNodeEvents(on, config) {
//       // implement node event listeners here
//     },
//     baseUrl: 'http://localhost:8080',
//     watchForFileChanges:true,
//   },
// });
exports.default = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:8080',
        watchForFileChanges: false,
        parseSpecialCharSequences: false,
        supportFile: "cypress/support/commands.js"
    }
});