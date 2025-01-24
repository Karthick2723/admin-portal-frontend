import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientBranchListComponent } from './client-branch-list.component';

describe('ClientBranchListComponent', () => {
  let component: ClientBranchListComponent;
  let fixture: ComponentFixture<ClientBranchListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientBranchListComponent]
    });
    fixture = TestBed.createComponent(ClientBranchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
