import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { AddProductModule } from '../add-product/add-product.module';
import { ProductService } from 'src/app/services/product.service';
import { HttpService } from 'src/app/services/http-services';
import { CategoryService } from 'src/app/services/category.service';
import { TooltipContent } from 'src/assets/constants/tool-tip-contants';
import { Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';


export interface UserData {
  id: string;
  name: string;
  age: number;
}
@Component({
  selector: 'app-Product',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTooltipModule, MatPaginatorModule, MatTableModule, AddProductModule],
  templateUrl: './Product.component.html',
  styleUrls: ['./Product.component.scss']

})
export default class ProductComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('exampleModal') modal: ElementRef;
  @Input() ServiceOrTechnologyId: number;
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['id', 'productImage', 'Product Name', 'productCode',/*  'category', */ 'is_published', 'action'];
  editedValue: any;
  data: any[] = [];
  victorImage: boolean = true;
  productsValue: any;
  categoryName: any;
  vendors: any;
  products: any;
  tooltipContent = TooltipContent;
  isCollapsed: boolean = false;
  selectedFilter: string = 'All';
  publishCount: number;
  UnpublishCount: number;
  private subscriptions: Subscription[] = [];

  constructor(private route: Router, private prodservice: ProductService, private categroyservice: CategoryService, private http: HttpService) { }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.getFullCategoryAndProductById();

  }
  navigateAddPage() {
    this.route.navigate(['services&technologies/add-services&technologies/add-product/'], {
      queryParams: {
        id: '0',
        action: 'add',
        ServiceOrTechnologyId: this.ServiceOrTechnologyId
      }
    });
  }
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
  getAllData() {
    const getAll = this.prodservice.getallproduct().subscribe(
      (response: any) => {
        this.data = response;
        this.dataSource = new MatTableDataSource(response);
        this.dataSource.paginator = this.paginator;
      }

    );
    this.subscriptions.push(getAll);

  }
  editItem(item: any) {
    this.editedValue = item;
    this.editedValue = 'edit';
    this.route.navigate(['services&technologies/add-services&technologies/add-product/'], {
      queryParams: {
        id: item,
        action: 'edit',
        ServiceOrTechnologyId: this.ServiceOrTechnologyId
      }
    });
  }

  view(item: any) {
    this.route.navigate(['services&technologies/add-services&technologies/add-product/'], {
      queryParams: {
        id: item,
        action: 'view',
        ServiceOrTechnologyId: this.ServiceOrTechnologyId
      }
    });
  }


  getFullCategoryAndProductById() {
    const fullCategory = this.categroyservice.fullCategorySubject.subscribe(res => {
      this.categoryName = res?.categoryName
      this.data = res?.products;
      this.vendors = res?.vendors;
      let fillterProduct = [];
      this.data?.forEach(prductItem => {
        this.vendors.forEach(vendorItem => {
          if (vendorItem.vendorId == prductItem.vendorId) {
            fillterProduct.push(prductItem)
          }
        })
      })
      this.products = fillterProduct;
      this.dataSource = new MatTableDataSource(this.products);
      this.dataSource.paginator = this.paginator;
      this.calculateCounts();
    }
    );

    this.subscriptions.push(fullCategory);
  };

  ExcelOpertions(event: Event) {
    this.victorImage = !this.victorImage;
  }

  calculateCounts() {
    this.publishCount = this.dataSource.data.filter((item: any) => item.isPublished).length;
    this.UnpublishCount = this.dataSource.data.filter((item: any) => !item.isPublished).length;
  }

  filterByStatus(status: string) {
    this.resetFilter(); 

    if (status === 'isPublished') {
      console.log('isPublished');
      this.dataSource.filterPredicate = (data: any) => data.isPublished === true;
    } else if (status === 'UnPublished') {
      console.log('UnPublished');
      this.dataSource.filterPredicate = (data: any) => data.isPublished === false;
    } else if (status === 'All') {
      console.log('all');
      this.dataSource.filterPredicate = (data: any) => true;
    }

    this.dataSource.filter = status.trim().toLowerCase();

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
