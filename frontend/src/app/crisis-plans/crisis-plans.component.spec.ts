import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrisisPlansComponent } from './crisis-plans.component';

describe('CrisisPlansComponent', () => {
  let component: CrisisPlansComponent;
  let fixture: ComponentFixture<CrisisPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrisisPlansComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrisisPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
