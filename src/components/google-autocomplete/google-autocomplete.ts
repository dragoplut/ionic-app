import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/map';

const GOOGLE_API_URL = "https://maps.googleapis.com/maps/api/place/";

@Component({
  selector: 'google-places-autocomplete',
  templateUrl: `./google-autocomplete.html`,
})
export class GooglePlacesAutocompleteComponent {

  @Output("callback") callback : EventEmitter<any> = new EventEmitter();

  @Input("placeholder") placeholder : string;

  @Input("request") request : string;

  @Input("types") types : string;

  @Input("type") type : string;

  @Input("key") key : string;

  @Input("offset") offset : string;

  @Input("location") location : string;

  @Input("radius") radius : string;

  @Input("language") language : string;

  @Input("components") components : string;

  @Input("strictbounds") strictbounds : string;

  public locals: any[];

  constructor(@Inject(Http) public http: Http) {
    if (this.placeholder == null) {
      this.placeholder = "Search";
    }
  }

  public autocomplete(input: string) {
    let requestTypeParam: string = this.request != null ? this.request : "autocomplete";
    let typesParam: string = this.types != null ? ("&types=" + this.types) : "";
    let typeParam: string = this.type != null ? ("&type=" + this.type) : "";
    let offsetParam: string = this.offset != null ? ("&offset=" + this.offset) : "";
    let locationParam: string = this.location != null ? ("&location=" + this.location) : "";
    let radiusParam: string = this.radius != null ? ("&radius=" + this.radius) : "";
    let languageParam: string = this.language != null ? ("&language=" + this.language) : "";
    let componentsParam: string = this.components != null ? ("&components=" + this.components) : "";
    let strictboundsParam: string = this.strictbounds != null ? ("&strictbounds=" + this.strictbounds) : "";
    let params = typesParam + typeParam + offsetParam + locationParam + radiusParam + languageParam + componentsParam + strictboundsParam;

    return this.http.get(GOOGLE_API_URL + requestTypeParam + "/json?input="+input+"&key="+this.key+params)
      .map(res => res.json());
  }

  public getLocals(ev: any) {
    let val = ev.target.value;
    if (val && val.trim().length > 3) {
      this.autocomplete(val)
        .subscribe(res => {
          this.locals = res.predictions;
        });
    } else {
      this.locals = [];
    }
  }

  public getDetails(item: any) {
    this.requestDetails(item)
      .subscribe(res => {
        this.callback.emit([res.result]);
      });
  }

  public requestDetails(item) {
    return this.http.get(GOOGLE_API_URL + "details/json?placeid=" + item.place_id + "&language=en_US&key=" + this.key)
      .map(res => res.json());
  }

  public detail(item: any) {
    this.getDetails(item);
    this.locals = [];
  }
}