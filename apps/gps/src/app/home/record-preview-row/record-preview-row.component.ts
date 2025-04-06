import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core'
import {
  ButtonComponent,
  LinkClassifierService,
  LinkUsage,
  MapFacade,
  MarkdownParserComponent,
  RecordPreviewComponent,
  ThumbnailComponent,
} from 'geonetwork-ui'
import { NgIcon } from '@ng-icons/core'
import { CommonModule } from '@angular/common'
import {
  DatasetOnlineResource,
  DatasetRecord,
} from 'geonetwork-ui/libs/common/domain/src/lib/model/record'
import { firstValueFrom, map, Observable, of, tap, throwError } from 'rxjs'
import {
  createViewFromLayer,
  MapContext,
  MapContextLayer,
} from '@geospatial-sdk/core'
import { DataService } from 'geonetwork-ui'

@Component({
  selector: 'app-record-preview-row',
  templateUrl: './record-preview-row.component.html',
  styleUrls: ['./record-preview-row.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ThumbnailComponent,
    MarkdownParserComponent,
    NgIcon,
    ButtonComponent,
  ],
  standalone: true,
})
export class RecordPreviewRowComponent extends RecordPreviewComponent {
  get mapLink(): DatasetOnlineResource {
    const mapLinks = (this.record as DatasetRecord)?.onlineResources.filter(
      (link) =>
        this.linkClassifier.hasUsage(link, LinkUsage.MAP_API) &&
        !link.url.host.startsWith('localhost')
    ) as DatasetOnlineResource[]

    return mapLinks?.length > 0 ? mapLinks[0] : null
  }

  constructor(
    protected elementRef: ElementRef,
    private linkClassifier: LinkClassifierService,
    private mapFacade: MapFacade,
    private dataService: DataService
  ) {
    super(elementRef)
  }

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

  async handleLinkClick(link: DatasetOnlineResource, clearMap: boolean) {
    const record = this.record
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
}
