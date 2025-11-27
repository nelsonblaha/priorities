// Custom Cypress commands for Priorities app

const BASE_URL = 'http://localhost:8080';

// Generate unique task name to avoid collisions
Cypress.Commands.add('uniqueTaskName', (prefix = 'Test') => {
  return `${prefix} ${Date.now()}`;
});

// Create a new task
Cypress.Commands.add('createTask', (description) => {
  cy.get('input#task-input').clear().type(description);
  cy.get('button#add-task-btn').click();
  // Wait for debounced search to settle (300ms debounce + buffer)
  cy.wait(500);
  cy.get('section#task-list')
    .find('div.task a.description-text')
    .contains(description)
    .should('exist');
});

// Find a task by description
Cypress.Commands.add('findTask', (description) => {
  return cy.get('section#task-list div.task')
    .contains('a.description-text', description)
    .parents('div.task');
});

// Expand a task (click to show controls)
Cypress.Commands.add('expandTask', (description) => {
  cy.findTask(description).then($task => {
    if (!$task.hasClass('focused')) {
      cy.wrap($task).find('a.description-text').click();
    }
  });
  cy.findTask(description).should('have.class', 'focused');
});

// Collapse a task
Cypress.Commands.add('collapseTask', (description) => {
  cy.findTask(description).then($task => {
    if ($task.hasClass('focused')) {
      cy.wrap($task).find('a.description-text').click();
    }
  });
  cy.findTask(description).should('not.have.class', 'focused');
});

// Delete a task
Cypress.Commands.add('deleteTask', (description) => {
  cy.expandTask(description);
  // Set up confirmation handler BEFORE clicking
  cy.window().then((win) => {
    // Only stub if not already stubbed
    if (!win.confirm.restore) {
      cy.stub(win, 'confirm').returns(true);
    }
  });
  // Wait for button to be visible after expansion
  cy.findTask(description).find('button.delete').should('be.visible').click();
  cy.wait(500); // Wait for delete to complete
});

// Delete task if it exists (for cleanup)
Cypress.Commands.add('deleteTaskIfExists', (description) => {
  cy.get('body').then($body => {
    const taskExists = $body.find(`section#task-list div.task a.description-text:contains("${description}")`).length > 0;
    if (taskExists) {
      cy.deleteTask(description);
    }
  });
});

// Complete a task
Cypress.Commands.add('completeTask', (description) => {
  cy.expandTask(description);
  cy.findTask(description).find('button.complete').click();
});

// Edit task description
Cypress.Commands.add('editTaskDescription', (oldDescription, newDescription) => {
  cy.expandTask(oldDescription);
  cy.findTask(oldDescription).find('button.edit-description').click();
  cy.findTask(oldDescription).find('input.edit-description')
    .clear()
    .type(newDescription);
  cy.findTask(oldDescription).find('button.update-description').click();
});

// Set repeat mode on a task
Cypress.Commands.add('setRepeatMode', (description, mode) => {
  cy.expandTask(description);
  cy.findTask(description)
    .find('select[name="repeat-mode"]')
    .select(mode);
});

// Set repeat interval (number and unit)
Cypress.Commands.add('setRepeatInterval', (description, number, unit) => {
  cy.expandTask(description);
  cy.findTask(description)
    .find('input[name="repeat-number"]')
    .clear()
    .type(number.toString())
    .blur();  // Trigger change event on blur
  // Wait for number change to complete before setting unit
  cy.wait(600);
  cy.findTask(description)
    .find('select[name="repeat-unit"]')
    .select(unit)
    .trigger('change');  // Explicitly trigger change
  // Wait for the unit change to trigger save and re-render
  cy.wait(600);
});

// Configure full repeat settings
Cypress.Commands.add('configureRepeat', (description, mode, number, unit) => {
  cy.setRepeatMode(description, mode);
  if (mode === 'after-completion' && number && unit) {
    cy.setRepeatInterval(description, number, unit);
  }
});

// Search for tasks
Cypress.Commands.add('searchTasks', (term) => {
  cy.get('input#task-input').clear();
  if (term) {
    cy.get('input#task-input').type(term);
  }
  // Wait for debounce
  cy.wait(400);
});

// Clear search
Cypress.Commands.add('clearSearch', () => {
  cy.get('input#task-input').clear();
  cy.wait(400);
});

// Get task count
Cypress.Commands.add('getTaskCount', () => {
  return cy.get('section#task-list div.task').its('length');
});

// Assert task exists
Cypress.Commands.add('taskShouldExist', (description) => {
  cy.get('section#task-list')
    .find('div.task a.description-text')
    .contains(description)
    .should('exist');
});

// Assert task does not exist
Cypress.Commands.add('taskShouldNotExist', (description) => {
  cy.get('section#task-list').then($section => {
    const matches = $section.find(`div.task a.description-text:contains("${description}")`);
    expect(matches.length).to.equal(0);
  });
});
