describe('deviation comments', () => {
  it('posts a comment on a deviation detail page', () => {
    cy.intercept('GET', '/api/auth/status', {
      statusCode: 200,
      body: {
        authenticated: true,
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
    }).as('authStatus')

    cy.intercept('GET', '/api/deviations/1', {
      statusCode: 200,
      body: {
        id: 1,
        title: 'Broken cooler',
        description: 'Cooling system is too warm',
        category: 'FOOD',
        severity: 'HIGH',
        status: 'OPEN',
        reportedByUsername: 'staff',
        assignedToUsername: null,
        resolvedByUsername: null,
        resolvedAt: null,
        createdAt: '2026-03-24T09:00:00',
        updatedAt: '2026-03-24T09:00:00',
        comments: [],
      },
    }).as('getDeviation')

    cy.intercept('GET', '/api/users', {
      statusCode: 200,
      body: [
        {
          id: 1,
          username: 'manager',
          firstName: 'Mia',
          lastName: 'Manager',
          roles: ['ROLE_MANAGER'],
        },
      ],
    }).as('getUsers')

    cy.intercept('POST', '/api/deviations/1/comments', {
      statusCode: 200,
      body: {
        id: 11,
        authorUsername: 'manager',
        content: 'Technician booked for today.',
        createdAt: '2026-03-24T10:00:00',
      },
    }).as('addComment')

    cy.visit('/app/deviations/1')
    cy.wait(['@authStatus', '@getDeviation', '@getUsers'])

    cy.get('textarea').type('Technician booked for today.')
    cy.contains('button', 'Post Comment').click()

    cy.wait('@addComment')
    cy.contains('Technician booked for today.').should('be.visible')
    cy.contains('manager').should('be.visible')
  })
})
