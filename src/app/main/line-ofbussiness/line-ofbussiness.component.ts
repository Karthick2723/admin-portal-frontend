import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/nav/shared/shared.module';
import { CategoryService } from 'src/app/services/category.service';
import { CommonserviceService } from 'src/app/services/commonservice.service';
import { LineOfbussinessService } from 'src/app/services/line-ofbussiness.service';
import { AddLineofbusinessComponent } from './add-lineofbusiness/add-lineofbusiness.component';

@Component({
  selector: 'app-line-ofbussiness',
  standalone: true,
  imports: [CommonModule, AddLineofbusinessComponent, SharedModule, RouterModule, MatPaginatorModule, MatTableModule],
  templateUrl: './line-ofbussiness.component.html',
  styleUrls: ['./line-ofbussiness.component.scss']
})
export class LineOfbussinessComponent {
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['id', 'LobImage', 'name', 'Published', 'action'];
  datas: any;
  victorImage: boolean = true;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  getCategoryById: any;
  categoryName: any;
  constructor(private commonserviceService: CommonserviceService, private categroyservice: CategoryService, private route: Router, private lobService: LineOfbussinessService) { }

  ngOnInit(): void {
    this.getFullCategoryAndProductById();
  }

  editItem(item: any) {
    this.route.navigate(['add-Bussiness/'], {
      queryParams: {
        id: item,
        action: 'edit'
      }
    });

  }
  view(item: any) {
    this.route.navigate(['add-Bussiness/'], {
      queryParams: {
        id: item,
        action: 'view'
      }
    });

  }

  getAllData() {
    this.lobService.getallLob().subscribe((res: any) => {
      this.datas = res;
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
    })
  };



  getFullCategoryAndProductById() {
    this.categroyservice.fullCategorySubject.subscribe(res => {
      this.categoryName = res.categoryName;
      let lineOfBusinessData = [];
      let data = res.vendors.forEach(vendors => {
        vendors.lineOfBusiness.forEach(lob => {
          lineOfBusinessData.push(lob)
        })
        this.dataSource = new MatTableDataSource(lineOfBusinessData);
        this.dataSource.paginator = this.paginator;
      })
    }
    )
  };

  ExcelOpertions(event: Event) {
    this.victorImage = !this.victorImage;
  }

}
