import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PostArticleService } from 'src/app/services/post-article.service';
import { TooltipContent } from 'src/assets/constants/tool-tip-contants';

@Component({
  selector: 'app-post-article',
  templateUrl: './post-article.component.html',
  styleUrls: ['./post-article.component.scss']
})
export class PostArticleComponent {
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['id', 'articleImage', 'organizationName', 'title', 'date', 'isPublished', 'action'];
  datas: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  getArticleById: any;
  tooltipContent = TooltipContent;
  selectedFilter: string = 'All';
  publishCount: number = 0;
  UnpublishCount: number = 0;
  private subscriptions: Subscription[] = [];
  constructor(private route: Router, private postarticle: PostArticleService) { }

  ngOnInit(): void {
    this.getAllData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  editItem(item: any) {
    this.route.navigate(['postarticle/add-article/'], {
      queryParams: {
        id: item,
        action: 'edit'
      }
    });
  }
  view(item: any) {
    this.route.navigate(['postarticle/add-article/'], {
      queryParams: {
        id: item,
        action: 'view'
      }
    });
  }
  navigateToAddPage() {
    this.route.navigate(['postarticle/add-article']);
  }
  getAllData() {
    const getAll = this.postarticle.getAllArticle().subscribe((res: any) => {
      this.datas = res;
      this.dataSource = new MatTableDataSource(res);
      console.log(this.dataSource, "art");
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
