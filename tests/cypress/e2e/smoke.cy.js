describe('Smoke Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the page header', () => {
    cy.contains('h1', 'Priorities').should('be.visible');
  });

  it('displays the task input field', () => {
    cy.get('input#task-input')
      .should('be.visible')
      .and('have.attr', 'placeholder', 'Search or add');
  });

  it('displays the Add Task button', () => {
    cy.get('button#add-task-btn')
      .should('be.visible')
      .and('contain', 'Add Task');
  });

  it('displays the task list section', () => {
    cy.get('section#task-list').should('exist');
  });

  it('can focus the input field', () => {
    cy.get('input#task-input').focus().should('have.focus');
  });

  it('can create and delete a basic task', () => {
    const taskName = `Smoke test ${Date.now()}`;

    // Create
    cy.createTask(taskName);
    cy.taskShouldExist(taskName);

    // Delete
    cy.deleteTask(taskName);
    cy.taskShouldNotExist(taskName);
  });
});
