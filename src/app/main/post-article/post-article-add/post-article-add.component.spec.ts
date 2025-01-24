import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostArticleAddComponent } from './post-article-add.component';

describe('PostArticleAddComponent', () => {
  let component: PostArticleAddComponent;
  let fixture: ComponentFixture<PostArticleAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PostArticleAddComponent]
    });
    fixture = TestBed.createComponent(PostArticleAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
