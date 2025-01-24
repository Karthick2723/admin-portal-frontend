import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ClientDivisionPopupService } from 'src/app/services/client-division-popup.service';
import { ClientService } from 'src/app/services/client.service';
import { CommonService } from 'src/app/services/common.service';
import { TooltipContent } from 'src/assets/constants/tool-tip-contants';

@Component({
  selector: 'app-client-branch-list',
  templateUrl: './client-branch-list.component.html',
  styleUrls: ['./client-branch-list.component.scss']
})
export class ClientBranchListComponent implements OnInit, OnDestroy {
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() clientId: any;
  @Input() clientDivisionData: any;
  selectedFilter: string = 'All';
  publishCount;
  UnpublishCount;
  displayedColumns: string[] = ['sNo', 'branchName', 'contactPerson', 'emailId', 'status', 'action'];
  isCollapsed: boolean = false;
  tooltipContent = TooltipContent;

  private subscriptions: Subscription[] = [];
  constructor(
    private route: Router,
    private notify: ToastrService,
    private _clientService: ClientService,
    private _commonService: CommonService,
    private dialogService: ClientDivisionPopupService
  ) { }

  ngOnInit(): void {
    this.initializeMethod();
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  openModal(title: string, action: string, clientId: number, clientDivisionId: number) {
    this.dialogService.openModal(title, action, clientId, clientDivisionId, () => {
    }, () => {

    });
  }
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
  initializeMethod() {
    this.getAllClientDivision();

    this._commonService.setClientDivisionState({
      isFormUpdate: false,
      clientId: 0
    });

    const getClientDiv = this._commonService.getClientDivisionState()
      .subscribe((response) => {

        if (response?.isFormUpdate && response?.clientId > 0) {
          this.getClientDivBasedonClientId(response?.clientId);
        }
      })
    this.subscriptions.push(getClientDiv);
  }

  getAllClientDivision() {
    this.setDataToMatTable(this.clientDivisionData);
  }

  getClientDivBasedonClientId(clientId: number) {
    const clientDivBasedOnClientId = this._clientService.getClientBasedClientDiv(clientId)
      .subscribe((response) => {
        this.setDataToMatTable(response);
      });
    this.subscriptions.push(clientDivBasedOnClientId);
  }

  setDataToMatTable(data: any) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.calculateCounts();
  }
  navigateAddClientDivisionPage() {
    this.route.navigate(['/add-clientsDivision']);
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
