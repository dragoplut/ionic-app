import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'custom-input',
  templateUrl: `./custom-input.component.html`,
})

export class CustomInputComponent {
  @Input() public itemClass: any = '';
  @Input() public itemLabel: string = '';
  @Input() public itemError: string = '';
  @Input() public itemValue: string = '';
  @Input() public itemType: string = '';
  @Input() public itemDisabled: boolean = true;
  @Output() public itemChange = new EventEmitter();

  public valueChange() {
    this.itemChange.next(this.itemValue ? this.itemValue.trim() : this.itemValue);
  }
}
