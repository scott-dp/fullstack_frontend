describe('my training completion', () => {
  it('completes an assigned training from the personal training inbox', () => {
    cy.intercept('GET', '/api/auth/status', {
      statusCode: 200,
      body: {
        authenticated: true,
        user: {
          id: 2,
          username: 'staff1',
          firstName: 'Ava',
          lastName: 'Stone',
          email: 'ava@example.com',
          roles: ['ROLE_STAFF'],
          organizationId: 1,
          organizationName: 'Everest',
        },
      },
    }).as('authStatus')

    cy.intercept('GET', '/api/notifications/unread-count', {
      statusCode: 200,
      body: 0,
    }).as('getUnreadCount')

    cy.intercept('GET', '/api/trainings/assignments/my', {
      statusCode: 200,
      body: [
        {
          id: 9,
          templateId: 4,
          templateTitle: 'Responsible serving',
          assigneeUsername: 'staff1',
          assignedByUsername: 'manager',
          assignedAt: '2026-03-24T10:00:00',
          dueAt: '2026-04-05T00:00:00',
          status: 'ASSIGNED',
        },
      ],
    }).as('getAssignments')

    cy.intercept('POST', '/api/trainings/assignments/9/complete', {
      statusCode: 200,
      body: {
        id: 1,
        assignmentId: 9,
        completedByUsername: 'staff1',
        completedAt: '2026-03-25T12:00:00',
        acknowledgementChecked: true,
        comments: 'Completed after review.',
        expiresAt: null,
      },
    }).as('completeTraining')

    cy.visit('/app/training/my')
    cy.wait(['@authStatus', '@getUnreadCount', '@getAssignments'])

    cy.contains('Responsible serving').should('be.visible')
    cy.contains('button', 'Mark as Completed').click()
    cy.get('input[type="checkbox"]').check()
    cy.get('textarea').type('Completed after review.')
    cy.contains('button', 'Confirm Completion').click()

    cy.wait('@completeTraining')
    cy.contains('Completed').should('be.visible')
  })
})
