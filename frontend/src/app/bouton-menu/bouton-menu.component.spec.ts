import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutonMenuComponent } from './bouton-menu.component';

describe('BoutonMenuComponent', () => {
  let component: BoutonMenuComponent;
  let fixture: ComponentFixture<BoutonMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoutonMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoutonMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
