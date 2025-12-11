import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationAppareilsComponent } from './creation-appareils.component';

describe('CreationAppareilsComponent', () => {
  let component: CreationAppareilsComponent;
  let fixture: ComponentFixture<CreationAppareilsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreationAppareilsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationAppareilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
