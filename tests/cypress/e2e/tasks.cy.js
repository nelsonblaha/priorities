describe('template spec', () => {
  it('shows the tasks list', () => {
    cy.visit('http://localhost:8080')
    cy.contains('h1', 'Priorities')
  })
  // it('adds a task', () => {
  //   cy.visit('http://localhost:8080')
  //   cy.get('input#task-input').type('Cypress test task')
  //   cy.get('button#add-task-btn').click()
  //   cy.wait(1000)
  //   cy.get('section#task-list div.task a.description-text').should('have.text', 'Cypress test task')
  // })
})