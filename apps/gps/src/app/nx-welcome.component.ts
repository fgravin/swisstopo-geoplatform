import { Component, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BadgeComponent } from 'geonetwork-ui';

@Component({
  selector: 'app-nx-welcome',
  standalone: true,
  imports: [BrowserModule, BadgeComponent],
  template: `
    <gn-ui-badge>Test MEL</gn-ui-badge>`,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class NxWelcomeComponent {}
