import {
  Component,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { TranslateModule } from '@ngx-translate/core'
import { NgIcon } from '@ng-icons/core'

@Component({
  selector: 'datahub-header-badge-button',
  templateUrl: './header-badge-button.component.html',
  styleUrls: ['./header-badge-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [BrowserModule, TranslateModule, NgIcon],
})
export class HeaderBadgeButtonComponent {
  @Input() label: string
  @Input() icon: string
  @Input() toggled: boolean
  @Output() action = new EventEmitter<boolean>()

  toggle() {
    this.toggled = !this.toggled
    this.action.emit(this.toggled)
  }
}
