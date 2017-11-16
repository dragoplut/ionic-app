import { Component, Input } from '@angular/core';

@Component({
  selector: 'row-with-info',
  templateUrl: `./row-with-info.component.html`,
})

export class RowWithInfoComponent {
  @Input() public itemClass: any = '';
  @Input() public itemLabel: string = '';
  @Input() public itemValue: string = '';
}
