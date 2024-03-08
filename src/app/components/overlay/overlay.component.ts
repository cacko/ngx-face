import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChange, SimpleChanges } from '@angular/core';



interface ImageStyle {
  [key: string]: string
}

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


  ngOnChanges(changes: SimpleChanges): void {
    Object.entries(changes).forEach(([prop, ch]) => {
      switch (prop) {
        case "src":
          this.src = (ch as SimpleChange).currentValue;
          break;
      }
    })
  }

  getImageStyle(src: string) {
    return {
      "background-image": `url(${src})`
    }
  }

  @HostListener('click', ['$event'])
  onClick(ev: MouseEvent) {
    this.singleClick.emit(ev);
  }
}
