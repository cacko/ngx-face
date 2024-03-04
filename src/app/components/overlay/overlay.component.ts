import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChange, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss'
})
export class OverlayComponent implements OnChanges {

  @Input() src !: string;
  @Output() singleClick = new EventEmitter<MouseEvent>();

  constructor(
    private elementRef: ElementRef
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    Object.entries(changes).forEach(([prop, ch]) => {
      switch (prop) {
        case "src":
          this.setBackground((ch as SimpleChange).currentValue);
          break;
      }
      console.log(prop);
    })


  }

  private setBackground(src: string) {
    this.elementRef.nativeElement.style.backgroundImage = `url(${src})`;
  }

  @HostListener('click', ['$event'])
  onClick(ev: MouseEvent) {
    this.singleClick.emit(ev);
  }
}
