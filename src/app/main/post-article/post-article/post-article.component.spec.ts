import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostArticleComponent } from './post-article.component';

describe('PostArticleComponent', () => {
  let component: PostArticleComponent;
  let fixture: ComponentFixture<PostArticleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PostArticleComponent]
    });
    fixture = TestBed.createComponent(PostArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
