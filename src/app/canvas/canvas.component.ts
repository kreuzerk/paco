import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {fromEvent, pairwise, switchMap, takeUntil} from "rxjs";

@Component({
  selector: 'app-canvas',
  template: `
    <canvas #canvas width="280px" height="280px"></canvas>
  `,
  styles: [`
    canvas {
      border: 1px solid black;
    }
  `]
})
export class CanvasComponent implements AfterViewInit {

  @ViewChild('canvas') canvas: ElementRef | undefined;
  cx;

  constructor() {
  }

  ngAfterViewInit(): void {
    this.cx = this.canvas?.nativeElement.getContext("2d");
    this.cx.fillStyle = "white";
    this.cx.fillRect(0, 0, 280, 280);
    this.captureEvents(this.canvas?.nativeElement);
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => fromEvent(canvasEl, 'mousemove')
            .pipe(
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              pairwise()
            )
        )
      )
      .subscribe((res: any) => {
        const rect = canvasEl.getBoundingClientRect();

        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };

        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };
        this.drawOnCanvas(prevPos, currentPos);
      });
  }

  private drawOnCanvas(
    prevPos: { x: number, y: number },
    currentPos: { x: number, y: number }
  ) {
    if (!this.cx) { return; }

    this.cx.beginPath();
    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();
    }
  }
}
