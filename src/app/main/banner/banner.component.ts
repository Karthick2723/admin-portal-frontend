import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BannerService } from 'src/app/services/banner.service';
import { TooltipContent } from 'src/assets/constants/tool-tip-contants';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export default class BannerComponent implements OnInit, OnDestroy {

  dataSource: MatTableDataSource<any>;
  datas: any;
  displayedColumns: string[] = ['id', 'BannerImage', 'BannerContent', 'RegisteredDate', 'status', 'action'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  getBannerById: any;
  tooltipContent = TooltipContent;
  private subscriptions: Subscription[] = [];
  selectedFilter: string = 'All';
  publishCount: number;
  UnpublishCount: number;

  constructor(private route: Router, private banner: BannerService) { }

  ngOnInit(): void {
    this.getAllBannerList();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getAllBannerList() {
    const getAll = this.banner.getAllBanner().subscribe((res: any) => {
      this.datas = res;
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
      this.calculateCounts();
    });
    this.subscriptions.push(getAll);
  };

  navigateToAddPage() {
    this.route.navigate(['/banner/add-banner']);
  }

  editBanner(id: any) {
    this.route.navigate(['/banner/add-banner'], {
      queryParams: {
        id: id,
        action: 'edit'
      }
    });
  }

  viewBanner(id: any) {
    this.route.navigate(['/banner/add-banner'], {
      queryParams: {
        id: id,
        action: 'view'
      }
    });
  }

  calculateCounts() {
    this.publishCount = this.dataSource.data.filter((item: any) => item.status === 'true').length;
    this.UnpublishCount = this.dataSource.data.filter((item: any) => item.status === 'false').length;
  }

  filterByStatus(status: string) {
    this.resetFilter(); 
    if (status === 'isPublished') {
      console.log('isPublished');
      this.dataSource.filterPredicate = (data: any) => data.status === 'true';
    } else if (status === 'UnPublished') {
      console.log('UnPublished');
      this.dataSource.filterPredicate = (data: any) => data.status === 'false';
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

