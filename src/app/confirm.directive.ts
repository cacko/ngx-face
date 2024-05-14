import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from './components/dialog-confirm/dialog-confirm.component';

@Directive({
  selector: '[appConfirm]',
  standalone: true
})
export class ConfirmDirective {

  @Input() confirmTitle = "Delete?";
  @Input() confirmContent = "Are you sure?";

  @Output() confirm = new EventEmitter<boolean>();

  constructor(
    private dialog: MatDialog
  ) { }


  @HostListener('click', ['$event'])
  onClick($event: any) {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: this.confirmTitle,
        content: this.confirmContent
      }
    });
    dialogRef.afterClosed().subscribe((res) => {
      res && this.confirm.emit(res);
    });
  }

}
