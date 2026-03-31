describe('suppliers keyboard navigation', () => {
  it('opens supplier details from a focused table row using the keyboard', () => {
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

    cy.intercept('GET', '/api/notifications/unread-count', {
      statusCode: 200,
      body: 0,
    }).as('getUnreadCount')

    cy.intercept('GET', '/api/suppliers', {
      statusCode: 200,
      body: [
        {
          id: 7,
          name: 'North Sea Seafood',
          organizationNumber: '123456789',
          contactName: 'Nina North',
          email: 'nina@example.com',
          phone: '99999999',
          address: 'Harbor Street 1',
          notes: null,
          active: true,
          createdAt: '2026-03-24T09:00:00',
          updatedAt: '2026-03-24T09:00:00',
        },
      ],
    }).as('getSuppliers')

    cy.intercept('GET', '/api/suppliers/7', {
      statusCode: 200,
      body: {
        id: 7,
        name: 'North Sea Seafood',
        organizationNumber: '123456789',
        contactName: 'Nina North',
        email: 'nina@example.com',
        phone: '99999999',
        address: 'Harbor Street 1',
        notes: null,
        active: true,
        createdAt: '2026-03-24T09:00:00',
        updatedAt: '2026-03-24T09:00:00',
      },
    }).as('getSupplier')

    cy.intercept('GET', '/api/deliveries', {
      statusCode: 200,
      body: [
        {
          id: 21,
          supplierId: 7,
          supplierName: 'North Sea Seafood',
          deliveryDate: '2026-03-25T10:00:00',
          receivedByUserId: 1,
          receivedByUsername: 'manager',
          documentNumber: 'DEL-21',
          notes: null,
          items: [],
          createdAt: '2026-03-25T10:00:00',
        },
      ],
    }).as('getDeliveries')

    cy.visit('/app/suppliers')
    cy.wait(['@authStatus', '@getUnreadCount', '@getSuppliers'])

    cy.contains('North Sea Seafood')
      .closest('tr')
      .focus()
      .type('{enter}')

    cy.wait(['@getSupplier', '@getDeliveries'])
    cy.url().should('include', '/app/suppliers/7')
    cy.contains('North Sea Seafood').should('be.visible')
  })
})
