import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoVillageComponent } from './info-village.component';

describe('InfoVillageComponent', () => {
  let component: InfoVillageComponent;
  let fixture: ComponentFixture<InfoVillageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoVillageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoVillageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
