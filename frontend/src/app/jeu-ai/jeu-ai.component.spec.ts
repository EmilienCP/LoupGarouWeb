import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JeuAIComponent } from './jeu-ai.component';

describe('JeuAIComponent', () => {
  let component: JeuAIComponent;
  let fixture: ComponentFixture<JeuAIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JeuAIComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JeuAIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
