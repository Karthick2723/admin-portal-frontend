import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SharedModule } from 'src/app/nav/shared/shared.module';
import { CategoryService } from 'src/app/services/category.service';
import { TooltipContent } from 'src/assets/constants/tool-tip-contants';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, MatTooltipModule, MatPaginatorModule, MatTableModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export default class categoryComponent implements OnInit, OnDestroy {
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['id', 'CategoryImage', 'name', 'Published', 'action'];
  datas: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  getCategoryById: any;
  tooltipContent = TooltipContent;
  selectedFilter: string = 'All';
  publishCount: number = 0;
  UnpublishCount: number = 0;
  private subscriptions: Subscription[] = [];

  constructor(private route: Router, private categroy: CategoryService) { }

  ngOnInit(): void {
    this.getAllData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  editItem(item: any) {
    this.route.navigate(['services&technologies/add-services&technologies/'], {
      queryParams: {
        id: item,
        action: 'edits'
      }
    });
  }
  view(item: any) {
    this.route.navigate(['services&technologies/add-services&technologies/'], {
      queryParams: {
        id: item,
        action: 'views'
      }
    });


  }
  navigateToAddPage() {
    this.route.navigate(['services&technologies/add-services&technologies']);
  }
  getAllData() {
    const getAll = this.categroy.getallcategory().subscribe((res: any) => {
      this.datas = res;
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
      this.calculateCounts();
    });
    this.subscriptions.push(getAll);
  };


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
