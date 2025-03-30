import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeSearchComponent } from '../home-header/home-search.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, HomeSearchComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {}
