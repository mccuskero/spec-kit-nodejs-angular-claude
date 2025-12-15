import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RepositoryLocation } from '../../models/dashboard-state.model';
import { ContentService } from '../../services/content.service';

export interface FolderDialogData {
  folderName: string;
  repository: RepositoryLocation;
  parentFolderId?: string;
}

@Component({
  selector: 'app-folder-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './folder-dialog.component.html',
  styleUrl: './folder-dialog.component.scss'
})
export class FolderDialogComponent {
  repository = input.required<RepositoryLocation>();
  parentFolderId = input<string>();

  folderCreated = output<FolderDialogData>();
  cancelled = output<void>();

  folderForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private contentService: ContentService
  ) {
    this.folderForm = this.fb.group({
      folderName: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  onSubmit(): void {
    if (this.folderForm.invalid) {
      return;
    }

    const folderName = this.folderForm.value.folderName.trim();

    // Validate folder name
    const validation = this.contentService.validateFolderName(folderName);
    if (!validation.valid) {
      this.errorMessage = validation.error || 'Invalid folder name';
      return;
    }

    const data: FolderDialogData = {
      folderName,
      repository: this.repository(),
      parentFolderId: this.parentFolderId()
    };

    this.folderCreated.emit(data);
    this.folderForm.reset();
    this.errorMessage = null;
  }

  onCancel(): void {
    this.cancelled.emit();
    this.folderForm.reset();
    this.errorMessage = null;
  }

  get folderName() {
    return this.folderForm.get('folderName');
  }

  hasError(controlName: string): boolean {
    const control = this.folderForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}
