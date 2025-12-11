import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoMatinComponent } from './video-matin.component';

describe('VideoMatinComponent', () => {
  let component: VideoMatinComponent;
  let fixture: ComponentFixture<VideoMatinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoMatinComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoMatinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
