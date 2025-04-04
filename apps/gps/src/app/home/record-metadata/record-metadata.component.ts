import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatTabsModule } from '@angular/material/tabs'
import {
  ErrorComponent,
  ErrorType,
  ImageOverlayPreviewComponent,
  MdViewFacade,
  MetadataCatalogComponent,
  MetadataContactComponent,
  MetadataInfoComponent,
  MetadataQualityComponent,
  SearchService,
  SourcesService,
} from 'geonetwork-ui'
import { TranslateModule } from '@ngx-translate/core'
import { combineLatest, filter, map, mergeMap } from 'rxjs'
import {
  Keyword,
  Organization,
} from 'geonetwork-ui/libs/common/domain/src/lib/model/record'

@Component({
  selector: 'app-record-metadata',
  templateUrl: './record-metadata.component.html',
  styleUrls: ['./record-metadata.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ImageOverlayPreviewComponent,
    MatTabsModule,
    ErrorComponent,
    MetadataInfoComponent,
    MetadataContactComponent,
    MetadataQualityComponent,
    MetadataCatalogComponent,
    TranslateModule,
  ],
})
export class RecordMetadataComponent {
  @Input() metadataQualityDisplay: boolean

  constructor(
    public metadataViewFacade: MdViewFacade,
    private searchService: SearchService,
    private sourceService: SourcesService
  ) {}

  displayDownload$ = this.metadataViewFacade.downloadLinks$.pipe(
    map((links) => links?.length > 0)
  )
  displayApi$ = this.metadataViewFacade.apiLinks$.pipe(
    map((links) => links?.length > 0)
  )

  displayOtherLinks = this.metadataViewFacade.otherLinks$.pipe(
    map((links) => links?.length > 0)
  )
  displayRelated$ = this.metadataViewFacade.related$.pipe(
    map((records) => records?.length > 0)
  )

  displayDatasetHasNoLinkBlock$ = combineLatest([
    this.metadataViewFacade.isMetadataLoading$,
    this.displayDownload$,
    this.displayApi$,
    this.displayOtherLinks,
  ]).pipe(
    map(
      ([isMetadataLoading, displayDownload, displayApi, displayOtherLinks]) =>
        !isMetadataLoading &&
        !displayDownload &&
        !displayApi &&
        !displayOtherLinks
    )
  )

  organisationName$ = this.metadataViewFacade.metadata$.pipe(
    map((record) => record?.ownerOrganization?.name),
    filter(Boolean)
  )

  metadataUuid$ = this.metadataViewFacade.metadata$.pipe(
    map((record) => record?.uniqueIdentifier),
    filter(Boolean)
  )

  sourceLabel$ = this.metadataViewFacade.metadata$.pipe(
    map((record) => record?.extras['catalogUuid'] as string),
    filter((uuid) => !!uuid),
    mergeMap((uuid) => this.sourceService.getSourceLabel(uuid))
  )

  errorTypes = ErrorType

  thumbnailUrl$ = this.metadataViewFacade.metadata$.pipe(
    map((metadata) => {
      // in order to differentiate between metadata not loaded yet
      // and url not defined
      // the content-ghost of image-overlay-preview relies on this differentiation
      if (metadata?.overviews === undefined) {
        return undefined
      } else {
        return metadata?.overviews?.[0]?.url ?? null
      }
    })
  )

  showOverlay = true

  onInfoKeywordClick(keyword: Keyword) {
    this.searchService.updateFilters({ any: keyword.label })
  }
}
