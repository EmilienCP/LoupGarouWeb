import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DjaiComponent } from './djai.component';

describe('DjaiComponent', () => {
  let component: DjaiComponent;
  let fixture: ComponentFixture<DjaiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DjaiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DjaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
