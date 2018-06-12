import {
  Component,
  Input
} from '@angular/core';

@Component({
  selector: 'custom-progress-bar',
  templateUrl: `./custom-progress-bar.component.html`,
})

export class CustomProgressBarComponent {
  @Input() public itemValue: number = 0;
  @Input() public itemClass: string = '';
  @Input() public itemError: string = '';
}
