import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelecteurVillageComponent } from './selecteur-village.component';

describe('SelecteurVillageComponent', () => {
  let component: SelecteurVillageComponent;
  let fixture: ComponentFixture<SelecteurVillageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelecteurVillageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelecteurVillageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
