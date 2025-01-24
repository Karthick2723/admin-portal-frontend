import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/nav/shared/shared.module';
import { UserManageentService } from 'src/app/services/user-manageent.service';
import { TooltipContent } from 'src/assets/constants/tool-tip-contants';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule,MatTooltipModule, SharedModule,RouterModule,MatPaginatorModule,MatTableModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent {

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['id', 'Image','First Name','Last Name','Email Id','Organization', 'verified', 'Action'];
  datas:any;
  firstNames:any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  getCategoryById: any;
  tooltipContent = TooltipContent;
  selectedFilter: string = 'All';
  publishCount: number ;
  UnpublishCount: number;
  constructor( private route: Router, private userManageService:UserManageentService) { }

  ngOnInit(): void {
    this.getAllData();
  }

  navigateToAddPage() {
    this.route.navigate(['UserManagement/add-Usermanagement']);
  }
  editItem(item: any) {
    this.route.navigate(['UserManagement/add-Usermanagement/'],{
      queryParams:{
        id:item,
        action:'edit'
      }
    }); 
  }
 view(item:any){
  this.route.navigate(['UserManagement/add-Usermanagement/'],{
    queryParams:{
      id:item,
      action:'view'
    }
  });  

 }

 getAllData(){
  this.userManageService.getallUserDetails().subscribe((res: any)=>{
    this.datas =res;    
    this.dataSource = new MatTableDataSource(res);
    this.dataSource.paginator = this.paginator;
    this.calculateCounts();
  })
 };

 getFirstLetter(fname:string){
  return fname!=null? fname.charAt(0).toUpperCase():'';
 }
   

 calculateCounts() {
  this.publishCount = this.dataSource.data.filter((item: any) => item.status === 'Active').length;
  this.UnpublishCount = this.dataSource.data.filter((item: any) => item.status === 'InActive').length;
}

filterByStatus(status: string) {
  this.resetFilter(); 

  if (status === 'isPublished') {
    console.log('isPublished'); 
    this.dataSource.filterPredicate = (data: any) => data.status === 'Active';
  } else if (status === 'UnPublished') {
    console.log('UnPublished');
    this.dataSource.filterPredicate = (data: any) => data.status === 'InActive';
  } else if (status === 'All') {
    console.log('all');   
    this.dataSource.filterPredicate = (data: any) => true;
  }
  this.dataSource.filter = status.trim().toLowerCase();
  const filteredCount = this.dataSource.filteredData.length;
  if (status === 'isPublished') {
    this.publishCount = filteredCount; 
    this.UnpublishCount = 0; 
  } else if (status === 'UnPublished') {
    this.UnpublishCount = filteredCount; 
    this.publishCount = 0;
  } else if (status === 'All') {
    this.UnpublishCount = this.dataSource.data.filter((item: any) => item.status === 'InActive').length;
    this.publishCount = this.dataSource.data.filter((item: any) => item.status === 'Active').length;
  }
  if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
  }
  this.calculateCounts();
}

setSelectedFilter(filter: string) {
  this.selectedFilter = filter;
}
resetFilter() {
  this.dataSource.filter = '';
  if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
  }
}

getSerialNumber(index: number): number {
  return index + 1 + this.paginator.pageIndex * this.paginator.pageSize;
}
}
