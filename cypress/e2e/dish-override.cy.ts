describe('dish allergen overrides', () => {
  it('adds an allergen override from the dish detail page', () => {
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

    let dishRequestCount = 0
    cy.intercept('GET', '/api/dishes/6', (req) => {
      dishRequestCount += 1
      req.reply({
        statusCode: 200,
        body: {
          id: 6,
          name: 'Seafood Pasta',
          description: 'Creamy seafood pasta',
          active: true,
          ingredients: [{ id: 1, ingredientId: 1, ingredientName: 'Salmon', quantityText: '200 g' }],
          derivedAllergens: [{ id: 2, code: 'FISH', nameNo: 'Fisk', nameEn: 'Fish' }],
          overrides: dishRequestCount > 1 ? [
            {
              id: 44,
              allergen: { id: 5, code: 'MILK', nameNo: 'Melk', nameEn: 'Milk' },
              included: true,
              reason: 'Cream sauce',
            },
          ] : [],
          changedSinceApproval: true,
          lastApprovedAt: null,
          lastApprovedByUsername: null,
          notes: null,
          createdAt: '2026-03-20T10:00:00',
          updatedAt: '2026-03-20T10:00:00',
        },
      })
    }).as('getDish')

    cy.intercept('GET', '/api/allergens', {
      statusCode: 200,
      body: [
        { id: 5, code: 'MILK', nameNo: 'Melk', nameEn: 'Milk' },
      ],
    }).as('getAllergens')

    cy.intercept('POST', '/api/dishes/6/overrides', {
      statusCode: 200,
      body: {
        id: 44,
        allergen: { id: 5, code: 'MILK', nameNo: 'Melk', nameEn: 'Milk' },
        included: true,
        reason: 'Cream sauce',
      },
    }).as('addOverride')

    cy.visit('/app/dishes/6')
    cy.wait(['@authStatus', '@getUnreadCount', '@getDish', '@getAllergens'])

    cy.contains('Seafood Pasta').should('be.visible')
    cy.contains('h4', 'Add Override')
      .parent()
      .find('select')
      .first()
      .select('Milk')
    cy.get('input[placeholder="Reason..."]').type('Cream sauce')
    cy.contains('button', 'Add').click()

    cy.wait('@addOverride')
    cy.wait('@getDish')
    cy.contains('Milk: Included').should('be.visible')
  })
})
