import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output, Renderer2, SimpleChange, SimpleChanges } from '@angular/core';
import { DragScrollDirective } from '../../drag-scroll.directive';
import { ScreenFit } from '../../entity/view.entity';
import { BehaviorSubject } from 'rxjs';



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
  templateUrl: './overlay.component.html'
})
export class OverlayComponent implements OnChanges {

  private resetSubject = new BehaviorSubject<boolean>(false);
  public $reset = this.resetSubject.asObservable();

  @Input() src !: string;
  @Input() drag = false;
  @Output() doubleClick = new EventEmitter<MouseEvent>();
  @Input() set screenFit(mode: ScreenFit) {
    switch (mode) {
      case ScreenFit.FIT_SCREEN:
        this.renderer.setAttribute(this.el.nativeElement, "real-size", "");
        this.resetSubject.next(true);
        break;
      default:
        this.renderer.removeAttribute(this.el.nativeElement, "real-size");
        this.resetSubject.next(false);
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
          this.renderer.setStyle(this.el.nativeElement, "background-image", `url(${this.src})`)
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
