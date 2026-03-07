import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueItem } from './issue-item';

describe('IssueItem', () => {
  let component: IssueItem;
  let fixture: ComponentFixture<IssueItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssueItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
