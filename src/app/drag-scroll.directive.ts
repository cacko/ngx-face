import { CommonModule, DOCUMENT } from "@angular/common";
import {
  AfterViewInit,
  ContentChild,
  Directive,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  SimpleChanges,
} from "@angular/core";
import { fromEvent, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Directive({
  selector: '[appDragScroll]',
  standalone: true
})
export class DragScrollDirective implements AfterViewInit, OnDestroy {

  private element !: HTMLElement;
  private subscriptions: Subscription[] = [];
  private disableDrag = false;

  private readonly DEFAULT_DRAGGING_BOUNDARY_QUERY = "body";
  @Input() boundaryQuery = this.DEFAULT_DRAGGING_BOUNDARY_QUERY;

  constructor(
    @Inject(ElementRef) private elementRef: ElementRef,
    @Inject(Renderer2) private renderer: Renderer2,
    @Inject(DOCUMENT) private document: any
  ) { }

  ngAfterViewInit(): void {
    this.element = this.elementRef.nativeElement as HTMLElement;
    console.log(this.elementRef);
    this.initDrag();
  }

  @Input() set reset(realSize: number | null) {
    if (!this.element) {
      return;
    }
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
      currentX = this.element.scrollLeft,
      currentY = this.element.scrollTop;

    let dragSub !: Subscription;

    const getClientX = (event: MouseEvent|TouchEvent) => {
      if (event instanceof TouchEvent) {
        return event.touches[0].clientX;
      }
      return event.clientX;
    }

    const getClientY = (event: MouseEvent|TouchEvent) => {
      if (event instanceof TouchEvent) {
        return event.touches[0].clientY;
      }
      return event.clientY;
    }

    const dragStartSub = dragStart$.subscribe((event: MouseEvent|TouchEvent) => {

      initialX = getClientX(event) - currentX;
      initialY = getClientY(event) - currentY;
      this.element.classList.add("dragging");
 
      dragSub = drag$.subscribe((event: any) => {

        if (this.element.hasAttribute("real-size")) {
          return;
        }
        const x = getClientX(event);
        const y = getClientY(event);
        // console.log(x, y);

        // currentX = Math.min(0, Math.max(x, (this.element.clientWidth - this.element.clientHeight * 2)));
        // currentY = Math.min(0, Math.max(y, -this.element.clientHeight));

        this.element.scroll(x, y);

      });
    });

    const dragEndSub = dragEnd$.subscribe(() => {
      initialX = currentX;
      initialY = currentY;
      this.element.classList.remove("dragging");
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
