import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  newPasswordHidden: boolean = true;
  confirmPasswordHidden: boolean = true;
  @ViewChild('newPassword') newPassword!: ElementRef<HTMLInputElement>;
  @ViewChild('confirmPassword') confirmPassword!: ElementRef<HTMLInputElement>;
  showAlert: boolean = false;
  usernameValue: string | null = null;
  isUsernameDisabled: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    public alertService: AlertService,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Retrieve userDBName from AuthService
    this.usernameValue = this.authService.getUserDBName();

    // Check for username parameter in query params
    this.route.queryParams.subscribe(params => {
      if (params['username']) {
        // Update usernameValue if present in query params
        this.usernameValue = params['username'];
        this.isUsernameDisabled = true; // Disable the username input field
      }
    });
  }

  submitForm(): void {
    const username = this.usernameValue || '';
    const newPassword = this.newPassword.nativeElement.value;
    const confirmPassword = this.confirmPassword.nativeElement.value;

    this.changePassword(username, newPassword, confirmPassword);
  }

  changePassword(username: string, newPassword: string, confirmPassword: string): void {
    const apiUrl = `http://192.168.207.18:4499/api/PasswordChange/ChangePassword/${username}/${newPassword}/${confirmPassword}`;
    const token = this.authService.getToken();

    if (!token) {
      this.handleError('Bearer token not found');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<any>(apiUrl, {}, { headers }).subscribe(
      (response: any) => {
        if (response.responseCode === '00') {
          this.alertService.showAlert('success', 'Password change successful');
        } else if (response.responseCode === '99') {
          this.alertService.showAlert('error', 'Password change unsuccessful');
        } else {
          this.alertService.showAlert('error', response.responseMessage);
        }
      },
      (error: any) => {
        this.handleError('Error changing password');
      }
    );
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'newPassword') {
      this.newPasswordHidden = !this.newPasswordHidden;
    } else if (field === 'confirmPassword') {
      this.confirmPasswordHidden = !this.confirmPasswordHidden;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/home');
  }

  private handleSuccessfulResponse(message: string): void {
    this.showAlertMessage('success', message);
  }

  private handleError(error: string): void {
    this.showAlertMessage('error', error);
  }

  private showAlertMessage(type: 'success' | 'error', message: string): void {
    this.showAlert = true;
    this.alertService.showAlert(type, message);
  }
}
