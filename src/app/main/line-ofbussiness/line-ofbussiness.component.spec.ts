import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineOfbussinessComponent } from './line-ofbussiness.component';

describe('LineOfbussinessComponent', () => {
  let component: LineOfbussinessComponent;
  let fixture: ComponentFixture<LineOfbussinessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LineOfbussinessComponent]
    });
    fixture = TestBed.createComponent(LineOfbussinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
