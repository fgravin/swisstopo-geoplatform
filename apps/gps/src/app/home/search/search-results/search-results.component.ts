import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FeatureSearchModule, RouterFacade, SearchFacade } from 'geonetwork-ui';
import { CommonModule } from '@angular/common';
import { CatalogRecord } from 'geonetwork-ui/libs/common/domain/src/lib/model/record';

@Component({
  selector: 'mel-datahub-search-results',
  templateUrl: './search-results.component.html',
  styles: ``,
  standalone: true,
  imports: [CommonModule, FeatureSearchModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent implements OnInit {
  pageSize = 18
  totalPages_: number
  currentPage_: number

  constructor(
    private searchRouter: RouterFacade,
    private searchFacade: SearchFacade
  ) {}

  ngOnInit() {

    this.searchFacade.setPageSize(this.pageSize)
    this.searchFacade.currentPage$.subscribe((page) => {
      this.currentPage_ = page
    })
    this.searchFacade.totalPages$.subscribe((total) => {
      this.totalPages_ = total
    })
  }

  onMetadataSelection(metadata: CatalogRecord): void {
    this.searchRouter.goToMetadata(metadata)
  }
}
