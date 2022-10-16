describe('form library', () => {
	it('should allow you to register and login', () => {
		cy.visitAndCheck('/');

		cy.findByRole('button', { name: /submit/i }).click();

		cy.findByText(/name is required/i).should('exist');
		cy.findByRole('textbox', { name: /name/i }).type('Hello');

		cy.findByText(/name is required/i).should('not.exist');
	});
});
