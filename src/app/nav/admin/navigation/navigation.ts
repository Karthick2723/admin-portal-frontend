import { Injectable } from '@angular/core';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  icon?: string;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: Navigation[];
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[];
}
const NavigationItems = [
  {
    id: 'UserManagement',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'UserManagement',
        title: 'User Management',
        type: 'item',
        classes: 'nav-item',
        url: 'UserManagement',
        breadcrumbs: false
      },
    ]
  }
];

@Injectable()
export class NavigationItem {
  get() {
    return NavigationItems;
  }
}
