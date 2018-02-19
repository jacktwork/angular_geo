import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { EventModel } from '../models/event.model';
import { DateTimeModel } from '../models/date.time.model';
import { AddressModel } from '../models/address.model';

import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';

import { SettingsService } from '../services/settings.service';
import { EventsService } from '../services/events.service';
import { GeoService } from '../services/geo.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})

export class AddComponent implements OnInit {

  bsModalRef: BsModalRef;

  private addTitle = '';

  private addressSearchLabel = '';

  private addressLabel = '';
  private addressReq = '';

  private addressCityLabel = '';
  private addressCityReq = '';

  private latlngReq = '';

  private saveLabel = '';

  @ViewChild('addForm') addForm: NgForm;

  constructor(
    private settings: SettingsService,
    private eventsService: EventsService,
    private geo: GeoService,
    public router: Router,
    public user: UserService,
    private modalService: BsModalService
  ) {
    geo.latlngSet$.subscribe(
      result => {
        this.eventsService.editor.mapAddress = result;
        //console.log('add component subscribe: ' + this.eventsService.add.mapAddress.verified)
        if (this.eventsService.editor.mapAddress.verified) {
          this.eventsService.editor.mapAddress.line_1 = result.line_1;
          this.eventsService.editor.mapAddress.city = result.city;
          this.eventsService.editor.mapAddress.lat = result.lat;
          this.eventsService.editor.mapAddress.lng = result.lng;
          this.geo.verifyIfAddressInBounds(this.eventsService.editor.mapAddress);
          this.addForm.form.get('addressField').setValue(this.eventsService.editor.mapAddress.line_1);
          this.addForm.form.get('addressCityField').setValue(this.eventsService.editor.mapAddress.city);
        }
      });
  }

  ngOnInit() {
    this.setLanguage();
  }

  private saveDisabled() {
    if (!this.eventsService.editor.mapAddress.verified) {
      return true;
    }
    return false;
  }

  private saveSubmit() {
    this.eventsService.saveEvent();
  }

  private addressChanged() {
    this.geo.processManualInputEvent(this.eventsService.editor.mapAddress);
  }

  public setLanguage() {
    switch (this.settings.getLanguage()) {
      case 'us':
        this.addTitle = 'Add Event';
        this.addressSearchLabel = 'Search';
        this.addressLabel = 'Address *';
        this.addressReq = 'Address is required!';
        this.addressCityLabel = 'City *';
        this.addressCityReq = 'City is required!';
        this.latlngReq = 'Address is not a Google Maps address or is not in Los Angeles';

        this.saveLabel = 'Save';
        break;
    }
  }
}