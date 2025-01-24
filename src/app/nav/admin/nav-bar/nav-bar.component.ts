import { Component, EventEmitter, Output } from '@angular/core';
import { SoliceConfig } from 'src/app/app-config';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  @Output() NavCollapse = new EventEmitter();
  @Output() NavCollapsedMob = new EventEmitter();
  navCollapsed;
  windowWidth: number;
  navCollapsedMob;
  constructor() {
    this.windowWidth = window.innerWidth;
    this.navCollapsed = this.windowWidth >= 1025 ? SoliceConfig.isCollapse_menu : false;
    this.navCollapsedMob = false;
  }

  navCollapse() {
      this.navCollapsed = this.navCollapsed;
      this.NavCollapse.emit();
    
  }

  navCollapseMob() {
    if (this.windowWidth < 1025) {
      this.NavCollapsedMob.emit();
    }
  }
}
