import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  FeatureSearchModule,
  RouterFacade,
  SearchInputComponent,
} from 'geonetwork-ui'
import { CatalogRecord } from 'geonetwork-ui/libs/common/domain/src/lib/model/record'

@Component({
  selector: 'app-home-search',
  standalone: true,
  imports: [CommonModule, SearchInputComponent, FeatureSearchModule],
  templateUrl: './home-search.component.html',
  styleUrl: './home-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeSearchComponent {
  constructor(public routerFacade: RouterFacade) {}

  onFuzzySearchSelection(record: CatalogRecord) {
    console.log('select')
  }
}
