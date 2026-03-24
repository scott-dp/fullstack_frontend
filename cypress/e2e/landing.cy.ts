describe('landing page', () => {
  it('shows the public marketing page', () => {
    cy.visit('/')

    cy.contains('Digital Internal Control').should('be.visible')
    cy.contains('Sign In').should('be.visible')
    cy.contains('Get Started').should('be.visible')
  })
})
