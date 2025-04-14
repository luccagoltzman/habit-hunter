import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitCreateComponent } from './habit-create.component';

describe('HabitCreateComponent', () => {
  let component: HabitCreateComponent;
  let fixture: ComponentFixture<HabitCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
