import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuestComponent } from './main/guest/guest.component';
import { AdminComponent } from './nav/admin/admin.component';
import LoginComponent from './main/authentication/login/login.component';
import { authGuard } from './main/authentication/auth/auth.guard';
import { UserManagementComponent } from './main/user-management/user-management.component';
import { AddUsermanagementComponent } from './main/user-management/add-usermanagement/add-usermanagement.component';


const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full',

      },
      {
        path: 'add-Usermanagement',
        loadComponent: () =>
          import('../app/main/user-management/user-management.component').then(
            (m) => m.UserManagementComponent
          ),
      },
      { 
        path: 'dashboard',
        loadComponent: () => import('./main/dashboard/dashboard.component'),
        canActivate: [authGuard]
      },
      {
        path: 'UserManagement',
        component: UserManagementComponent,
        canActivate: [authGuard]
      },
      {
        path: 'UserManagement/add-Usermanagement',
        component: AddUsermanagementComponent,
        canActivate: [authGuard]
      },
      { 
        path: 'create-Usermanagement',
        component: AddUsermanagementComponent,
      },
      
    ]
  },
  {
    path: 'login',
    component: LoginComponent,

  },
  { 
    path: 'create-User',
    component: AddUsermanagementComponent,
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'guest',
        loadChildren: () => import('./main/authentication/authentication.module').then((m) => m.AuthenticationModule),
        canActivate: [authGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
