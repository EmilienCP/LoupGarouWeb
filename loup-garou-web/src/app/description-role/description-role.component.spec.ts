import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionRoleComponent } from './description-role.component';

describe('DescriptionRoleComponent', () => {
  let component: DescriptionRoleComponent;
  let fixture: ComponentFixture<DescriptionRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DescriptionRoleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DescriptionRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
