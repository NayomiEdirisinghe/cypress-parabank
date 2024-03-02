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

let sessionId 

Cypress.Commands.add('createSession', () => {
    if (sessionId) {
        // If sessionId is already set, no need to visit the page again
        return cy.wrap(sessionId);
    }

    cy.visit('/parabank/index.htm').then(() => {
        cy.getCookie('sessionId').then(cookie => {
            sessionId = cookie ? cookie.value : null;
            // Return sessionId so it can be used in subsequent commands
            return sessionId;
        });
    });
});
