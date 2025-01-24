import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuestComponent } from './main/guest/guest.component';
import { AdminComponent } from './nav/admin/admin.component';
import { AddCategoryComponent } from './main/Category/add-category/add-category.component';
import { AddProductRoutingModule } from './main/add-product/add-product-routing.module';
import { AddProductComponent } from './main/add-product/add-product.component';
import LoginComponent from './main/authentication/login/login.component';
import { LineOfbussinessComponent } from './main/line-ofbussiness/line-ofbussiness.component';
import { AddLineofbusinessComponent } from './main/line-ofbussiness/add-lineofbusiness/add-lineofbusiness.component';
import { authGuard } from './main/authentication/auth/auth.guard';
import { UserManagementComponent } from './main/user-management/user-management.component';
import { AddUsermanagementComponent } from './main/user-management/add-usermanagement/add-usermanagement.component';
import { OrdersComponent } from './main/orders/orders.component';
import { ClientsComponent } from './main/clients/clients.component';
import { AddClientsComponent } from './main/clients/add-clients/add-clients.component';
import { EventSeminorComponent } from './main/event-seminor/event-seminor.component';
import { AddEventSeminorComponent } from './main/event-seminor/add-event-seminor/add-event-seminor.component';
import { AddClientBranchComponent } from './main/clients/add-client-branch/add-client-branch.component';
import { PostArticleComponent } from './main/post-article/post-article/post-article.component';
import { PostArticleAddComponent } from './main/post-article/post-article-add/post-article-add.component';

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
        path: 'product',
        loadComponent: () => import('./main/Product/Product.component'),
        canActivate: [authGuard]
      },

      {
        path: 'services&technologies',
        loadComponent: () => import('./main/Category/category.component'),
        canActivate: [authGuard]
      },
      {
        path: 'services&technologies/add-services&technologies', component: AddCategoryComponent,
        canActivate: [authGuard]
      },
      {
        path: 'services&technologies/add-services&technologies/add-product',
        component: AddProductComponent,
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
      },
      {
        path: 'orders',
        component: OrdersComponent,
        canActivate: [authGuard]
      },
      {
        path: 'clients',
        component: ClientsComponent,
        canActivate: [authGuard]
      },
      {
        path: 'clients/add-clients',
        component: AddClientsComponent,
        canActivate:[authGuard]
      }, {
        path: 'events/add-events',
        component: AddEventSeminorComponent,
        canActivate: [authGuard]
      },
      {
        path: 'events',
        component: EventSeminorComponent,
        canActivate: [authGuard]
      },
      {
        path: 'add-clientsDivision',
        component: AddClientBranchComponent,
        canActivate: [authGuard]
      },
      {
        path: 'postarticle',
        component: PostArticleComponent,
        canActivate: [authGuard]
      },
      {
        path: 'postarticle/add-article',
        component: PostArticleAddComponent,
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
  },
  {
    path: 'add-product', loadChildren: () => import('./main/add-product/add-product.module').then(m => m.AddProductModule),
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
