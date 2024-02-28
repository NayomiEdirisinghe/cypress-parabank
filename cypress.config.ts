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


export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    watchForFileChanges: false,
    parseSpecialCharSequences: false,
  },
  generatedCredentials: {
    username: '',
    password: 'test_1234'
  }
});
