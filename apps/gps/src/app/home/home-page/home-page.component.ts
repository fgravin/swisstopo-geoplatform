import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HomeSearchComponent } from '../home-search/home-search.component'
import {
  FeatureSearchModule,
  RESULTS_LAYOUT_CONFIG,
  ResultsLayoutConfigItem,
  SearchFacade,
} from 'geonetwork-ui'
import { CatalogRecord } from 'geonetwork-ui/libs/common/domain/src/lib/model/record'
import { RecordPreviewRowComponent } from '../record-preview-row/record-preview-row.component'

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, HomeSearchComponent, FeatureSearchModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: RESULTS_LAYOUT_CONFIG,
      useValue: {
        ROW: new ResultsLayoutConfigItem(
          RecordPreviewRowComponent,
          'pb-2',
          '',
          'flex flex-col divide-y divide-y-grey-50'
        ),
      },
    },
  ],
})
export class HomePageComponent implements OnInit {
  constructor(private searchFacade: SearchFacade) {}

  ngOnInit() {
    this.searchFacade.setResultsLayout('ROW').setPageSize(6)
  }

  onMetadataSelection($event: CatalogRecord) {}
}
