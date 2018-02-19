import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { environment } from '../../environments/environment';

// models
import { AddressModel } from '../models/address.model';
import { DateTimeModel } from '../models/date.time.model';

// services
import { SettingsService } from './settings.service';

// google
declare var google: any;

@Injectable()
export class GeoService {

  private latlngSetSource = new Subject<AddressModel>();
  public latlngSet$ = this.latlngSetSource.asObservable();
  public circle: any;
  public gmaps: any;
  public initialized = false;

  constructor(
    private http: Http
  ) {
    let geolocation = new google.maps.LatLng(environment.center.lat, environment.center.lng);
    this.circle = new google.maps.Circle({
      center: geolocation,
      radius: environment.center.radius
    });
  }

  public processManualInputEvent(address: AddressModel) {
    let url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
    url += address.line_1.replace(' ', '+');
    url += ',+';
    url += address.city.replace(' ', '+');
    url += ',+';
    url += "CA";
    url += ',+USA';
    url += '&key=' + environment.gmapskey;
    //console.log('url: ' + url);
    this.http.get(url).subscribe(
      (res: Response) => this.parseLatLng(res, address)
    );
  }

  private parseLatLng(res: Response, address: AddressModel) {

    address.verified = false;

    let body = res['_body'] || '';
    let location = JSON.parse(res.text());

    if (location.results.length == 0) {
      return;
    }

    let lat = location.results[0].geometry.location.lat;
    let lng = location.results[0].geometry.location.lng;
    address.place_id = location.results[0].place_id;
    address.lat = lat;
    address.lng = lng;

    this.verifyIfAddressInBounds(address);
    this.latlngSetSource.next(address);
  }

  public verifyIfAddressInBounds(address: AddressModel) {

    address.verified = false;

    let lat = parseFloat(address.lat);
    let lng = parseFloat(address.lng);

    if (environment.bounds.apply) {
      // north/south
      if (lat < environment.bounds.latmin || lat > environment.bounds.latmax) {
        return;
      }

      // east/west
      if (lng < environment.bounds.lngmin || lng > environment.bounds.lngmax) {
        return;
      }
    }

    address.verified = true;
  }

  public initializeAutocompleteEvent(inputEvent) {

    if (this.initialized) {
      return;
    }

    let autocomplete = new google.maps.places.Autocomplete(<HTMLInputElement>inputEvent.currentTarget);
    autocomplete.setBounds(this.circle.getBounds());
    this.initialized = true;

    let _this = this;
    autocomplete.addListener('place_changed', function () {
      let place = autocomplete.getPlace();
      let components = place.address_components;

      let address = new AddressModel();

      for (var i = 0, component; component = components[i]; i++) {
        switch (component.types[0]) {
          case 'street_number':
            address.line_1 += component['long_name'] + ' ';
            break
          case 'route':
            address.line_1 += component['long_name'] + ' ';
            break
          case 'locality':
          case 'neighborhood':
            address.city = component['long_name'];
            break
          // hardwired to Los Angeles for this demo
          //case 'postal_code':
          //  address.postcode = component['long_name'];
          //  break
          //case 'administrative_area_level_1':
          //  address.state = component['long_name'];
          //  break
        }
      }

      address.lat = place.geometry.location.lat();
      address.lng = place.geometry.location.lng();
      address.place_id = place.place_id;

      _this.verifyIfAddressInBounds(address);
      _this.latlngSetSource.next(address);
    });

  }
}
