import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccusationsComponent } from './accusations.component';

describe('AccusationsComponent', () => {
  let component: AccusationsComponent;
  let fixture: ComponentFixture<AccusationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccusationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccusationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
