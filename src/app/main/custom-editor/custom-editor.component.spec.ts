import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomEditorComponent } from './custom-editor.component';

describe('CustomEditorComponent', () => {
  let component: CustomEditorComponent;
  let fixture: ComponentFixture<CustomEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomEditorComponent]
    });
    fixture = TestBed.createComponent(CustomEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
