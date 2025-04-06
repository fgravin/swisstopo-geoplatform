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
    if (!this.record.onlineResources) return null

    let bestLink: DatasetOnlineResource = null
    let bestPriority = 0
    for (const link of this.record.onlineResources) {
      if (
        link.type !== 'link' &&
        link.type !== 'download' &&
        link.type !== 'service'
      ) {
        continue
      }
      if (
        !this.linkClassifier.hasUsage(link, LinkUsage.MAP_API) &&
        !this.linkClassifier.hasUsage(link, LinkUsage.GEODATA)
      ) {
        continue
      }
      let currentPriority = 1
      if (
        'accessServiceProtocol' in link &&
        link.accessServiceProtocol === 'wmts'
      ) {
        currentPriority = 3
      } else if (
        'accessServiceProtocol' in link &&
        link.accessServiceProtocol === 'wms'
      ) {
        currentPriority = 2
      }
      if (currentPriority > bestPriority) {
        bestLink = link
        bestPriority = currentPriority
      }
    }

    return bestLink
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
    const context = await firstValueFrom(this.mapFacade.context$)
    const dataLayer = await firstValueFrom(this.getLayerFromLink(link))
    const view = await createViewFromLayer(dataLayer).catch((error) => {
      console.warn('Could not zoom on layer, error is:', error.stack)
      return context.view
    })
    // TODO: generate geojson from all extents
    // const extent: MapContextLayer = {
    //   type: 'geojson',
    //   data: record.spatialExtents
    // }
    if (clearMap) {
      this.mapFacade.applyContext({
        ...context,
        layers: [dataLayer],
        view,
      })
    } else {
      this.mapFacade.applyContext({
        ...context,
        layers: [...context.layers, dataLayer],
        view,
      })
    }
  }
}
