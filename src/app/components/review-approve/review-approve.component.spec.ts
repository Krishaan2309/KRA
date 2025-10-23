import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewApproveComponent } from './review-approve.component';

describe('ReviewApproveComponent', () => {
  let component: ReviewApproveComponent;
  let fixture: ComponentFixture<ReviewApproveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReviewApproveComponent]
    });
    fixture = TestBed.createComponent(ReviewApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
