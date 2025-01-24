import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GuestComponent } from './main/guest/guest.component';
import { AdminComponent } from './nav/admin/admin.component';
import { NavBarComponent } from './nav/admin/nav-bar/nav-bar.component';
import { NavLeftComponent } from './nav/admin/nav-bar/nav-left/nav-left.component';
import { NavRightComponent } from './nav/admin/nav-bar/nav-right/nav-right.component';
import { NavigationComponent } from './nav/admin/navigation/navigation.component';
import { NavLogoComponent } from './nav/admin/nav-bar/nav-logo/nav-logo.component';
import { NavContentComponent } from './nav/admin/navigation/nav-content/nav-content.component';
import { NavGroupComponent } from './nav/admin/navigation/nav-content/nav-group/nav-group.component';
import { NavItemComponent } from './nav/admin/navigation/nav-content/nav-item/nav-item.component';
import { NavCollapseComponent } from './nav/admin/navigation/nav-content/nav-collapse/nav-collapse.component';
import { ConfigurationComponent } from './nav/admin/configuration/configuration.component';
import { NavigationItem } from './nav/admin/navigation/navigation';
import { SharedModule } from './nav/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from "@angular/fire/compat";
import { ProductModule } from './main/Product/Product.module';
import { AccountHttpInterceptor, HttpService } from './services/http-services';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { ToastrModule } from 'ngx-toastr';
import { LineOfbussinessComponent } from './main/line-ofbussiness/line-ofbussiness.component';
import { AddLineofbusinessComponent } from './main/line-ofbussiness/add-lineofbusiness/add-lineofbusiness.component';
import { API_GATEWAY, environment } from 'src/environments/environment';
import { OrdersComponent } from './main/orders/orders.component';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { OrdersDilogComponent } from './main/orders/orders-dilog/orders-dilog.component';
import { MatDialogModule } from '@angular/material/dialog'; 
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ClientsComponent } from './main/clients/clients.component';
import { AddClientsComponent } from './main/clients/add-clients/add-clients.component';
import { EventSeminorComponent } from './main/event-seminor/event-seminor.component';
import { AddEventSeminorComponent } from './main/event-seminor/add-event-seminor/add-event-seminor.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { EventRegistrationlistDialogComponent } from './main/event-seminor/event-registrationlist-dialog/event-registrationlist-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ClientBranchListComponent } from './main/clients/client-branch-list/client-branch-list.component';
import { AddClientBranchComponent } from './main/clients/add-client-branch/add-client-branch.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CustomEditorImgresizeComponent } from './main/custom-editor-imgresize/custom-editor-imgresize.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { CustomizeTimepickerComponent } from './main/customize-timepicker/customize-timepicker.component';
import { PostArticleComponent } from './main/post-article/post-article/post-article.component';
import { PostArticleAddComponent } from './main/post-article/post-article-add/post-article-add.component';
import { CustomEditorComponent } from './main/custom-editor/custom-editor.component';
import { CustomEditorModule } from './main/custom-editor/custom-editor.module';
import { AuthInterceptorService } from './services/interceptors/auth-interceptor.service';


@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    NavBarComponent,
    NavLeftComponent,
    NavRightComponent,
    NavigationComponent,
    NavLogoComponent,
    NavContentComponent,
    NavGroupComponent,
    NavItemComponent,
    NavCollapseComponent,
    ConfigurationComponent,
    GuestComponent,
    OrdersComponent,
    OrdersDilogComponent,
    ClientsComponent,
    AddClientsComponent,
    EventSeminorComponent,
    AddEventSeminorComponent,
    EventRegistrationlistDialogComponent,
    ClientBranchListComponent,
    AddClientBranchComponent,
    CustomEditorImgresizeComponent,
    CustomizeTimepickerComponent,
    PostArticleComponent,
    PostArticleAddComponent
  ],
  imports: [CustomEditorModule, BrowserModule, AppRoutingModule, SharedModule,
    BrowserAnimationsModule, FormsModule,
    HttpClientModule, RouterModule,
    MatPaginatorModule,
    MatTableModule,
    ProductModule, ToastrModule.forRoot(),
    AngularFireModule.initializeApp(API_GATEWAY.firebase),
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatOptionModule,
    MatDialogModule,
    MatProgressBarModule,
    NgSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    ImageCropperModule,
    FontAwesomeModule,
    AngularEditorModule
  ],
  providers: [NavigationItem, HttpService, ProductService, CategoryService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
