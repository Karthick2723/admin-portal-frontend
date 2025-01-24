import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersDilogComponent } from './orders-dilog.component';

describe('OrdersDilogComponent', () => {
  let component: OrdersDilogComponent;
  let fixture: ComponentFixture<OrdersDilogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrdersDilogComponent]
    });
    fixture = TestBed.createComponent(OrdersDilogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
