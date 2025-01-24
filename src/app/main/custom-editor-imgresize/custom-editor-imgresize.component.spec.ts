import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomEditorImgresizeComponent } from './custom-editor-imgresize.component';

describe('CustomEditorImgresizeComponent', () => {
  let component: CustomEditorImgresizeComponent;
  let fixture: ComponentFixture<CustomEditorImgresizeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomEditorImgresizeComponent]
    });
    fixture = TestBed.createComponent(CustomEditorImgresizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
