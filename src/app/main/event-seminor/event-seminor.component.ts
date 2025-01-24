import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { EventRegistrationServiceService } from 'src/app/services/event-registration-service.service';
import { EventSeminorService } from 'src/app/services/event-seminor.service';
import { TooltipContent } from 'src/assets/constants/tool-tip-contants';

@Component({
  selector: 'app-event-seminor',
  templateUrl: './event-seminor.component.html',
  styleUrls: ['./event-seminor.component.scss']
})
export class EventSeminorComponent implements OnInit, OnDestroy {

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns: string[] = ['S.NO', 'Image', 'Events&Seminar', 'Type', 'Registrations', 'Date', 'IsPublish', 'Actions'];
  date: any = new Date();
  tooltipContent = TooltipContent;
  selectedFilter: string = 'All';
  publishCount: number;
  UnpublishCount: number;

  private subscriptions: Subscription[] = [];

  constructor(
    private _eventSeminorService: EventSeminorService,
    private route: Router,
    private notify: ToastrService,
    private dialogService: EventRegistrationServiceService
  ) { }

  ngOnInit() {
    this.initializeMethod();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  navigateToAddEvent() {
    this.route.navigate(['/events/add-events']);
  }

  initializeMethod() {
    this.listAllEvents();
  }
  participantFullName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`;
  }
  listAllEvents() {
    const eventSubscription = this._eventSeminorService.getAllEvents().subscribe((result) => {
      this.setDataToMatTable(result);
    });
    this.subscriptions.push(eventSubscription);
  }

  setDataToMatTable(data: any) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.calculateCounts();
  }
  findMinDate(dates: any[]): string {
    if (dates && dates.length > 0) {
      let momentDates = dates.map(event => moment(event.eventDate));
      let minDate = moment.min(momentDates);
      return minDate.format('DD-MM-YYYY');
    }
    return '';
  }
  findMaxDate(dates: any[]) {
    if (dates && dates.length > 0) {
      let momentDates = dates.map(event => moment(event.eventDate));
      let minDate = moment.max(momentDates);
      return minDate.format('DD-MM-YYYY');
    }
    return '';
  }
  displayDateRange(events: any[]): string {
    let minDate = this.findMinDate(events);
    let maxDate = this.findMaxDate(events);

    if (minDate && maxDate && minDate === maxDate) {
      return minDate; 
    } else {
      return `${minDate} to ${maxDate}`; 
    }
  }
  editEvent(id: any) {
    this.route.navigate(['events/add-events/'], {
      queryParams: {
        id: id,
        action: 'edit'
      }
    });
  }
  viewEvent(id: any) {
    this.route.navigate(['events/add-events/'], {
      queryParams: {
        id: id,
        action: 'view'
      }
    });
  }

  deleteEvent(id: any) {
    const deleteSubscription = this._eventSeminorService.deleteEvent(parseInt(id))
      .subscribe((response: HttpResponse<any>) => {
        if (response.status === 200) {
          this.notify.success("Delete an Event Successfully!");
          this.listAllEvents();
        } else {
          this.notify.error("Failed to delete the event.");
        }
      });
    this.subscriptions.push(deleteSubscription);
  }

  openModal(participantsList: any) {

    this.dialogService.openModal("Even", "Show Table", participantsList, () => {
    }, () => {
    });
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
