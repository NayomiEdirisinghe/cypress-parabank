// Navigate to Para bank application.
// Create a new user from user registration page (Ensure username is generated randomly and it is unique in every test execution).
//
// for auto completion using cypress library
/// <reference types="cypress" /> 

import {generateRandomUsername} from '../support/generate-random-user.js';

let sessionId
const username = generateRandomUsername()
const password = 'test_1234'

const balanceSavingsAcc = 100;
const balanceMainAcc = 515 - balanceSavingsAcc ;

const availableAmountMainAcc = balanceMainAcc ;
const availableAmmountSavingsAcc = balanceSavingsAcc ; 
const totalAmount = availableAmountMainAcc + availableAmmountSavingsAcc

describe('Create a new user with random generated username', () => {

    beforeEach(() =>{
        cy.createSession()
    });

    it.skip('Navigate to Para bank application',() => {
        cy.url().should('include','/parabank/index.htm')
        cy.log('Successfully Navigated to Para bank application')
    })

    it.skip('Create a new user from user registration page (Ensure username is generated randomly and it is unique in every test execution)', () => {
        cy.log(username)
        cy.intercept(
            'POST',
            `parabank/register.htm`, 
            (req) => {
                req.headers['Cookie'] = sessionId
            }
            ).as('createUser')

        cy.visit('/parabank/register.htm')
        // cy.visit('/parabank/register.htm', {
        //     headers: {
        //     'Cookie': sessionId
        //     }
        // })

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
        cy.get("#customer\\.password").clear().type(password);
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

    it.skip('Login to the application with the user created in step 2',() =>{
        // cy.log(username) uncomment after finished
        cy.intercept(
            'GET',
            `/parabank/services_proxy/bank/customers/*/accounts`
        ).as('login')
        

        // User733/ User757, test_1234 - change to username after finished
        cy.get('input.input[name="username"]').type('User757'),
        cy.get('input.input[name="password"]').type(password),
        cy.get('input[type="submit"][value="Log In"]').click();
        cy.wait('@login')

        cy.get('h1').should('contain','Accounts Overview')
        cy.get('#accountTable thead').within(() => {
            cy.get('th').should('have.length', 3);
            cy.contains('th', 'Account');
            cy.contains('th', 'Balance*');
            cy.contains('th', 'Available Amount');
        });

        cy.get('tbody').within(() => {
            cy.get('tr').eq(0).within(() => {
                cy.get('td').eq(1).should('contain', '$515.50');
                cy.get('td').eq(2).should('contain', '$515.50');
            });
            cy.get('tr').eq(1).within(() => {
                cy.get('td').eq(1).should('contain', '$515.50');
            });
        })
 
        cy.get('#accountTable tfoot').within(() => {
            cy.contains('td', '*Balance includes deposits that may be subject to holds');
        });
    })

    it.skip('Verify if the Global navigation menu in home page is working as expected' , () => {
        cy.url().should('include','/parabank/index.htm')

        // About us
        cy.get('#headerPanel .leftmenu').contains('About Us').click();
        cy.wait(1000)
        cy.url().should('include', '/parabank/about.htm');

        // Services
        cy.get('#headerPanel .leftmenu a[href="services.htm"]').click();
        cy.wait(1000)
        cy.url().should('include', '/parabank/services.htm');

        // Products
        // cy.get('#headerPanel .leftmenu').contains('Products').click();
        // cy.wait(5);
        // cy.url().should('include', 'parasoft.com/products/');
        // cy.go('back');

        // Locations
        // cy.get('#headerPanel .leftmenu').contains('Locations').click();
        // cy.url().should('include', '/parasoft.com/solutions/');
        // cy.go('back');

        // Admin Page
        cy.get('#headerPanel .leftmenu a[href="admin.htm"]').click();
        cy.url().should('include', '/parabank/admin.htm');

        // Home button
        cy.get('#headerPanel .button .home').click();
        cy.url().should('include', '/parabank/index.htm');

        // About button
        cy.get('#headerPanel .button .aboutus').click();
        cy.url().should('include', '/about'); 

        // Contact button
        cy.get('#headerPanel .button .contact').click();
        cy.url().should('include', '/contact');

    })

    it.skip('Create a Savings account from “Open New Account Page” and capture the account number' , () => {
        // cy.log(username) uncomment after finished
        cy.intercept(
            'GET',
            `/parabank/services_proxy/bank/customers/*/accounts`
        ).as('login')
        cy.intercept(
            'GET',
            `/parabank/openaccount.htm`
        ).as('openNewAccount')
        cy.intercept(
            'POST',
            `/parabank/services_proxy/bank/createAccount?customerId=*&newAccountType=1&fromAccountId=*`
        ).as('createAccount')

        // User733/ User757, test_1234 - change to username after finished
        cy.get('input.input[name="username"]').type('User757'),
        cy.get('input.input[name="password"]').type(password),
        cy.get('input[type="submit"][value="Log In"]').click();
        cy.wait('@login')

        cy.get('#leftPanel').contains('Open New Account').click();
        cy.wait('@openNewAccount');
        cy.url().should('contain', 'parabank/openaccount.htm');

        cy.get('form').within(() => {
            cy.get('#type').select('SAVINGS');
            cy.get('input.button[value="Open New Account"]').click();
        });
        cy.wait('@createAccount').then((interception) => {
            const responseBody = interception.response.body;
            const accountNumber = responseBody.id;

            cy.log(accountNumber);

            cy.get('#rightPanel').within(() => {
                cy.get('p').should('contain', accountNumber)
            })
        });
    })

    it.skip('Validate if Accounts overview page is displaying the balance details as expected', () => {
        // cy.log(username) uncomment after finished
        cy.intercept(
            'GET',
            `/parabank/services_proxy/bank/customers/*/accounts`
        ).as('login')
        cy.intercept(
            'GET',
            `/parabank/overview.htm`
        ).as('overview')
        cy.intercept(
            'GET',
            `/parabank/services_proxy/bank/customers/*/account`
        ).as('accounts')
        

        // User733/ User757, test_1234 - change to username after finished
        cy.get('input.input[name="username"]').type('User757'),
        cy.get('input.input[name="password"]').type(password),
        cy.get('input[type="submit"][value="Log In"]').click();
        cy.wait('@login')

        cy.get('#leftPanel').contains('Accounts Overview').click();        
        cy.wait('@overview');

        cy.get('tbody').within(() => {
            cy.get('tr').eq(0).within(() => {
                cy.get('td').eq(1).should('contain', balanceMainAcc);
                cy.get('td').eq(2).should('contain', availableAmountMainAcc);
            });
            cy.get('tr').eq(1).within(() => {
                cy.get('td').eq(1).should('contain', balanceSavingsAcc);
                cy.get('td').eq(2).should('contain', availableAmmountSavingsAcc);
            });
            cy.get('tr').eq(2).within(() => {
                cy.get('td').eq(1).should('contain', totalAmount);
            });
        })


    })


})

