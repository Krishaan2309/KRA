import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiEntryComponent } from './kpi-entry.component';

describe('KpiEntryComponent', () => {
  let component: KpiEntryComponent;
  let fixture: ComponentFixture<KpiEntryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KpiEntryComponent]
    });
    fixture = TestBed.createComponent(KpiEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
