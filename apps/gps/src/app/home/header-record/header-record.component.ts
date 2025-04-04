import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { combineLatest, map } from 'rxjs'
import { TranslateModule } from '@ngx-translate/core'
import { CommonModule } from '@angular/common'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { matLocationSearchingOutline } from '@ng-icons/material-icons/outline'
import { matArrowBack } from '@ng-icons/material-icons/baseline'
import {
  BadgeComponent,
  DateService,
  MdViewFacade,
  NavigationButtonComponent,
  SearchService,
} from 'geonetwork-ui'
import { DatasetRecord } from 'geonetwork-ui/libs/common/domain/src/lib/model/record'

@Component({
  selector: 'app-header-record',
  templateUrl: './header-record.component.html',
  styleUrls: ['./header-record.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    NavigationButtonComponent,
    TranslateModule,
    BadgeComponent,
    NgIcon,
  ],
  viewProviders: [provideIcons({ matLocationSearchingOutline, matArrowBack })],
})
export class HeaderRecordComponent {
  @Input() metadata: DatasetRecord
  backgroundCss = '#0c4a6e'
  foregroundColor = 'white'

  constructor(
    private searchService: SearchService,
    public facade: MdViewFacade,
    private dateService: DateService
  ) {}

  isGeodata$ = combineLatest([
    this.facade.mapApiLinks$,
    this.facade.geoDataLinks$,
  ]).pipe(
    map(
      ([mapLinks, geoDataLinks]) =>
        mapLinks?.length > 0 || geoDataLinks?.length > 0
    )
  )

  get lastUpdate() {
    return this.dateService.formatDate(this.metadata.recordUpdated)
  }

  back() {
    this.facade.loadFull(null)
    this.facade.closeMetadata()
  }
}
