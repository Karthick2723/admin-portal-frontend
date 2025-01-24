import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClientService } from 'src/app/services/client.service';
import { TooltipContent } from 'src/assets/constants/tool-tip-contants';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit, OnDestroy {
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  tooltipContent = TooltipContent;
  selectedFilter: string = 'All';
  publishCount: number;
  UnpublishCount: number;
  displayedColumns: string[] = ['sNo', 'clientName', 'contactPerson', 'emailId', 'status', 'action'];
  private subscriptions: Subscription[] = [];
  constructor(
    private route: Router,
    private _clientService: ClientService
  ) { }

  ngOnInit() {
    this.initializeMethod();
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  navigateToAddEvent() {
    this.route.navigate(['/clients/add-clients']);
  }
  initializeMethod() {
    this.listAllEvents();
  }

  listAllEvents() {
    const getAllClients = this._clientService.getAllClient()
      .subscribe((result) => {
        this.setDataToMatTable(result);
      });
    this.subscriptions.push(getAllClients);

  }

  setDataToMatTable(data: any) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.calculateCounts();
  }

  editAction(id: any) {
    this.route.navigate(['clients/add-clients/'], {
      queryParams: {
        id: id,
        action: 'edit'
      }
    });
  }
  viewAction(id: any) {
    this.route.navigate(['clients/add-clients/'], {
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
