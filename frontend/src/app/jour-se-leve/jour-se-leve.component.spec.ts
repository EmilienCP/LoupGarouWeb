import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JourSeLeveComponent } from './jour-se-leve.component';

describe('JourSeLeveComponent', () => {
  let component: JourSeLeveComponent;
  let fixture: ComponentFixture<JourSeLeveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JourSeLeveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JourSeLeveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
