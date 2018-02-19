import { Directive, HostListener } from '@angular/core';

import { GeoService } from '../services/geo.service';

@Directive({
  selector: '[geo-autocomplete]'
})
export class AutocompleteDirective {

  constructor(private geoService: GeoService) { }

  // this directive limits the hostlistener to focus 
  // only on this particular input, not all inputs in a form
  @HostListener('input', ['$event']) onInput(event: Event) {
    this.geoService.initializeAutocompleteEvent(event);
  }
}
