import { Pipe, PipeTransform } from '@angular/core';
import { startCase } from 'lodash-es';

@Pipe({
  name: 'startCase',
  standalone: true
})
export class StartCasePipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    return startCase(value) + (value.endsWith('*') ? '*' : '');
  }

}
