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
    cy.get('input[placeholder="Task title"]').type(newTaskTitle);
    cy.get('input[placeholder="Description (optional)"]').type('Created by Cypress');
    cy.contains('Add Task').click();

    cy.contains(newTaskTitle).should('be.visible');
  });

  it('marks a task as complete', () => {
    // Add a task first
    cy.get('input[placeholder="Task title"]').type('Toggle Test');
    cy.contains('Add Task').click();

    cy.contains('Toggle Test')
      .parent('.task')
      .within(() => {
        cy.contains('Complete').click();
        cy.contains('Undo').should('be.visible');
      });
  });

  it('deletes a task', () => {
    // Add a task first
    cy.get('input[placeholder="Task title"]').type('Delete Me');
    cy.contains('Add Task').click();

    cy.contains('Delete Me')
      .parent('.task')
      .within(() => {
        cy.contains('Delete').click();
      });

    cy.contains('Delete Me').should('not.exist');
  });
});
