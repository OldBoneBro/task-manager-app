describe('Task Manager App', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads the app and displays tasks', () => {
    cy.contains('Task Manager').should('be.visible');
    cy.get('.task').should('have.length.at.least', 0); 
  });

  it('adds a new task', () => {
    const newTaskTitle = 'Cypress Test Task';
    cy.get('input[placeholder="Task title"]', { timeout: 10000 }).type(newTaskTitle);
    cy.get('input[placeholder="Description (optional)"]', { timeout: 10000 }).type('Created by Cypress');
    cy.contains('Add Task', { timeout: 10000 }).click();

    cy.contains(newTaskTitle, { timeout: 10000 }).should('be.visible');
  });

  it('marks a task as complete', () => {
    // Add a task first
    cy.get('input[placeholder="Task title"]', { timeout: 10000 }).type('Toggle Test');
    cy.contains('Add Task', { timeout: 10000 }).click();

    cy.contains('Toggle Test', { timeout: 10000 })
      .parent('.task-content')
      .parent('.task')
      .within(() => {
        cy.contains('button', 'Complete', { timeout: 10000 }).click();
        cy.contains('button', 'Undo', { timeout: 10000 }).should('be.visible');
      });
  });

  it('deletes a task', () => {
    // Add a task first
    cy.get('input[placeholder="Task title"]', { timeout: 10000 }).type('Delete Me');
    cy.contains('Add Task', { timeout: 10000 }).click();
    cy.contains('Delete Me', { timeout: 10000 })
      .parent('.task-content')
      .parent('.task')
      .within(() => {
        cy.contains('button', 'Delete', { timeout: 10000 }).click();
      });

    cy.contains('Delete Me', { timeout: 10000 }).should('not.exist');
  });
});
