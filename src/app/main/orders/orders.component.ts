import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CommonserviceService } from 'src/app/services/commonservice.service';
import { UserManageentService } from 'src/app/services/user-manageent.service';
import { OrderService } from "src/app/services/order.service";
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { HttpEventType } from '@angular/common/http';
import { MatDialog, } from '@angular/material/dialog';
import { OrdersDilogComponent } from './orders-dilog/orders-dilog.component';
export interface PeriodicElement {
  userId: number,
  emailId: string
  imageURL: null,
  status: true,
  clientId: 1,
  clientName: string,
  firstName: string,
  lastName: string

}
export interface ExcelData {
  Vendor: string,
  orderId: number,
  Product: string,
  HSMSACCode: string,
  Client: string,
  LicenseTypeRate: string,
  Rate: string,
  Quantity: number,
  PeriodStartDate: string,
  PeriodEndDate: string,
  InvoiceNo: string,
  ServiceNo: string,
  PurchaseOrderNo: string,
  PurchaseOrderDate: string,
  PaymentTerms: string,
  PaymentStatus: string,
  RegionTerritory: string,
  BillToAddress: string,
  SupplyToAddress: string
}


@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['select', 'Action', 'id', 'Vendor', 'Product', 'HSMSACCode', 'Client', 'DivisionName', 'LicenseType', 'Rate', 'Quantity', 'PeriodStartDate', 'PeriodEndDate', 'InvoiceNo', 'ServiceNo', 'PurchaseOrderNo',
    'PurchaseOrderDate', 'PaymentTerms', 'PaymentStatus', 'RegionTerritory', 'BillToAddress', 'SupplyToAddress'];
  datas: any;
  isDropdownOpen: boolean = false;
  @Output() clickOutside = new EventEmitter<void>();
  @ViewChild('dropdown') dropdown: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  toppings = new FormControl('');
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  selection = new SelectionModel<ExcelData>(true, []);
  clientFilter = [];
  VendorFilter = [];
  selectedClient: string;
  selectedVendor: string;
  selectedPublished: string;
  victorImage: boolean = true;
  value: boolean = true;
  published: boolean;
  isDisabled: boolean = false;
  sampleUrl: string;
  DeleteId: number;
  selectedOrderIdList: any[] = [];
  progressValue: number = 0;
  vendorList: any[] = [];
  ClientList: any[] = [];
  publishList = [];
  editFormGroup: FormGroup;
  getCategoryById: any;
  oldUserObject: any;
  nonPublishedCount: any;
  emptyData = new MatTableDataSource([{ empty: "row" }]);
  progresbarShow: boolean = false;


  apiPatchValue =
    {
      "successList": [],
      "failureList": [
        {
          "message": "Invalid order.",
          "orderId": null
        }
      ],
      "failureCount": 1,
      "successCount": 0
    };
  constructor(private commonserviceService: CommonserviceService,
    private route: Router, private userManageService: UserManageentService,
    private OrderService: OrderService, private toastr: ToastrService,
    private fb: FormBuilder, public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getAllData();
    this.getCount();
    this.sampleExcelURl();
    this.getAllClient();
    this.getVendorList();

  }

  openDialog(): void {
    this.dialog.open(OrdersDilogComponent, {
      width: '450px',
      height: '360px'

    });
  }
  editItem(element: any) {

    this.oldUserObject = JSON.stringify(element)
    element.isEdit = true;
  }

  deleteItem(element: any) {
    this.DeleteId = element.orderId;

  };
  deleteOrder() {
    this.OrderService.deleteOrder(this.DeleteId).subscribe((res: any) => {
      if (res.statusCode == 200) {
        this.toastr.success(res.message);
      }
      this.getAllData();
    })
  }

  view(item: any) {
  };
  update(element: any) {
    element.isEdit = false;
    this.OrderService.editOrders(element, element.orderId).subscribe((res) => {
      this.toastr.success(res.message)
    });

  };

  ExcelOpertions() {
    this.victorImage = !this.victorImage;
  }

  cancelEdit(element: any) {
    const oldObj = JSON.parse(this.oldUserObject);
    element.productName = oldObj.productName;
    element.vendorName = oldObj.vendorName;
    element.Product = oldObj.Product;
    element.sachsncode = oldObj.sachsncode;
    element.clientName = oldObj.clientName;
    element.divisionName = oldObj.divisionName;
    element.licenseTypeName = oldObj.licenseTypeName;
    element.unitCost = oldObj.unitCost;
    element.quantity = oldObj.quantity;
    element.effectiveDate = oldObj.effectiveDate;
    element.expiryDate = oldObj.expiryDate;
    element.invoiceNo = oldObj.invoiceNo;
    element.serviceNumber = oldObj.serviceNumber;
    element.purchaseOrderId = oldObj.purchaseOrderId;
    element.purchaseOrderDate = oldObj.purchaseOrderDate;
    element.paymentTerms = oldObj.paymentTerms;
    element.paymentStatus = oldObj.paymentStatus;
    element.territory = oldObj.territory;
    element.billingAddress = oldObj.billingAddress;
    element.shippingAddress = oldObj.shippingAddress;
    element.isEdit = false;
  }


  getAllData() {

    this.OrderService.getallOrderList().subscribe((res: any) => {

      this.datas = res.orderDetails;
      res.orderDetails.forEach((res) => { })
      this.dataSource = new MatTableDataSource(res.orderDetails);
      this.dataSource.paginator = this.paginator;
      this.OrderService.orderlistSubject.next(res);

      res.orderDetails.forEach(res => {
        if (res.published == true) {
          this.isDisabled = true;
        }
      })
    });
  };

  getCount() {
    this.OrderService.orderlistSubject.subscribe((res) => {
      this.nonPublishedCount = res.nonPublishedCount;
    });

  }
  getAllClient() {
    this.OrderService.getAllClients().subscribe((res) => {
      this.ClientList = res;
    })
  };
  getVendorList() {
    this.OrderService.getAllVendors().subscribe((res) => {
      res.forEach((res) => {
        this.vendorList.push(res.vendorName);
      })
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;

  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));

  }

  checkboxChange(event: any, row: any) {
    event ? this.selection.toggle(row) : null;
    const selectedOrderIds = this.selection.selected.map((row) => row.orderId);
    this.selectedOrderIdList = selectedOrderIds;
  }
  sampleExcelURl() {
    this.OrderService.getSampleDataUrl().subscribe((res) => {
    })
  }

  updatePublish() {
    this.OrderService.publishUpdate(this.selectedOrderIdList, this.value).subscribe((res) => {
      if (res.statusCode = 200) {
        this.getAllData();
        this.toastr.success("Order Published Successfully");
      }
    });

  }

  onAlbumselected(filteredValue) {
    const filtersArr = [];
    this.datas.forEach((e, i) => {
      if (e.clientName == filteredValue) {
        filtersArr.push(e);
      }
    });
    this.dataSource = new MatTableDataSource(filtersArr);
    this.dataSource.paginator = this.paginator;
  };

  publishselected(filteredValue) {
    const filterArr = [];
    this.datas.forEach((e, i) => {
      if (e.published == filteredValue) {
        filterArr.push(e)
      }
    });
    this.dataSource = new MatTableDataSource(filterArr);
    this.dataSource.paginator = this.paginator;
  }


  vendorselected(filteredValue) {
    const filterArr = [];
    this.datas.forEach((e, i) => {
      if (e.vendorName == filteredValue) {
        filterArr.push(e)
      };
      this.dataSource = new MatTableDataSource(filterArr);
      this.dataSource.paginator = this.paginator;
    })
  };

  UpateAllValues() {
  };
  closeDropdown() {
    this.isDropdownOpen = false;
    this.victorImage = true;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  };
  @HostListener('document:click', ['$event'])
  onClickOutside(event) {
    if (!this.dropdown.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }


  exportToExcel(): void {
    const headings = Object.keys(this.datas[0]);
    const dataArray = [
      headings,
      ...this.datas.map(obj => Object.values(obj))
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dataArray);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    this.saveFile(wbout, 'ExportOrderData.xlsx');
  }

  private saveFile(data: string, filename: string): void {
    const blob = new Blob([this.s2ab(data)], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  private s2ab(s: string): ArrayBuffer {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  onFileSelected(event: any) {
    this.progresbarShow = true;
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const uploadData = new FormData();
      uploadData.append('file', selectedFile, selectedFile.name);
      this.OrderService.importExcell(uploadData).subscribe((res) => {
        this.OrderService.orderResponseSubject.next(res);
        if (res) {
          this.openDialog();
          this.progresbarShow = false;
          this.getAllData();
        }
      },
        (error) => {
          this.progresbarShow = false;
          this.toastr.error('Excel import error');
        }
      )
    }
  }

  click() {
    this.openDialog();
  }
  getSerialNumber(index: number): number {
    return index + 1 + this.paginator.pageIndex * this.paginator.pageSize;
  }

  importExcell() {
  }

}
