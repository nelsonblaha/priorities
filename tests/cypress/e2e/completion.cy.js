describe('Task Completion Flow', () => {
  const testPrefix = 'Completion Test';
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

  describe('Basic Completion', () => {
    it('Complete button is hidden for non-repeating tasks', () => {
      cy.createTask(testTaskName);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('button.complete')
        .should('have.class', 'hidden-expanded');
    });

    it('Complete button is visible for repeating tasks', () => {
      cy.createTask(testTaskName);
      cy.configureRepeat(testTaskName, 'after-completion', 1, 'days');
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('button.complete')
        .should('be.visible')
        .and('not.have.class', 'hidden-expanded');
    });

    it('clicking Complete on repeating task removes it from view', () => {
      cy.createTask(testTaskName);
      cy.configureRepeat(testTaskName, 'after-completion', 1, 'days');
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.completeTask(testTaskName);
      cy.wait(500);
      // Task should disappear because it's not visible until the repeat interval passes
      cy.taskShouldNotExist(testTaskName);
    });

    it('completed task does not appear after page reload', () => {
      cy.createTask(testTaskName);
      cy.configureRepeat(testTaskName, 'after-completion', 1, 'days');
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.completeTask(testTaskName);
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      // Still should not exist as visible_at is in the future
      cy.taskShouldNotExist(testTaskName);
    });
  });

  describe('Repeat Interval Variations', () => {
    it('task with daily repeat disappears after completion', () => {
      cy.createTask(testTaskName);
      cy.configureRepeat(testTaskName, 'after-completion', 1, 'days');
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.completeTask(testTaskName);
      cy.wait(500);
      cy.taskShouldNotExist(testTaskName);
    });

    it('task with weekly repeat disappears after completion', () => {
      const weeklyTask = `${testPrefix} Weekly ${Date.now()}`;
      cy.createTask(weeklyTask);
      cy.configureRepeat(weeklyTask, 'after-completion', 1, 'weeks');
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.completeTask(weeklyTask);
      cy.wait(500);
      cy.taskShouldNotExist(weeklyTask);
    });

    it('task with monthly repeat disappears after completion', () => {
      const monthlyTask = `${testPrefix} Monthly ${Date.now()}`;
      cy.createTask(monthlyTask);
      cy.configureRepeat(monthlyTask, 'after-completion', 1, 'months');
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.completeTask(monthlyTask);
      cy.wait(500);
      cy.taskShouldNotExist(monthlyTask);
    });
  });

  describe('Complete Button State', () => {
    it('Complete button becomes visible after setting repeat mode', () => {
      cy.createTask(testTaskName);
      cy.expandTask(testTaskName);

      // Initially hidden
      cy.findTask(testTaskName)
        .find('button.complete')
        .should('have.class', 'hidden-expanded');

      // Set repeat mode
      cy.setRepeatMode(testTaskName, 'after-completion');
      cy.setRepeatInterval(testTaskName, 1, 'days');
      cy.wait(500);

      // After reload, should be visible
      cy.reload();
      cy.wait(500);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('button.complete')
        .should('not.have.class', 'hidden-expanded');
    });

    it('Complete button becomes hidden after setting No Repeat mode', () => {
      cy.createTask(testTaskName);
      cy.configureRepeat(testTaskName, 'after-completion', 1, 'days');
      cy.wait(500);
      cy.reload();
      cy.wait(500);

      // Set back to no repeat
      cy.setRepeatMode(testTaskName, 'none');
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.expandTask(testTaskName);

      cy.findTask(testTaskName)
        .find('button.complete')
        .should('have.class', 'hidden-expanded');
    });
  });
});
