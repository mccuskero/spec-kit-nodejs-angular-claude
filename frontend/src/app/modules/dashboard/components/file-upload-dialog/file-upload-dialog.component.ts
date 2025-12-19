import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RepositoryLocation } from '../../models/dashboard-state.model';

export interface FileUploadData {
  file: File;
  displayText: string;
  repository: RepositoryLocation;
  folderId: string;
}

@Component({
  selector: 'app-file-upload-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-upload-dialog.component.html',
  styleUrl: './file-upload-dialog.component.scss'
})
export class FileUploadDialogComponent {
  repository = input.required<RepositoryLocation>();
  folderId = input.required<string>();

  fileUploaded = output<FileUploadData>();
  cancelled = output<void>();

  selectedFile = signal<File | null>(null);
  displayText = signal<string>('');
  isDragging = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  handleFileSelection(file: File): void {
    this.selectedFile.set(file);
    // Auto-populate display text with filename (without extension)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    this.displayText.set(nameWithoutExt);
    this.errorMessage.set(null);
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.displayText.set('');
  }

  onSubmit(): void {
    const file = this.selectedFile();
    const text = this.displayText().trim();

    if (!file) {
      this.errorMessage.set('Please select a file to upload');
      return;
    }

    if (!text) {
      this.errorMessage.set('Please enter a display name for the file');
      return;
    }

    this.fileUploaded.emit({
      file,
      displayText: text,
      repository: this.repository(),
      folderId: this.folderId()
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
