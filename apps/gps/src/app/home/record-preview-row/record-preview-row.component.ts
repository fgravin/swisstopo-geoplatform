import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core'
import {
  MarkdownParserComponent,
  RecordPreviewComponent,
  ThumbnailComponent,
} from 'geonetwork-ui'
import { NgIcon } from '@ng-icons/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'gn-ui-record-preview-row',
  templateUrl: './record-preview-row.component.html',
  styleUrls: ['./record-preview-row.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ThumbnailComponent, MarkdownParserComponent, NgIcon],
  standalone: true,
})
export class RecordPreviewRowComponent extends RecordPreviewComponent {
  constructor(protected elementRef: ElementRef) {
    super(elementRef)
  }
}
