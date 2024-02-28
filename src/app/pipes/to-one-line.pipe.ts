import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toOneLine',
  standalone: true
})
export class ToOneLinePipe implements PipeTransform {

  transform(value: string|number, ...args: unknown[]): string {
    return `${value}`.trim().split("\n").join(" ").trim();
  }

}
