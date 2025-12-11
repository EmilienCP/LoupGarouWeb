import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoindreComponent } from './joindre.component';

describe('JoindreComponent', () => {
  let component: JoindreComponent;
  let fixture: ComponentFixture<JoindreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoindreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoindreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
