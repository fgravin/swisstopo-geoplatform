import { importProvidersFrom, isDevMode, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule } from '@angular/router'
import { AppComponent } from './app.component'
import { StoreModule } from '@ngrx/store'
import { EffectsModule } from '@ngrx/effects'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { StoreRouterConnectingModule } from '@ngrx/router-store'
import {
  DefaultRouterModule,
  EmbeddedTranslateLoader,
  FeatureAuthModule,
  FeatureCatalogModule,
  FeatureRecordModule,
  FeatureSearchModule,
  Gn4PlatformService,
  provideGn4,
  provideRepositoryUrl,
  ThemeService,
  TRANSLATE_DEFAULT_CONFIG,
  UiElementsModule,
  UiLayoutModule,
  UiSearchModule,
} from 'geonetwork-ui'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { RecordPageComponent } from './record/record-page/record-page.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HeaderComponent } from './platform/header/header.component'
import { MenuComponent } from './platform/menu/menu.component'
import { HomePageComponent } from './home/home-page/home-page.component'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FeatureSearchModule,
    FeatureCatalogModule,
    FeatureRecordModule,

    UiLayoutModule,
    UiSearchModule,
    UiElementsModule,

    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({}),
    StoreModule.forRoot(
      {},
      {
        metaReducers: [],
        runtimeChecks: {
          strictActionImmutability: true,
          strictStateImmutability: true,
        },
      }
    ),
    StoreRouterConnectingModule.forRoot(),
    TranslateModule.forRoot({
      ...TRANSLATE_DEFAULT_CONFIG,
      loader: {
        provide: TranslateLoader,
        useClass: EmbeddedTranslateLoader,
      },
    }),
    RouterModule.forRoot([], {
      initialNavigation: 'enabledBlocking',
      scrollPositionRestoration: 'enabled',
    }),
    DefaultRouterModule.forRoot({
      searchStateId: 'mainSearch',
      searchRouteComponent: HomePageComponent,
      recordRouteComponent: RecordPageComponent,
      organizationRouteComponent: HomePageComponent,
    }),
    HeaderComponent,
    MenuComponent,
  ],
  providers: [
    importProvidersFrom(FeatureAuthModule),
    provideGn4(),
    provideRepositoryUrl(() => 'https://www.geocat.ch/geonetwork/srv/api'),
    Gn4PlatformService,
    /*
    {
      provide: RouterService,
      useClass: AppRouterService,
    },
*/
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    ThemeService.applyCssVariables(
      '#0c4a6e',
      '#0c4a6e',
      'rgb(85,85,85)',
      'white',
      'Noto Sans',
      'Noto Sans'
    )
  }
}
