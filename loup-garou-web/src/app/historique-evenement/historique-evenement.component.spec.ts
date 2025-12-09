import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueEvenementComponent } from './historique-evenement.component';

describe('HistoriqueEvenementComponent', () => {
  let component: HistoriqueEvenementComponent;
  let fixture: ComponentFixture<HistoriqueEvenementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoriqueEvenementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoriqueEvenementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
