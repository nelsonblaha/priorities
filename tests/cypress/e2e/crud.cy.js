describe('Task CRUD Operations', () => {
  const testPrefix = 'CRUD Test';
  let testTaskName;

  beforeEach(() => {
    cy.visit('/');
    testTaskName = `${testPrefix} ${Date.now()}`;
  });

  afterEach(() => {
    // Cleanup: delete any test tasks that might remain
    cy.visit('/');
    cy.wait(500);
    cy.get('body').then($body => {
      const testTasks = $body.find(`section#task-list div.task a.description-text:contains("${testPrefix}")`);
      if (testTasks.length > 0) {
        testTasks.each((_, el) => {
          const description = el.textContent;
          cy.deleteTaskIfExists(description);
        });
      }
    });
  });

  describe('Create Tasks', () => {
    it('creates a task with basic description', () => {
      cy.createTask(testTaskName);
      cy.taskShouldExist(testTaskName);
    });

    it('creates a task with special characters', () => {
      const specialTask = `${testPrefix} <special> & "chars" '${Date.now()}'`;
      cy.createTask(specialTask);
      cy.taskShouldExist(specialTask);
    });

    it('creates a task with very long description', () => {
      const longTask = `${testPrefix} ${'A'.repeat(200)} ${Date.now()}`;
      cy.createTask(longTask);
      cy.get('section#task-list div.task a.description-text')
        .contains(testPrefix)
        .should('exist');
    });

    it('creates multiple tasks in succession', () => {
      const task1 = `${testTaskName} 1`;
      const task2 = `${testTaskName} 2`;
      const task3 = `${testTaskName} 3`;

      cy.createTask(task1);
      cy.createTask(task2);
      cy.createTask(task3);

      cy.taskShouldExist(task1);
      cy.taskShouldExist(task2);
      cy.taskShouldExist(task3);
    });

    it('clears input after creating task', () => {
      cy.createTask(testTaskName);
      cy.get('input#task-input').should('have.value', '');
    });

    it('can expand the newly created task', () => {
      cy.createTask(testTaskName);
      // After debounce, focus is lost, so expand the task
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName).should('have.class', 'focused');
    });
  });

  describe('Read/Display Tasks', () => {
    beforeEach(() => {
      cy.createTask(testTaskName);
    });

    it('displays task description correctly', () => {
      cy.findTask(testTaskName)
        .find('a.description-text')
        .should('have.text', testTaskName);
    });

    it('tasks are initially collapsed after page reload', () => {
      cy.reload();
      cy.wait(500);
      cy.findTask(testTaskName).should('not.have.class', 'focused');
    });

    it('clicking task expands it', () => {
      cy.reload();
      cy.wait(500);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName).should('have.class', 'focused');
    });

    it('clicking expanded task collapses it', () => {
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName).should('have.class', 'focused');
      cy.collapseTask(testTaskName);
      cy.findTask(testTaskName).should('not.have.class', 'focused');
    });
  });

  describe('Update Tasks', () => {
    beforeEach(() => {
      cy.createTask(testTaskName);
    });

    it('shows edit description button when expanded', () => {
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('button.edit-description')
        .should('be.visible');
    });

    it('clicking Edit Description shows input field', () => {
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName).find('button.edit-description').click();
      cy.findTask(testTaskName)
        .find('input.edit-description')
        .should('be.visible')
        .and('have.value', testTaskName);
    });

    it('shows Save button when editing', () => {
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName).find('button.edit-description').click();
      cy.findTask(testTaskName)
        .find('button.update-description')
        .should('be.visible');
    });

    it('edits task description and saves', () => {
      const newDescription = `${testPrefix} Updated ${Date.now()}`;
      cy.editTaskDescription(testTaskName, newDescription);
      cy.wait(500);
      cy.taskShouldExist(newDescription);
    });

    it('edited description persists after page reload', () => {
      const newDescription = `${testPrefix} Persisted ${Date.now()}`;
      cy.editTaskDescription(testTaskName, newDescription);
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.taskShouldExist(newDescription);
    });
  });

  describe('Delete Tasks', () => {
    beforeEach(() => {
      cy.createTask(testTaskName);
    });

    it('shows delete button when expanded', () => {
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('button.delete')
        .should('be.visible');
    });

    it('deletes task via Delete button', () => {
      cy.deleteTask(testTaskName);
      cy.taskShouldNotExist(testTaskName);
    });

    it('deleted task does not reappear on reload', () => {
      cy.deleteTask(testTaskName);
      cy.reload();
      cy.wait(500);
      cy.taskShouldNotExist(testTaskName);
    });
  });
});
