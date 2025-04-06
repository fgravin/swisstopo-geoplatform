import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core'
import {
  ButtonComponent,
  DataService,
  LinkClassifierService,
  LinkUsage,
  MapFacade,
  MarkdownParserComponent,
  NotificationsService,
  RecordPreviewComponent,
  ThumbnailComponent,
} from 'geonetwork-ui'
import { CommonModule } from '@angular/common'
import { DatasetOnlineResource } from 'geonetwork-ui/libs/common/domain/src/lib/model/record'
import { firstValueFrom, map, Observable, of, tap, throwError } from 'rxjs'
import { createViewFromLayer, MapContextLayer } from '@geospatial-sdk/core'

@Component({
  selector: 'app-record-preview-row',
  templateUrl: './record-preview-row.component.html',
  styleUrls: ['./record-preview-row.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ThumbnailComponent,
    MarkdownParserComponent,
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
      if (/^https?:\/\/localhost/.test(link.url.toString())) {
        continue
      }
      let currentPriority = 1
      if (
        'accessServiceProtocol' in link &&
        link.accessServiceProtocol === 'wmts'
      ) {
        currentPriority = 3
        if (!link.name) continue
      } else if (
        'accessServiceProtocol' in link &&
        link.accessServiceProtocol === 'wms'
      ) {
        currentPriority = 2
        if (!link.name) continue
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
    private dataService: DataService,
    private notificationsService: NotificationsService
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
    try {
      const context = await firstValueFrom(this.mapFacade.context$)
      const dataLayer = await firstValueFrom(this.getLayerFromLink(link))
      const view = await createViewFromLayer(dataLayer).catch((e) => {
        console.warn('Could not create view from layer', e.stack)
        return null
      })
      // TODO: generate geojson from all extents
      // const extent: MapContextLayer = {
      //   type: 'geojson',
      //   data: record.spatialExtents
      // }
      const layers = clearMap ? [dataLayer] : [...context.layers, dataLayer]
      this.mapFacade.applyContext({
        ...context,
        layers,
        ...(view && { view }),
      })
    } catch (e) {
      this.notificationsService.showNotification(
        {
          type: 'error',
          title: 'Layer could not be added',
          text: e.message,
        },
        undefined,
        e
      )
      return
    }
    const notifications = await firstValueFrom(
      this.notificationsService.notifications$
    )
    notifications.forEach((n) =>
      this.notificationsService.removeNotificationById(n.id)
    )
    this.notificationsService.showNotification(
      {
        type: 'success',
        title: 'Layer was added successfully!',
        text: '',
      },
      2000
    )
  }
}
