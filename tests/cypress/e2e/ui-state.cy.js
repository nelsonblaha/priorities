describe('UI State & Interactions', () => {
  const testPrefix = 'UI Test';
  let testTaskName;

  beforeEach(() => {
    cy.visit('/');
    testTaskName = `${testPrefix} ${Date.now()}`;
  });

  afterEach(() => {
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

  describe('Task Expansion/Collapse', () => {
    it('click task description to expand', () => {
      cy.createTask(testTaskName);
      cy.reload();
      cy.wait(500);

      cy.findTask(testTaskName).should('not.have.class', 'focused');
      cy.findTask(testTaskName).find('a.description-text').click();
      cy.findTask(testTaskName).should('have.class', 'focused');
    });

    it('click again to collapse', () => {
      cy.createTask(testTaskName);
      cy.reload();
      cy.wait(500);

      cy.expandTask(testTaskName);
      cy.findTask(testTaskName).should('have.class', 'focused');

      cy.findTask(testTaskName).find('a.description-text').click();
      cy.findTask(testTaskName).should('not.have.class', 'focused');
    });

    it('only one task expanded at a time', () => {
      const task1 = `${testTaskName} 1`;
      const task2 = `${testTaskName} 2`;

      cy.createTask(task1);
      cy.wait(300);
      cy.createTask(task2);
      cy.wait(300);
      cy.reload();
      cy.wait(500);

      // Expand first task
      cy.expandTask(task1);
      cy.findTask(task1).should('have.class', 'focused');

      // Expand second task - first should collapse
      cy.expandTask(task2);
      cy.findTask(task2).should('have.class', 'focused');
      cy.findTask(task1).should('not.have.class', 'focused');
    });

    it('clicking task description again collapses it', () => {
      cy.createTask(testTaskName);
      cy.reload();
      cy.wait(500);

      cy.expandTask(testTaskName);
      cy.findTask(testTaskName).should('have.class', 'focused');

      // Click the description again to collapse
      cy.collapseTask(testTaskName);
      cy.findTask(testTaskName).should('not.have.class', 'focused');
    });
  });

  describe('Form States', () => {
    it('Add Task button is present', () => {
      cy.get('button#add-task-btn')
        .should('be.visible')
        .and('contain', 'Add Task');
    });

    it('task input accepts text', () => {
      cy.get('input#task-input')
        .type('Test input')
        .should('have.value', 'Test input');
    });

    it('task input clears after adding task', () => {
      cy.createTask(testTaskName);
      cy.get('input#task-input').should('have.value', '');
    });

    it('edit mode shows input field with current value', () => {
      cy.createTask(testTaskName);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName).find('button.edit-description').click();

      cy.findTask(testTaskName)
        .find('input.edit-description')
        .should('be.visible')
        .and('have.value', testTaskName);
    });

    it('edit mode hides description text', () => {
      cy.createTask(testTaskName);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName).find('button.edit-description').click();

      cy.findTask(testTaskName)
        .find('a.description-text')
        .should('have.class', 'hidden-expanded');
    });

    it('Save button appears in edit mode', () => {
      cy.createTask(testTaskName);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName).find('button.edit-description').click();

      cy.findTask(testTaskName)
        .find('button.update-description')
        .should('be.visible');
    });

    it('Edit Description button is hidden in edit mode', () => {
      cy.createTask(testTaskName);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName).find('button.edit-description').click();

      cy.findTask(testTaskName)
        .find('button.edit-description')
        .should('have.class', 'hidden-expanded');
    });
  });

  describe('Action Buttons', () => {
    beforeEach(() => {
      cy.createTask(testTaskName);
    });

    it('shows Edit Description button when expanded', () => {
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('button.edit-description')
        .should('be.visible');
    });

    it('shows Delete button when expanded', () => {
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('button.delete')
        .should('be.visible');
    });

    it('buttons are in a button group', () => {
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('.actions.btn-group')
        .should('exist')
        .within(() => {
          cy.get('button.edit-description').should('exist');
          cy.get('button.delete').should('exist');
        });
    });
  });

  describe('Visual/Dark Theme', () => {
    it('page has dark background', () => {
      cy.get('body').should('have.css', 'background-color').and('match', /rgb\(0, 0, 0\)|rgba\(0, 0, 0/);
    });

    it('header is visible', () => {
      cy.get('h1').contains('Priorities').should('be.visible');
    });

    it('input field is visible and styled', () => {
      cy.get('input#task-input')
        .should('be.visible');
    });

    it('buttons have Bootstrap styling', () => {
      cy.get('button#add-task-btn')
        .should('have.class', 'btn')
        .and('have.class', 'btn-outline-primary');
    });
  });

  describe('Repeat Controls Visibility', () => {
    beforeEach(() => {
      cy.createTask(testTaskName);
    });

    it('repeat mode dropdown is visible when expanded', () => {
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('select[name="repeat-mode"]')
        .should('be.visible');
    });

    it('repeat number input appears when After Complete selected', () => {
      cy.expandTask(testTaskName);
      cy.setRepeatMode(testTaskName, 'after-completion');

      cy.findTask(testTaskName)
        .find('input[name="repeat-number"]')
        .should('be.visible');
    });

    it('repeat unit dropdown appears when After Complete selected', () => {
      cy.expandTask(testTaskName);
      cy.setRepeatMode(testTaskName, 'after-completion');

      cy.findTask(testTaskName)
        .find('select[name="repeat-unit"]')
        .should('be.visible');
    });
  });
});
