import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output, Renderer2, SimpleChange, SimpleChanges } from '@angular/core';
import { DragScrollDirective } from '../../drag-scroll.directive';
import { ScreenFit } from '../../entity/view.entity';



interface ImageStyle {
  [key: string]: string
}

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    DragScrollDirective
  ],
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss'
})
export class OverlayComponent implements OnChanges {

  public reset = false;

  @Input() src !: string;
  @Input() drag = false;
  @Output() doubleClick = new EventEmitter<MouseEvent>();
  @Input() set screenFit(mode: ScreenFit) {
    switch(mode) {
      case ScreenFit.FIT_SCREEN:
        this.renderer.setAttribute(this.el.nativeElement, "real-size", "");
        this.reset = true;
        break;
      default:
        this.renderer.removeAttribute(this.el.nativeElement, "real-size");
    }
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    Object.entries(changes).forEach(([prop, ch]) => {
      switch (prop) {
        case "src":
          this.src = (ch as SimpleChange).currentValue;
          break;          
      }
    })
  }

  @HostListener('dblclick', ['$event'])
  onDblClick($event: any) {
    $event.stopPropagation();
    this.doubleClick.emit($event);
  }

}
