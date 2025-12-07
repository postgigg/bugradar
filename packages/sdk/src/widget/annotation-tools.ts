export interface Annotation {
  id: string;
  type: 'arrow' | 'rectangle' | 'text' | 'highlight';
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  text?: string;
  color: string;
}

export class AnnotationCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private annotations: Annotation[] = [];
  private currentTool: 'select' | 'arrow' | 'rectangle' | 'text' | null = null;
  private isDrawing = false;
  private startX = 0;
  private startY = 0;
  private currentAnnotation: Annotation | null = null;
  private screenshotImage: HTMLImageElement | null = null;
  private color = '#EF4444';
  private onUpdate: (annotations: Annotation[]) => void;
  private container: HTMLElement;
  private textInput: HTMLInputElement | null = null;

  constructor(
    container: HTMLElement,
    screenshotDataUrl: string,
    onUpdate: (annotations: Annotation[]) => void
  ) {
    this.container = container;
    this.onUpdate = onUpdate;

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      cursor: crosshair;
      z-index: 10;
    `;
    this.ctx = this.canvas.getContext('2d')!;

    // Load screenshot
    this.screenshotImage = new Image();
    this.screenshotImage.onload = () => {
      this.resize();
      this.render();
    };
    this.screenshotImage.src = screenshotDataUrl;

    container.style.position = 'relative';
    container.appendChild(this.canvas);

    this.bindEvents();
  }

  private resize(): void {
    if (!this.screenshotImage) return;

    const containerWidth = this.container.clientWidth;
    const aspectRatio = this.screenshotImage.height / this.screenshotImage.width;
    const height = containerWidth * aspectRatio;

    this.canvas.width = containerWidth;
    this.canvas.height = height;
    this.canvas.style.width = `${containerWidth}px`;
    this.canvas.style.height = `${height}px`;
  }

  setTool(tool: 'select' | 'arrow' | 'rectangle' | 'text' | null): void {
    this.currentTool = tool;
    this.canvas.style.cursor = tool ? 'crosshair' : 'default';

    // Remove any existing text input
    if (this.textInput) {
      this.textInput.remove();
      this.textInput = null;
    }
  }

  setColor(color: string): void {
    this.color = color;
  }

  private bindEvents(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    // Touch support
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private getCoords(e: MouseEvent | Touch): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private handleMouseDown(e: MouseEvent): void {
    if (!this.currentTool) return;

    const { x, y } = this.getCoords(e);
    this.startX = x;
    this.startY = y;

    if (this.currentTool === 'text') {
      this.createTextInput(x, y);
      return;
    }

    this.isDrawing = true;
    this.currentAnnotation = {
      id: `ann_${Date.now()}`,
      type: this.currentTool === 'select' ? 'highlight' : this.currentTool,
      startX: x,
      startY: y,
      color: this.color,
    };
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDrawing || !this.currentAnnotation) return;

    const { x, y } = this.getCoords(e);
    this.currentAnnotation.endX = x;
    this.currentAnnotation.endY = y;

    this.render();
    this.drawAnnotation(this.currentAnnotation, true);
  }

  private handleMouseUp(e: MouseEvent): void {
    if (!this.isDrawing || !this.currentAnnotation) return;

    const { x, y } = this.getCoords(e);
    this.currentAnnotation.endX = x;
    this.currentAnnotation.endY = y;

    // Only add if there's actual size
    const dx = Math.abs((this.currentAnnotation.endX || 0) - this.currentAnnotation.startX);
    const dy = Math.abs((this.currentAnnotation.endY || 0) - this.currentAnnotation.startY);

    if (dx > 5 || dy > 5) {
      this.annotations.push(this.currentAnnotation);
      this.onUpdate(this.annotations);
    }

    this.isDrawing = false;
    this.currentAnnotation = null;
    this.render();
  }

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    this.handleMouseUp({} as MouseEvent);
  }

  private createTextInput(x: number, y: number): void {
    if (this.textInput) {
      this.textInput.remove();
    }

    this.textInput = document.createElement('input');
    this.textInput.type = 'text';
    this.textInput.placeholder = 'Type and press Enter';
    this.textInput.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      min-width: 150px;
      padding: 6px 10px;
      border: 2px solid ${this.color};
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      background: white;
      color: #0f172a;
      z-index: 20;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    this.textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.textInput?.value) {
        const annotation: Annotation = {
          id: `ann_${Date.now()}`,
          type: 'text',
          startX: x,
          startY: y,
          text: this.textInput.value,
          color: this.color,
        };
        this.annotations.push(annotation);
        this.onUpdate(this.annotations);
        this.textInput?.remove();
        this.textInput = null;
        this.render();
      } else if (e.key === 'Escape') {
        this.textInput?.remove();
        this.textInput = null;
      }
    });

    this.container.appendChild(this.textInput);
    this.textInput.focus();
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all saved annotations
    this.annotations.forEach((ann) => this.drawAnnotation(ann, false));
  }

  private drawAnnotation(annotation: Annotation, isPreview: boolean): void {
    const { type, startX, startY, endX, endY, text, color } = annotation;

    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (isPreview) {
      this.ctx.setLineDash([5, 5]);
    } else {
      this.ctx.setLineDash([]);
    }

    switch (type) {
      case 'rectangle':
      case 'highlight':
        if (endX !== undefined && endY !== undefined) {
          const width = endX - startX;
          const height = endY - startY;

          // Semi-transparent fill for highlight
          if (type === 'highlight') {
            this.ctx.fillStyle = color + '20';
            this.ctx.fillRect(startX, startY, width, height);
          }

          this.ctx.strokeRect(startX, startY, width, height);
        }
        break;

      case 'arrow':
        if (endX !== undefined && endY !== undefined) {
          this.drawArrow(startX, startY, endX, endY);
        }
        break;

      case 'text':
        if (text) {
          // Draw text background
          this.ctx.font = '14px Inter, system-ui, sans-serif';
          const metrics = this.ctx.measureText(text);
          const padding = 6;
          const bgHeight = 24;

          this.ctx.fillStyle = color;
          this.ctx.beginPath();
          this.ctx.roundRect(
            startX - padding,
            startY - bgHeight + padding,
            metrics.width + padding * 2,
            bgHeight,
            4
          );
          this.ctx.fill();

          // Draw text
          this.ctx.fillStyle = 'white';
          this.ctx.fillText(text, startX, startY);
        }
        break;
    }
  }

  private drawArrow(fromX: number, fromY: number, toX: number, toY: number): void {
    const headLength = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Draw line
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();

    // Draw arrowhead
    this.ctx.beginPath();
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.stroke();
  }

  undo(): void {
    this.annotations.pop();
    this.onUpdate(this.annotations);
    this.render();
  }

  clear(): void {
    this.annotations = [];
    this.onUpdate(this.annotations);
    this.render();
  }

  getAnnotations(): Annotation[] {
    return this.annotations;
  }

  getAnnotatedScreenshot(): string {
    // Create a new canvas combining screenshot and annotations
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d')!;

    if (this.screenshotImage) {
      exportCanvas.width = this.screenshotImage.width;
      exportCanvas.height = this.screenshotImage.height;

      // Draw screenshot
      exportCtx.drawImage(this.screenshotImage, 0, 0);

      // Scale factor
      const scale = this.screenshotImage.width / this.canvas.width;

      // Draw annotations scaled up
      this.annotations.forEach((ann) => {
        exportCtx.strokeStyle = ann.color;
        exportCtx.fillStyle = ann.color;
        exportCtx.lineWidth = 3 * scale;
        exportCtx.lineCap = 'round';
        exportCtx.lineJoin = 'round';

        const startX = ann.startX * scale;
        const startY = ann.startY * scale;
        const endX = (ann.endX || 0) * scale;
        const endY = (ann.endY || 0) * scale;

        switch (ann.type) {
          case 'rectangle':
          case 'highlight':
            if (ann.type === 'highlight') {
              exportCtx.fillStyle = ann.color + '20';
              exportCtx.fillRect(startX, startY, endX - startX, endY - startY);
              exportCtx.fillStyle = ann.color;
            }
            exportCtx.strokeRect(startX, startY, endX - startX, endY - startY);
            break;

          case 'arrow':
            const headLength = 15 * scale;
            const angle = Math.atan2(endY - startY, endX - startX);

            exportCtx.beginPath();
            exportCtx.moveTo(startX, startY);
            exportCtx.lineTo(endX, endY);
            exportCtx.stroke();

            exportCtx.beginPath();
            exportCtx.moveTo(endX, endY);
            exportCtx.lineTo(
              endX - headLength * Math.cos(angle - Math.PI / 6),
              endY - headLength * Math.sin(angle - Math.PI / 6)
            );
            exportCtx.moveTo(endX, endY);
            exportCtx.lineTo(
              endX - headLength * Math.cos(angle + Math.PI / 6),
              endY - headLength * Math.sin(angle + Math.PI / 6)
            );
            exportCtx.stroke();
            break;

          case 'text':
            if (ann.text) {
              exportCtx.font = `${14 * scale}px Inter, system-ui, sans-serif`;
              const metrics = exportCtx.measureText(ann.text);
              const padding = 6 * scale;
              const bgHeight = 24 * scale;

              exportCtx.fillStyle = ann.color;
              exportCtx.beginPath();
              exportCtx.roundRect(
                startX - padding,
                startY - bgHeight + padding,
                metrics.width + padding * 2,
                bgHeight,
                4 * scale
              );
              exportCtx.fill();

              exportCtx.fillStyle = 'white';
              exportCtx.fillText(ann.text, startX, startY);
            }
            break;
        }
      });
    }

    return exportCanvas.toDataURL('image/jpeg', 0.9);
  }

  destroy(): void {
    this.canvas.remove();
    if (this.textInput) {
      this.textInput.remove();
    }
  }
}
