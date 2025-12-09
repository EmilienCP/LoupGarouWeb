import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MontrerPersonnageComponent } from './montrer-personnage.component';

describe('MontrerPersonnageComponent', () => {
  let component: MontrerPersonnageComponent;
  let fixture: ComponentFixture<MontrerPersonnageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MontrerPersonnageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MontrerPersonnageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
