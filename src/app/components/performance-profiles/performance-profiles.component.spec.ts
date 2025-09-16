import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceProfilesComponent } from './performance-profiles.component';

describe('PerformanceProfilesComponent', () => {
  let component: PerformanceProfilesComponent;
  let fixture: ComponentFixture<PerformanceProfilesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PerformanceProfilesComponent]
    });
    fixture = TestBed.createComponent(PerformanceProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
