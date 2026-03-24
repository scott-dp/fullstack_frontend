describe('auth routing', () => {
  it('redirects unauthenticated users from protected routes to login', () => {
    cy.intercept('GET', '/api/auth/status', {
      statusCode: 200,
      body: { authenticated: false, user: null },
    }).as('authStatus')

    cy.visit('/app')
    cy.wait('@authStatus')

    cy.url().should('include', '/login')
    cy.url().should('include', 'redirect=%2Fapp')
  })

  it('logs in and redirects to the requested page', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        message: 'ok',
        user: {
          id: 1,
          username: 'manager',
          firstName: 'Mia',
          lastName: 'Manager',
          email: 'mia@example.com',
          roles: ['ROLE_MANAGER'],
          organizationId: 1,
          organizationName: 'Everest',
        },
      },
    }).as('login')

    cy.visit('/login?redirect=%2Fapp')
    cy.get('#username').type('manager')
    cy.get('#password').type('secret123')
    cy.contains('button', 'Sign In').click()

    cy.wait('@login')
    cy.url().should('include', '/app')
  })
})
