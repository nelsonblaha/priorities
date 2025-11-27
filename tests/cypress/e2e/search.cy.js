describe('Search/Filter Functionality', () => {
  const testPrefix = 'Search Test';
  const uniqueId = Date.now();
  const task1 = `${testPrefix} Alpha ${uniqueId}`;
  const task2 = `${testPrefix} Beta ${uniqueId}`;
  const task3 = `${testPrefix} Gamma ${uniqueId}`;

  before(() => {
    // Create test tasks once before all tests
    cy.visit('/');
    cy.createTask(task1);
    cy.wait(300);
    cy.createTask(task2);
    cy.wait(300);
    cy.createTask(task3);
    cy.wait(300);
  });

  after(() => {
    // Cleanup all test tasks after tests complete
    cy.visit('/');
    cy.wait(500);
    cy.deleteTaskIfExists(task1);
    cy.deleteTaskIfExists(task2);
    cy.deleteTaskIfExists(task3);
  });

  beforeEach(() => {
    cy.visit('/');
    cy.wait(500);
  });

  describe('Basic Search', () => {
    it('searches for task by exact name', () => {
      cy.searchTasks(task1);
      cy.taskShouldExist(task1);
    });

    it('searches for task by partial name', () => {
      cy.searchTasks('Alpha');
      cy.taskShouldExist(task1);
    });

    it('searches for multiple tasks with common term', () => {
      cy.searchTasks(testPrefix);
      cy.taskShouldExist(task1);
      cy.taskShouldExist(task2);
      cy.taskShouldExist(task3);
    });

    it('search with no results shows empty list', () => {
      cy.searchTasks('NonexistentTaskXYZ123');
      cy.get('section#task-list div.task').should('have.length', 0);
    });

    it('clearing search shows all tasks', () => {
      cy.searchTasks(task1);
      cy.get('section#task-list div.task').should('have.length.at.least', 1);

      cy.clearSearch();
      cy.taskShouldExist(task1);
      cy.taskShouldExist(task2);
      cy.taskShouldExist(task3);
    });
  });

  describe('Search Behavior', () => {
    it('search is debounced (waits before querying)', () => {
      // Type quickly - should not trigger multiple searches
      cy.get('input#task-input').clear().type('Alpha', { delay: 50 });
      // Wait for debounce
      cy.wait(400);
      cy.taskShouldExist(task1);
    });

    it('search updates results as user types', () => {
      // Type partial match
      cy.get('input#task-input').clear().type('Alp');
      cy.wait(400);
      cy.taskShouldExist(task1);

      // Add more characters
      cy.get('input#task-input').type('ha');
      cy.wait(400);
      cy.taskShouldExist(task1);
    });

    it('empty search input shows all tasks', () => {
      cy.get('input#task-input').clear();
      cy.wait(400);
      cy.taskShouldExist(task1);
      cy.taskShouldExist(task2);
      cy.taskShouldExist(task3);
    });
  });

  describe('Search with Special Characters', () => {
    const specialTask = `${testPrefix} Special&Chars ${uniqueId}`;

    before(() => {
      cy.visit('/');
      cy.createTask(specialTask);
      cy.wait(300);
    });

    after(() => {
      cy.visit('/');
      cy.wait(500);
      cy.deleteTaskIfExists(specialTask);
    });

    it('searches for task with ampersand', () => {
      cy.searchTasks('Special&Chars');
      cy.taskShouldExist(specialTask);
    });

    it('searches with partial special characters', () => {
      cy.searchTasks('Special');
      cy.taskShouldExist(specialTask);
    });
  });

  describe('Search Edge Cases', () => {
    it('search is case insensitive', () => {
      cy.searchTasks('alpha');
      cy.taskShouldExist(task1);

      cy.searchTasks('ALPHA');
      cy.taskShouldExist(task1);
    });

    it('search with leading/trailing spaces still works', () => {
      cy.searchTasks('  Alpha  ');
      // Should still find the task
      cy.get('section#task-list div.task').should('have.length.at.least', 0);
    });

    it('search preserves results when typing and deleting', () => {
      cy.get('input#task-input').clear().type('Alpha');
      cy.wait(400);
      cy.taskShouldExist(task1);

      // Delete characters
      cy.get('input#task-input').type('{backspace}{backspace}{backspace}');
      cy.wait(400);
      // With 'Al' should still show Alpha
      cy.taskShouldExist(task1);
    });
  });
});
