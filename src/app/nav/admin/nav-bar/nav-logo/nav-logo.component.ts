import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-nav-logo',
  templateUrl: './nav-logo.component.html',
  styleUrls: ['./nav-logo.component.scss']
})
export class NavLogoComponent {
  @Input() navCollapsed: boolean;
  @Output() NavCollapse = new EventEmitter();
  windowWidth: number;
  isOpen = false;
  profileLinks = [
    { route: '/logout', label: 'Logout' }
  ];

  @ViewChild('dropdown') dropdown: ElementRef;
  constructor(private authService: AuthService, private eRef: ElementRef) {
    this.windowWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.windowWidth = (event.target as Window).innerWidth;
  }

  navCollapse() {
    this.navCollapsed = this.navCollapsed;
    this.NavCollapse.emit();
  }

  handleLinkClick(): void {
    this.logout();
  }

  logout(): void {
    this.authService.logOut();
  }

  toggleProfileDropdown(event: Event) {
    event.stopPropagation(); 
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event) {
    if (!this.dropdown.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  getProfileImageFileName(): string {
    const fileName = `A`;
    return fileName;
  }

}
