// for auto completion using cypress library
/// <reference types="cypress" /> 

import {generateRandomUsername} from '../support/generate-random-user.js';

const username = generateRandomUsername()
const password = 'test_1234'

describe('e2e test for basic transactions of parabank application', () => {

    beforeEach(() =>{
        cy.createSession()
    });

    it('Navigate to Para bank application',() => {
        cy.url().should('include','/parabank/index.htm')
        cy.log('Successfully Navigated to Para bank application')
    })

    it('Create a new user from user registration page (Ensure username is generated randomly and it is unique in every test execution)', () => {
        cy.log(username)
        // intercepts
        cy.intercept(
            'POST',
            `parabank/register.htm`, 
        ).as('createUser')


        cy.visit('/parabank/register.htm')

        // Fill the form
        cy.get("#customer\\.firstName").clear().type("John");
        cy.get("#customer\\.lastName").clear().type("Smith");
        cy.get("#customer\\.address\\.street").clear().type("123 Test Street");
        cy.get("#customer\\.address\\.city").clear().type("City");
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
            cy.get('p').should('contain', "John Smith");
        })
    })

    it('Login to the application with the user created in step 2',() =>{
        cy.log(username)
 
        
        cy.login(username, password);

        // Verify details
        cy.get('h1').should('contain','Accounts Overview')
        cy.get('#accountTable thead').within(() => {
            cy.get('th').should('have.length', 3);
            cy.contains('th', 'Account');
            cy.contains('th', 'Balance*');
            cy.contains('th', 'Available Amount');
        });
        // Verify Checkin Account Details
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

    it('Verify if the Global navigation menu in home page is working as expected' , () => {
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

    it('Create a Savings account from “Open New Account Page” and capture the account number' , () => {
        cy.log(username)
        // intercepts
        cy.intercept(
            'GET',
            `/parabank/openaccount.htm`
        ).as('openNewAccount')
        cy.intercept(
            'POST',
            `/parabank/services_proxy/bank/createAccount?customerId=*&newAccountType=1&fromAccountId=*`
        ).as('createAccount')


        cy.login(username,password);

        // create savings account
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

            cy.log('Account Number:' , accountNumber);

            cy.get('#rightPanel').within(() => {
                cy.get('p').should('contain', accountNumber)
            })
        });
    })

    it('Validate if Accounts overview page is displaying the balance details as expected', () => {
        const initialBalanceCheckingAcc = 515.5;
        const initialBalanceSavingsAcc = 100;
        const currentBalanceMainAcc = initialBalanceCheckingAcc - initialBalanceSavingsAcc ;

        cy.log(username)
        // intercepts
        cy.intercept(
            'GET',
            `/parabank/overview.htm`
        ).as('overview')
        cy.intercept(
            'GET',
            `/parabank/services_proxy/bank/customers/*/accounts`
        ).as('accounts')
        
        cy.login(username,password);

        // verify account overview after creating savings account
        cy.get('#leftPanel').contains('Accounts Overview').click();        
        cy.wait('@accounts').then((interception) => {
            const responseBody = interception.response.body;
            const checkingAcc = responseBody.find(account => account.type === 'CHECKING');
            const balanceCheckingAcc = checkingAcc.balance
            const savingsAcc = responseBody.find(account => account.type === 'SAVINGS');
            const balanceSavingsAcc = savingsAcc.balance

            cy.log('Checking Account Balance : ', balanceCheckingAcc);
            cy.log('Savings Account Balance : ', balanceSavingsAcc)
            expect(balanceCheckingAcc).to.be.eql(currentBalanceMainAcc)

            cy.get('tbody').within(() => {
                cy.get('tr').eq(0).within(() => {
                    cy.get('td').eq(1).should('contain', balanceCheckingAcc);
                    cy.get('td').eq(2).should('contain', balanceCheckingAcc);
                });
                cy.get('tr').eq(1).within(() => {
                    cy.get('td').eq(1).should('contain', balanceSavingsAcc);
                    cy.get('td').eq(2).should('contain', balanceSavingsAcc);
                });
                cy.get('tr').eq(2).within(() => {
                    cy.get('td').eq(1).should('contain', balanceCheckingAcc + balanceSavingsAcc);
                });
            })
        })
    })

    it('Transfer funds from account created in step 5 to another account.',() => {
        cy.log(username)
        // intercepts
        cy.intercept(
            'GET',
            `/parabank/overview.htm`
        ).as('overview')
        cy.intercept(
            'GET',
            `/parabank/transfer.htm`
        ).as('transfer')
        cy.intercept(
            'GET',
            `/parabank/services_proxy/bank/customers/*/accounts`
        ).as('accounts')

        cy.login(username,password);

        // transfer funds from checking account to savings account
        cy.get('#leftPanel').contains('Transfer Funds').click();
        cy.wait('@accounts').then((interception) => {
            const responseBody = interception.response.body;
            const savingsAccount = responseBody.find(account => account.type === 'SAVINGS');
            const checkingAccount = responseBody.find(account => account.type === 'CHECKING');
            const savingsAccountId = savingsAccount.id;
            const checkingAccountId = checkingAccount.id
            cy.log('savings account Id : ' , savingsAccountId);
            cy.log('checking account Id : ' , checkingAccountId);
        
            cy.get('#amount').type('50')
            cy.get('#toAccountId').select(savingsAccountId.toString());
            cy.get('input.button[value="Transfer"]').click();

            cy.get('#rightPanel').within(() => {
                cy.get('h1').should('contain', 'Transfer Complete!')
                cy.get('#amount').should('contain', '50');
                cy.get('#fromAccountId').should('contain', checkingAccountId)
                cy.get('#toAccountId').should('contain', savingsAccountId)
            })
        });        
    })

    it('Pay the bill with account created in step 5' , () => {
        cy.log(username)
        // intercepts
        cy.intercept(
            'GET',
            `/parabank/overview.htm`
        ).as('overview')
        cy.intercept(
            'GET',
            `/parabank/billpay.htm`
        ).as('billpay')
        cy.intercept(
            'GET',
            `/parabank/services_proxy/bank/customers/*/accounts`
        ).as('accounts')

        cy.login(username,password);

        // Pay a bill using savings account
        cy.wait('@accounts').then((interception) => {
            const responseBody = interception.response.body;
            const savingsAccount = responseBody.find(account => account.type === 'SAVINGS');
            const savingsAccountId = savingsAccount.id
            cy.log('savings account Id : ' , savingsAccountId)
        

            cy.get('#leftPanel').contains('Bill Pay').click();
            cy.wait('@billpay')

            cy.get('form').within(() => {
                cy.get('input[name="payee.name"]').type('John Smith');
                cy.get('input[name="payee.address.street"]').type('123 Test Street');
                cy.get('input[name="payee.address.city"]').type('City');
                cy.get('input[name="payee.address.state"]').type('VIC');
                cy.get('input[name="payee.address.zipCode"]').type('1234');
                cy.get('input[name="payee.phoneNumber"]').type('0491234567');
                cy.get('input[name="payee.accountNumber"]').type('99999');
                cy.get('input[name="verifyAccount"]').type('99999');
                cy.get('input[name="amount"]').type('15');
                cy.get('select[name="fromAccountId"]').select(savingsAccountId.toString());

                cy.get('input[type="submit"][value="Send Payment"]').click();
            })

            cy.get('#rightPanel').within(() => {
                cy.get('h1').should('contain', 'Bill Payment Complete')
                cy.get('#payeeName').should('contain', 'John Smith');
                cy.get('#amount').should('contain', 15)
                cy.get('#fromAccountId').should('contain', savingsAccountId)
            })
        })
    })

    it('API - Search the transactions using “Find transactions” API call by amount for the payment transactions made in Step 8 & Validate the details displayed in Json response' , () => {
        cy.log(username)
        // intercepts
        cy.intercept(
        'GET',
        `/parabank/overview.htm`
        ).as('overview')
        cy.intercept(
        'GET',
        `/parabank/findtrans.htm`
        ).as('findTransaction')
        cy.intercept(
        'GET',
        `/parabank/services_proxy/bank/customers/*/accounts`
        ).as('accounts')
        cy.intercept(
            'GET',
            `/parabank/services_proxy/bank/accounts/*/transactions/amount/*`
        ).as('transactionAmount')

        cy.login(username,password);

        // find transaction by savings account and transfer amount
        cy.wait('@accounts').then((interception) => {
            const responseBody = interception.response.body;
            const savingsAccount = responseBody.find(account => account.type === 'SAVINGS');
            const savingsAccountId = savingsAccount.id
            cy.log('savings account Id : ' , savingsAccountId)
    
    
            cy.get('#leftPanel').contains('Find Transactions').click();
            cy.wait('@findTransaction')
    
            cy.get('form').within(() => {
                cy.get('#accountId').select(savingsAccountId.toString());
                cy.get('[id="criteria.amount"]').type('15');
                cy.get('button[type="submit"]').eq(3).click();
            })
            cy.wait('@transactionAmount').then((interception) => {
                const responseBody = interception.response.body;
                const expectedAmount = 15;
            
                responseBody.forEach((transaction) => {
                    const actualAmount = transaction.amount;
                    expect(actualAmount).to.equal(expectedAmount);
                });
            });
        })    
    })
})

