describe('Repeat Configuration', () => {
  const testPrefix = 'Repeat Test';
  let testTaskName;

  beforeEach(() => {
    cy.visit('/');
    testTaskName = `${testPrefix} ${Date.now()}`;
    cy.createTask(testTaskName);
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

  describe('Repeat Mode Selection', () => {
    it('defaults to No Repeat mode', () => {
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('select[name="repeat-mode"]')
        .should('have.value', 'none');
    });

    it('can set repeat mode to No Repeat', () => {
      cy.setRepeatMode(testTaskName, 'none');
      cy.findTask(testTaskName)
        .find('select[name="repeat-mode"]')
        .should('have.value', 'none');
    });

    it('can set repeat mode to After Complete', () => {
      cy.setRepeatMode(testTaskName, 'after-completion');
      cy.findTask(testTaskName)
        .find('select[name="repeat-mode"]')
        .should('have.value', 'after-completion');
    });

    it('shows repeat interval controls when After Complete is selected', () => {
      cy.setRepeatMode(testTaskName, 'after-completion');
      cy.findTask(testTaskName)
        .find('input[name="repeat-number"]')
        .should('be.visible');
      cy.findTask(testTaskName)
        .find('select[name="repeat-unit"]')
        .should('be.visible');
    });

    it('hides Complete button when No Repeat is set', () => {
      cy.setRepeatMode(testTaskName, 'none');
      cy.findTask(testTaskName)
        .find('button.complete')
        .should('have.class', 'hidden-expanded');
    });

    it('shows Complete button when After Complete is set', () => {
      cy.setRepeatMode(testTaskName, 'after-completion');
      cy.setRepeatInterval(testTaskName, 1, 'days');
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('button.complete')
        .should('not.have.class', 'hidden-expanded');
    });
  });

  describe('Repeat Interval Settings', () => {
    beforeEach(() => {
      cy.setRepeatMode(testTaskName, 'after-completion');
    });

    it('can set repeat number', () => {
      cy.findTask(testTaskName)
        .find('input[name="repeat-number"]')
        .clear()
        .type('5');
      cy.findTask(testTaskName)
        .find('input[name="repeat-number"]')
        .should('have.value', '5');
    });

    it('can set repeat unit to Days', () => {
      cy.setRepeatInterval(testTaskName, 1, 'days');
      cy.findTask(testTaskName)
        .find('select[name="repeat-unit"]')
        .should('have.value', 'days');
    });

    it('can set repeat unit to Weeks', () => {
      cy.setRepeatInterval(testTaskName, 1, 'weeks');
      cy.findTask(testTaskName)
        .find('select[name="repeat-unit"]')
        .should('have.value', 'weeks');
    });

    it('can set repeat unit to Months', () => {
      cy.setRepeatInterval(testTaskName, 1, 'months');
      cy.findTask(testTaskName)
        .find('select[name="repeat-unit"]')
        .should('have.value', 'months');
    });

    it('can set repeat unit to Years', () => {
      cy.setRepeatInterval(testTaskName, 1, 'years');
      cy.findTask(testTaskName)
        .find('select[name="repeat-unit"]')
        .should('have.value', 'years');
    });

    it('settings persist after page reload', () => {
      cy.setRepeatInterval(testTaskName, 3, 'weeks');
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('select[name="repeat-mode"]')
        .should('have.value', 'after-completion');
      cy.findTask(testTaskName)
        .find('input[name="repeat-number"]')
        .should('have.value', '3');
      cy.findTask(testTaskName)
        .find('select[name="repeat-unit"]')
        .should('have.value', 'weeks');
    });
  });

  describe('Repeat Combinations', () => {
    it('configures repeat every 3 days after complete', () => {
      cy.configureRepeat(testTaskName, 'after-completion', 3, 'days');
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('input[name="repeat-number"]')
        .should('have.value', '3');
      cy.findTask(testTaskName)
        .find('select[name="repeat-unit"]')
        .should('have.value', 'days');
    });

    it('configures repeat every 2 weeks after complete', () => {
      cy.configureRepeat(testTaskName, 'after-completion', 2, 'weeks');
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('input[name="repeat-number"]')
        .should('have.value', '2');
      cy.findTask(testTaskName)
        .find('select[name="repeat-unit"]')
        .should('have.value', 'weeks');
    });

    it('configures repeat every 1 month after complete', () => {
      cy.configureRepeat(testTaskName, 'after-completion', 1, 'months');
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('input[name="repeat-number"]')
        .should('have.value', '1');
      cy.findTask(testTaskName)
        .find('select[name="repeat-unit"]')
        .should('have.value', 'months');
    });

    it('configures repeat every 1 year after complete', () => {
      cy.configureRepeat(testTaskName, 'after-completion', 1, 'years');
      cy.wait(500);
      cy.reload();
      cy.wait(500);
      cy.expandTask(testTaskName);
      cy.findTask(testTaskName)
        .find('input[name="repeat-number"]')
        .should('have.value', '1');
      cy.findTask(testTaskName)
        .find('select[name="repeat-unit"]')
        .should('have.value', 'years');
    });
  });
});
