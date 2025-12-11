import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VillageOngletComponent } from './village-onglet.component';

describe('VillageOngletComponent', () => {
  let component: VillageOngletComponent;
  let fixture: ComponentFixture<VillageOngletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VillageOngletComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VillageOngletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
