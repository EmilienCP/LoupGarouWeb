import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttenteComponent } from './attente.component';

describe('AttenteComponent', () => {
  let component: AttenteComponent;
  let fixture: ComponentFixture<AttenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
