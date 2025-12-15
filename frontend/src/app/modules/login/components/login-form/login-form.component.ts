import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;
  showPassword = false;  // T060: Password visibility toggle

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // T029: Initialize reactive form with username and password controls with Validators.required
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // T051: Clear error message when user starts typing
    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = null;
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // T030: Call AuthService.login() and handle success/error responses
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.success) {
          // T035: Navigate to dashboard on successful login
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.error?.message || 'Login failed. Please try again.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'An error occurred. Please try again.';
        this.isLoading = false;
        console.error('Login error:', error);
      }
    });
  }

  // Helper methods for template
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  hasError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  // T061: Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // T071: Forgot password handler
  onForgotPassword(): void {
    this.errorMessage = 'Password reset coming soon';
  }
}
