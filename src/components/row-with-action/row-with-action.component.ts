import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { ANGLE_IMG } from '../../app/constants';

@Component({
  selector: 'row-with-action',
  templateUrl: `./row-with-action.component.html`,
})

export class RowWithActionComponent {
  @Input() public itemClass: any = '';
  @Input() public itemLabel: string = '';
  @Input() public itemValue: string = '';
  @Output() public itemAction = new EventEmitter();

  public angleImg: string = ANGLE_IMG;

  public emitAction() {
    this.itemAction.next(this.itemValue);
  }
}
