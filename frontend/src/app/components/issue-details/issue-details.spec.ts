import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueComments } from './issue-details';

describe('IssueComments', () => {
  let component: IssueComments;
  let fixture: ComponentFixture<IssueComments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueComments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssueComments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
