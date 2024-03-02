// Navigate to Para bank application.
// Create a new user from user registration page (Ensure username is generated randomly and it is unique in every test execution).
//
// for auto completion using cypress library
/// <reference types="cypress" /> 

import {generateRandomUsername} from '../support/generate-random-user.js';

let sessionId

describe('Create a new user with random generated username', () => {
  beforeEach(() =>{
    cy.visit('/parabank').then(() => {
      cy.getCookie('sessionId').then(cookie => {
        sessionId = cookie
      })
    })
  });

  it('Verify creating a new user via registration page', () => {
    const username = generateRandomUsername()
    cy.log(username)

    // Load the fixture data
    cy.readFile('cypress/fixtures/createUserResponse.html').then((html) => {
    // Update the HTML content with the dynamic username
    const updatedHtml = html
    .replace('Welcome test', 'Welcome ' + username);

    // mocked response for create user
    cy.intercept(
      'POST',
      `parabank/register.htm`, 
      (req) => {
        req.headers['Cookie'] = sessionId
        req.reply({
          statusCode: 200, // default
          body: updatedHtml
          // fixture: 'createUserResponse.html'      
        })
      }
    ).as('createUser')
    })

    cy.url().should('include','/parabank')
    cy.visit('/parabank/register.htm', {
      headers: {
        'Cookie': sessionId
      }
    })
    // Fill the form

    cy.get("#customer\\.firstName").clear().type("First Name");
    cy.get("#customer\\.lastName").clear().type("Last Name");
    cy.get("#customer\\.address\\.street").clear().type("123 Test Street");
    cy.get("#customer\\.address\\.city").clear().type("Test City");
    cy.get("#customer\\.address\\.state").clear().type("VIC");
    cy.get("#customer\\.address\\.zipCode").clear().type("1234");
    cy.get("#customer\\.phoneNumber").clear().type("0491234567");
    cy.get("#customer\\.ssn").clear().type("1234");
    cy.get("#customer\\.username").clear().type(username);
    cy.get("#customer\\.password").clear().type("test_1234");
    cy.get("#repeatedPassword").clear().type("test_1234");
    
    cy.get('input[type="submit"][value="Register"]').click();
    cy.wait('@createUser')

    // Verify results page
    cy.get('#rightPanel').within(() =>{
      cy.get('h1').should('contain', username);
      cy.get('p').should('have.text', 'Your account was created successfully. You are now logged in.')
    });
    cy.get('#leftPanel').within(() => {
      cy.get('p').should('contain', "First Name Last Name");
    })
  })
})

