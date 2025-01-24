import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuestComponent } from './main/guest/guest.component';
import { AdminComponent } from './nav/admin/admin.component';
import LoginComponent from './main/authentication/login/login.component';
import { LineOfbussinessComponent } from './main/line-ofbussiness/line-ofbussiness.component';
import { AddLineofbusinessComponent } from './main/line-ofbussiness/add-lineofbusiness/add-lineofbusiness.component';
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
        path: 'dashboard',
        loadComponent: () => import('./main/dashboard/dashboard.component'),
        canActivate: [authGuard]
      },
      {
        path: 'LineOfBussiness',
        component: LineOfbussinessComponent,
        canActivate: [authGuard]
      },
      {
        path: "add-Bussiness",
        component: AddLineofbusinessComponent,
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
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent,

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
