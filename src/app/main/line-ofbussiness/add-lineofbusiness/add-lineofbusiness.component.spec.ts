import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLineofbusinessComponent } from './add-lineofbusiness.component';

describe('AddLineofbusinessComponent', () => {
  let component: AddLineofbusinessComponent;
  let fixture: ComponentFixture<AddLineofbusinessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddLineofbusinessComponent]
    });
    fixture = TestBed.createComponent(AddLineofbusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
