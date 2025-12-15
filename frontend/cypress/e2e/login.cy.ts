// T024: successful login flow - enter credentials, click login, verify dashboard redirect
describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should successfully login and redirect to dashboard', () => {
    // Enter valid credentials
    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="password"]').type('password123');

    // Click login button
    cy.get('button[type="submit"]').click();

    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  // T025: login form allows Enter key submission
  it('should allow form submission with Enter key', () => {
    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="password"]').type('password123{enter}');

    // Should redirect to dashboard on successful login
    cy.url().should('include', '/dashboard');
  });

  it('should disable submit button when form is invalid', () => {
    // Submit button should be disabled by default (empty form)
    cy.get('button[type="submit"]').should('be.disabled');

    // Enter only username
    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('button[type="submit"]').should('be.disabled');

    // Enter password - button should now be enabled
    cy.get('input[formControlName="password"]').type('password123');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('should show validation errors when fields are touched', () => {
    // Touch username field and leave it empty
    cy.get('input[formControlName="username"]').focus().blur();
    cy.contains('Username is required').should('be.visible');

    // Touch password field and leave it empty
    cy.get('input[formControlName="password"]').focus().blur();
    cy.contains('Password is required').should('be.visible');
  });

  // Phase 4: Failed Login Tests (T044-T045)

  // T044: failed login shows error message
  it('should show error message on failed login', () => {
    cy.intercept('POST', '**/api/Users/login', {
      statusCode: 401,
      body: {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        }
      }
    }).as('loginFailed');

    cy.get('input[formControlName="username"]').type('wronguser');
    cy.get('input[formControlName="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFailed');
    cy.get('.error-alert').should('be.visible');
    cy.get('.error-alert').should('contain', 'Invalid username or password');
  });

  // T045: user can retry login after error
  it('should allow retry after failed login', () => {
    // First attempt fails
    cy.intercept('POST', '**/api/Users/login', {
      statusCode: 401,
      body: {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        }
      }
    }).as('loginFailed');

    cy.get('input[formControlName="username"]').type('wronguser');
    cy.get('input[formControlName="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFailed');
    cy.get('.error-alert').should('be.visible');

    // Second attempt succeeds
    cy.intercept('POST', '**/api/Users/login', {
      statusCode: 200,
      body: {
        success: true,
        token: 'mock-token',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['user']
        }
      }
    }).as('loginSuccess');

    cy.get('input[formControlName="username"]').clear().type('testuser');
    cy.get('input[formControlName="password"]').clear().type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginSuccess');
    cy.url().should('include', '/dashboard');
  });

  // Phase 5: Password Toggle Tests (T058-T059)

  // T058: clicking toggle button shows password text
  it('should show password text when toggle button is clicked', () => {
    cy.get('input[formControlName="password"]').type('secretPassword123');

    // Password should be hidden by default
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'password');

    // Click the toggle button
    cy.get('button[aria-label*="Show password"]').click();

    // Password should now be visible
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'text');
  });

  // T059: clicking toggle again hides password
  it('should hide password when toggle is clicked again', () => {
    cy.get('input[formControlName="password"]').type('secretPassword123');

    // Show password
    cy.get('button[aria-label*="Show password"]').click();
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'text');

    // Hide password again
    cy.get('button[aria-label*="Hide password"]').click();
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'password');
  });

  // Phase 6: Forgot Password Tests (T070)

  // T070: forgot password link is visible and clickable
  it('should display forgot password link and show coming soon message when clicked', () => {
    const forgotPasswordLink = cy.contains('Forgot Password');
    forgotPasswordLink.should('be.visible');

    forgotPasswordLink.click();

    // Should show "coming soon" message
    cy.contains('Password reset coming soon').should('be.visible');
  });
});
