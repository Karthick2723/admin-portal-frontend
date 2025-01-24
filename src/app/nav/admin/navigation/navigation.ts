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
    id: 'dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'Dashboard',
        title: 'Home',
        type: 'item',
        classes: 'nav-item',
        url: 'dashboard',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'Category',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'Category',
        title: 'Services / Technologies',
        type: 'item',
        url: '/services&technologies',
        classes: 'nav-item',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'orders',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'orders',
        title: 'Orders',
        type: 'item',
        classes: 'nav-item',
        url: 'orders',
        breadcrumbs: false
      }
    ]
  },
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
  },
  {
    id: 'eventsSeminar',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'events',
        title: 'Events',
        type: 'item',
        classes: 'nav-item',
        url: 'events',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'clients',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'clients',
        title: 'Clients',
        type: 'item',
        classes: 'nav-item',
        url: 'clients',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'postarticle',
    title: 'Post/Article',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'postarticle',
        title: 'Post/Article',
        type: 'item',
        classes: 'nav-item',
        url: 'postarticle',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'banner',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'banner',
        title: 'Personalization',
        type: 'item',
        classes: 'nav-item',
        url: 'banner',
        breadcrumbs: false
      }
    ]
  }
];

@Injectable()
export class NavigationItem {
  get() {
    return NavigationItems;
  }
}
