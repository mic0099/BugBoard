import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { Project } from '../../interfaces/project';
import { BugBoard } from '../../services/bugBoardService/bug-board';

@Component({
  selector: 'app-projectedit',
  standalone: true,
  imports: [
    CommonModule,ReactiveFormsModule],
  templateUrl: './project-edit.html',
  styleUrl: './project-edit.scss',
})
export class Projectedit {

  @Input({ required: true })
  project!: Project;

  @Output()
  close = new EventEmitter<void>();

  @Output()
  updated = new EventEmitter<void>();

  emailsToAdd: string[] = [];
  emailsToRemove: string[] = [];

  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private projectService = inject(BugBoard);

  editForm: FormGroup = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50)
    ]],
    newEmailInput: ['', [Validators.email]]
  });

  ngOnInit(): void {
    this.editForm.patchValue({
      name: this.project.name
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  toggleRemoveMember(email: string): void {
    if (this.emailsToRemove.includes(email)) {
      this.emailsToRemove = this.emailsToRemove.filter(
        e => e !== email
      );
    } else {
      this.emailsToRemove.push(email);
    }
  }

  isMarkedForRemoval(email: string): boolean {
    return this.emailsToRemove.includes(email);
  }

  addEmailToList(): void {
    const email = this.editForm.get('newEmailInput')?.value;

    if (!email || this.editForm.get('newEmailInput')?.invalid) {
      this.toastr.error('Insert a valid email');
      return;
    }

    const alreadyPresent =
      this.emailsToAdd.includes(email) ||
      this.project.Users?.some(u => u.email === email);

    if (alreadyPresent) {
      this.toastr.warning('This member already exists');
      return;
    }

    this.projectService.checkEmailExists(email).subscribe({
      next: () => {
        this.emailsToAdd.push(email);
        this.editForm.get('newEmailInput')?.reset();
        this.toastr.success('User found');
      },
      error: () => {
        this.toastr.error('User not found');
      }
    });
  }

  removeEmailFromAddList(email: string): void {
    this.emailsToAdd = this.emailsToAdd.filter(
      e => e !== email
    );
  }

  saveProject(): void {

    const formValues = this.editForm.value;
    const payload: any = {};

    if (formValues.name !== this.project.name) {
      payload.name = formValues.name;
    }

    if (this.emailsToAdd.length > 0) {
      payload.emails = this.emailsToAdd;
    }

    if (this.emailsToRemove.length > 0) {
      payload.removeEmails = this.emailsToRemove;
    }

    if (Object.keys(payload).length === 0) {
      this.closeModal();
      return;
    }

    this.projectService.updateProject(
      this.project.projectId,
      payload
    ).subscribe({
      next: () => {
        this.toastr.success('Project updated successfully');
        this.updated.emit();
      },
      error: () => {
        this.toastr.error('Error during update');
      }
    });
  }
}