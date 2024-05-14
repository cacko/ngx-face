import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from './components/dialog-confirm/dialog-confirm.component';

@Directive({
  selector: '[appConfirm]',
  standalone: true
})
export class ConfirmDirective {


  @Output() confirm = new EventEmitter<boolean>();

  constructor(
    private dialog: MatDialog
  ) { }


  @HostListener('click', ['$event'])
  onClick($event: any) {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: "Delete?",
        content: "Are you sure?"
      }
    });
    dialogRef.afterClosed().subscribe((res) => {
      res && this.confirm.emit(res);
    });
  }

}
