import { CommonModule, DOCUMENT } from "@angular/common";
import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  Renderer2,
} from "@angular/core";
import { fromEvent, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Directive({
  selector: '[appDragScroll]',
  standalone: true
})
export class DragScrollDirective implements AfterViewInit, OnDestroy {

  private element !: HTMLImageElement;
  private subscriptions: Subscription[] = [];

  private readonly DEFAULT_DRAGGING_BOUNDARY_QUERY = "body";
  @Input() boundaryQuery = this.DEFAULT_DRAGGING_BOUNDARY_QUERY;

  constructor(
    @Inject(ElementRef) private elementRef: ElementRef,
    @Inject(Renderer2) private renderer: Renderer2,
    @Inject(DOCUMENT) private document: any
  ) { }

  ngAfterViewInit(): void {
    this.element = this.elementRef.nativeElement as HTMLImageElement;
  }

  @HostListener('window:resize')
  onResize() {
    this.ngOnDestroy();
    this.initDrag();
  }


  @HostListener('load')
  onLoad() {
    this.initDrag();
  }

  @Input() set reset(realSize: boolean) {
    if (!this.element) {
      return;
    }
    realSize && this.renderer.setStyle(this.element, "object-position", "center center");
  }

  initDrag(): void {
    const touchSupported = 'ontouchstart' in window;
    const dragStart$ = fromEvent<any>(this.element, touchSupported ? "touchstart" : "mousedown", { passive: true });
    const dragEnd$ = fromEvent<any>(this.document, touchSupported ? "touchend" : "mouseup", { passive: true });
    const drag$ = fromEvent<any>(this.document, touchSupported ? "touchmove" : "mousemove", { passive: true }).pipe(
      takeUntil(dragEnd$)
    );


    let initialX: number,
      initialY: number,
      aspectRatio = this.element.naturalWidth / this.element.naturalHeight,
      clientRatio = this.element.clientWidth / this.element.clientHeight,
      isScrollX = aspectRatio > clientRatio,
      isScrollY = aspectRatio < clientRatio,
      currentX = -(this.element.clientHeight * aspectRatio - this.element.clientWidth) / 2,
      currentY = -(this.element.clientWidth / aspectRatio - this.element.clientHeight) / 2;


    const maxX = currentX * 2,
      maxY = currentY * 2,
      parent = this.element.parentElement;

    let dragSub !: Subscription;

    const getClientX = (event: any) => {
      if (event instanceof MouseEvent) {
        return event.clientX;
      }
      return event.touches[0].clientX;
    }

    const getClientY = (event: any) => {
      if (event instanceof MouseEvent) {
        return event.clientY;

      }
      return event.touches[0].clientY;

    }

    const dragStartSub = dragStart$.subscribe((event: MouseEvent) => {

      initialX = getClientX(event) - currentX;
      initialY = getClientY(event) - currentY;

      this.renderer.addClass(this.element, "dragging");

      dragSub = drag$.subscribe((event: any) => {

        if (parent?.hasAttribute("real-size") || !parent?.hasAttribute("show")) {
          return;
        }

        if (isScrollX) {
          const x = Math.min(0, Math.max(getClientX(event) - initialX, maxX));
          return this.renderer.setStyle(this.element, "object-position", `${x}px center`);
        }

        if (isScrollY) {
          const y = Math.min(0, Math.max(getClientY(event) - initialY, maxY));
          return this.renderer.setStyle(this.element, "object-position", `center ${y}px`);
        }
        return;
      });
    });

    const dragEndSub = dragEnd$.subscribe(() => {
      initialX = currentX;
      initialY = currentY;
      this.renderer.removeClass(this.element, "dragging");
      if (dragSub) {
        dragSub.unsubscribe();
      }
    });

    this.subscriptions.push.apply(this.subscriptions, [
      dragStartSub,
      dragSub,
      dragEndSub,
    ]);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s?.unsubscribe());
  }


}
