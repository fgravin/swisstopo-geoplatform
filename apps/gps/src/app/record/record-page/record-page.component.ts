import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-record-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './record-page.component.html',
  styleUrl: './record-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordPageComponent {}
