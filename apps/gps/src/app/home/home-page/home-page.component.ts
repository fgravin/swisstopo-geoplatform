import { ChangeDetectionStrategy, Component, importProvidersFrom, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HomeSearchComponent } from '../home-search/home-search.component'
import {
  BASEMAP_LAYERS,
  FeatureSearchModule, MapFacade, MapStateContainerComponent,
  RESULTS_LAYOUT_CONFIG,
  ResultsLayoutConfigItem,
  SearchFacade,
  DO_NOT_USE_DEFAULT_BASEMAP,
  MAP_VIEW_CONSTRAINTS, FeatureMapModule,
} from 'geonetwork-ui'
import { CatalogRecord } from 'geonetwork-ui/libs/common/domain/src/lib/model/record'
import { RecordPreviewRowComponent } from '../record-preview-row/record-preview-row.component'

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    HomeSearchComponent,
    FeatureSearchModule,
    MapStateContainerComponent,
    FeatureMapModule,
  ],
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
    {
      provide: BASEMAP_LAYERS,
      useValue: [{
        type: "xyz",
        url: "https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg"
      }]
    },
    {
      provide: DO_NOT_USE_DEFAULT_BASEMAP,
      useValue: true
    },
    {
      provide: MAP_VIEW_CONSTRAINTS,
      useValue: {
        maxExtent: [320000, 5500000, 1580000, 6300000]
      }
    }
  ],
})
export class HomePageComponent implements OnInit {
  constructor(private searchFacade: SearchFacade, private mapFacade: MapFacade) {}

  ngOnInit() {
    this.searchFacade.setResultsLayout('ROW').setPageSize(6)
    this.mapFacade.applyContext({
      layers: [],
      view: {
        zoom: 2,
        center: [8.4265137, 46.8075795]
      },
    })
  }

  onMetadataSelection($event: CatalogRecord) {
  }
}
