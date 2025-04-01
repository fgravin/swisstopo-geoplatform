import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeSearchComponent } from '../home-search/home-search.component';
import { FeatureSearchModule, SearchFacade } from 'geonetwork-ui';
import { CatalogRecord } from 'geonetwork-ui/libs/common/domain/src/lib/model/record';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, HomeSearchComponent, FeatureSearchModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit{

  constructor(    private searchFacade: SearchFacade
  ) {

  }

  ngOnInit() {
    this.searchFacade.setResultsLayout('ROW')

  }

  onMetadataSelection($event: CatalogRecord) {

  }
}
