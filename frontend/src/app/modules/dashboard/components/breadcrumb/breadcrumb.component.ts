import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbItem } from '../../models/dashboard-state.model';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  path = input<BreadcrumbItem[]>([]);

  breadcrumbClicked = output<BreadcrumbItem>();
  homeClicked = output<void>();

  onHomeClick(): void {
    this.homeClicked.emit();
  }

  onBreadcrumbClick(item: BreadcrumbItem): void {
    this.breadcrumbClicked.emit(item);
  }
}
