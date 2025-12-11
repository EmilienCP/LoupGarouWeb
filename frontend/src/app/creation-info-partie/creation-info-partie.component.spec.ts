import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationInfoPartieComponent } from './creation-info-partie.component';

describe('CreationInfoPartieComponent', () => {
  let component: CreationInfoPartieComponent;
  let fixture: ComponentFixture<CreationInfoPartieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreationInfoPartieComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationInfoPartieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
