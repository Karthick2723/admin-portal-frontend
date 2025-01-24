import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-orders-dilog',
  templateUrl: './orders-dilog.component.html',
  styleUrls: ['./orders-dilog.component.scss'],

})
export class OrdersDilogComponent {

  isDropdownOpen: boolean = false;
  closeOpenArrow: boolean = false;
  rejectedisDropdownOpen: boolean = false;
  rejectcloseOpenArrow: boolean = false;
  failureCount: any;
  successCount: any;
  totalCount: any;
  rejectList: any;
  rejectCount: any;
  failureList: any;
  constructor(public dialogRef: MatDialogRef<OrdersDilogComponent>,
    private toastr: ToastrService, private orderService: OrderService) {

  }


  ngOnInit() {
    this.Orderresponse();
  }

  Orderresponse() {
    this.orderService.orderResponseSubject.subscribe((res) => {
      this.failureCount = res.failureCount;
      this.successCount = res.successCount;
      this.rejectCount = res.rejectCount;
      this.totalCount = res.totalCount;
      this.rejectList = res.rejectList;
      this.failureList = res.failureList;
    })
  }

  failuredropDown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.closeOpenArrow = !this.closeOpenArrow;
  }

  rejecteddropDown() {
    this.rejectcloseOpenArrow = !this.rejectcloseOpenArrow;
  };

  successMessage() {
    if(this.successCount<=0){
      this.toastr.error("Excel import failed");
      return ;
    }
    this.toastr.success('successfully Imported')
  }
}
