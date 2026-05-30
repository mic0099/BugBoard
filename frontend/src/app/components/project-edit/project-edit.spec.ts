import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Projectedit } from './project-edit';

describe('Projectedit', () => {
  let component: Projectedit;
  let fixture: ComponentFixture<Projectedit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projectedit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Projectedit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
