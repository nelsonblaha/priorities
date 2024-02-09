describe('template spec', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080')
  })

  it('shows the tasks list', () => {
    cy.contains('h1', 'Priorities')
  })

  it('adds the test task', () => {
    cy.get('input#task-input').type('Cypress test task')
    cy.wait(500)
    cy.get('button#add-task-btn').click()
    cy.wait(500)
    cy.get('section#task-list')
      .find('div.task a')
      .contains('Cypress test task')
      .should('exist');
  })

  // TODO: test a bunch of task stuff

  it('deletes the test task', () => {
    cy.get('section#task-list div.task a')
      .contains('Cypress test task')
      // Click the task description to possibly reveal the delete button
      .click()
      // Wait for any animations or AJAX calls to complete. Consider replacing with cy.wait('@alias') for specific requests
      .wait(500)
      .parents('div.task')
      .find('button.delete')
      .click();
      cy.get('section#task-list')
      .find('div.task a')
      .contains('Cypress test task')
      .should('not.exist');
  });
})
