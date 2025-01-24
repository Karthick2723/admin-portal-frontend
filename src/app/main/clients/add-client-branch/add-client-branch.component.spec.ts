import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientBranchComponent } from './add-client-branch.component';

describe('AddClientBranchComponent', () => {
  let component: AddClientBranchComponent;
  let fixture: ComponentFixture<AddClientBranchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddClientBranchComponent]
    });
    fixture = TestBed.createComponent(AddClientBranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
