// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare namespace Cypress {
    interface Chainable<Subject> {
        generateAndSaveUsername(username: string, password: string): void;
        generatedCredentials: { username: string, password: string };
    }
}

// In commands.js or any custom command file
Cypress.Commands.add('generateAndSaveUsername', (username:string, password: string) => {
    // Function to generate a random number
    const generateRandomNumber = () => {
      return Math.floor(100 + Math.random() * 900);
    };
  
    // Generate a random username
    const generateRandomUserName = username || 'user' + generateRandomNumber();
  
    // Save the generated username to Cypress configuration (STUCK HERE !!!!!!!)
    Cypress.config('generatedCredentials', {
        generateRandomUserName,
        password: password || 'test_1234'
      });
  
    // Return the generated username
    return generateRandomUserName;
});
