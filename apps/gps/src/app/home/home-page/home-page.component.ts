import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HomeSearchComponent } from '../home-search/home-search.component'
import {
  BASEMAP_LAYERS,
  DataService,
  DO_NOT_USE_DEFAULT_BASEMAP,
  FeatureMapModule,
  FeatureSearchModule,
  LinkClassifierService,
  LinkUsage,
  MAP_VIEW_CONSTRAINTS,
  MapFacade,
  MapStateContainerComponent,
  RESULTS_LAYOUT_CONFIG,
  ResultsLayoutConfigItem,
  SearchFacade,
} from 'geonetwork-ui'
import {
  CatalogRecord,
  DatasetOnlineResource,
  OnlineResource,
} from 'geonetwork-ui/libs/common/domain/src/lib/model/record'
import { RecordPreviewRowComponent } from '../record-preview-row/record-preview-row.component'
import { firstValueFrom, map, Observable, of, tap, throwError } from 'rxjs'
import { MapContextLayer, createViewFromLayer } from '@geospatial-sdk/core'

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
      useValue: [
        {
          type: 'xyz',
          url: 'https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg',
        },
      ],
    },
    {
      provide: DO_NOT_USE_DEFAULT_BASEMAP,
      useValue: true,
    },
    {
      provide: MAP_VIEW_CONSTRAINTS,
      useValue: {
        maxExtent: [320000, 5500000, 1580000, 6300000],
      },
    },
  ],
})
export class HomePageComponent implements OnInit {
  constructor(
    private searchFacade: SearchFacade,
    private mapFacade: MapFacade,
    private linkClassifier: LinkClassifierService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.searchFacade
      .setResultsLayout('ROW')
      .setPageSize(10)
      .setConfigRequestFields(null)
      .setSortBy(['desc', 'createDate'])
    this.mapFacade.applyContext({
      layers: [],
      view: {
        zoom: 2,
        center: [8.4265137, 46.8075795],
      },
    })
  }

  async onMetadataSelection(record: CatalogRecord) {
    if (!record.onlineResources) return

    const linksWithRank: Array<[DatasetOnlineResource, number]> = []
    for (const link of record.onlineResources) {
      if (
        link.type !== 'link' &&
        link.type !== 'download' &&
        link.type !== 'service'
      ) {
        continue
      }
      let rank = -1
      // give priority to APIs instead of full datasets
      // give priority to WMTS and then WMS
      if (
        !this.linkClassifier.hasUsage(link, LinkUsage.MAP_API) &&
        !this.linkClassifier.hasUsage(link, LinkUsage.GEODATA)
      ) {
        continue
      }
      rank = 20
      if (
        'accessServiceProtocol' in link &&
        link.accessServiceProtocol === 'wmts'
      ) {
        rank = 22
      } else if (
        'accessServiceProtocol' in link &&
        link.accessServiceProtocol === 'wms'
      ) {
        rank = 21
      }
      linksWithRank.push([link, rank])
    }

    if (!linksWithRank.length) return

    const bestLink = linksWithRank.sort(
      ([, rankA], [, rankB]) => rankB - rankA
    )[0]

    const context = await firstValueFrom(this.mapFacade.context$)
    const dataLayer = await firstValueFrom(this.getLayerFromLink(bestLink[0]))
    const view = await createViewFromLayer(dataLayer)
    // TODO: generate geojson from all extents
    // const extent: MapContextLayer = {
    //   type: 'geojson',
    //   data: record.spatialExtents
    // }
    this.mapFacade.applyContext({
      ...context,
      layers: [dataLayer],
      view,
    })
  }

  // TODO: factorize this in GN-UI
  // TODO: export DatasetOnlineResource
  private getLayerFromLink(
    link: DatasetOnlineResource
  ): Observable<MapContextLayer> {
    if (link.type === 'service' && link.accessServiceProtocol === 'wms') {
      return of({
        url: link.url.toString(),
        type: 'wms',
        name: link.name,
      })
    } else if (
      link.type === 'service' &&
      link.accessServiceProtocol === 'wmts'
    ) {
      return of({
        url: link.url.toString(),
        type: 'wmts',
        name: link.name,
      })
    } else if (
      (link.type === 'service' &&
        (link.accessServiceProtocol === 'wfs' ||
          link.accessServiceProtocol === 'esriRest' ||
          link.accessServiceProtocol === 'ogcFeatures')) ||
      link.type === 'download'
    ) {
      return this.dataService.readAsGeoJson(link, true).pipe(
        tap(console.log),
        map((data) => ({
          type: 'geojson',
          data,
        }))
      )
    }
    return throwError(() => 'protocol not supported')
  }
}
