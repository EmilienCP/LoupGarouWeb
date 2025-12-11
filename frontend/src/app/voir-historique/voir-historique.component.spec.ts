import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoirHistoriqueComponent } from './voir-historique.component';

describe('VoirHistoriqueComponent', () => {
  let component: VoirHistoriqueComponent;
  let fixture: ComponentFixture<VoirHistoriqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VoirHistoriqueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VoirHistoriqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
