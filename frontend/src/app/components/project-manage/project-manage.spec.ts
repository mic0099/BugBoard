import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectManage } from './project-manage';

describe('ProjectManage', () => {
  let component: ProjectManage;
  let fixture: ComponentFixture<ProjectManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectManage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectManage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
