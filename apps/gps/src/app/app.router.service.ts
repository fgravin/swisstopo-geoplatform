import { Injectable } from '@angular/core'
import { Routes } from '@angular/router'
import { RouterService } from 'geonetwork-ui'
import { HomePageComponent } from './home/home-page/home-page.component'

@Injectable()
export class AppRouterService extends RouterService {
  override buildRoutes(): Routes {
    return [
      ...super.buildRoutes().slice(1),
      { path: '', redirectTo: `/home`, pathMatch: 'full' },
      {
        path: 'home',
        component: HomePageComponent,
        data: {
          shouldDetach: true,
        },
      },
    ]
  }
}
