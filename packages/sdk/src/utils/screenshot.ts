export async function captureScreenshot(): Promise<string | null> {
  try {
    // Dynamically import html2canvas to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default;

    const canvas = await html2canvas(document.body, {
      logging: false,
      useCORS: true,
      allowTaint: true,
      scale: window.devicePixelRatio || 1,
      width: window.innerWidth,
      height: window.innerHeight,
      x: window.scrollX,
      y: window.scrollY,
      ignoreElements: (element) => {
        // Ignore BugRadar widget elements
        return element.id === 'bugradar-widget' ||
               element.classList.contains('bugradar-ignore');
      },
    });

    // Convert to base64 with reduced quality for smaller payload
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.warn('[BugRadar] Screenshot capture failed:', error);
    return null;
  }
}

export function drawAnnotations(
  canvas: HTMLCanvasElement,
  annotations: Array<{
    boundingBox: DOMRect;
    type: 'highlight' | 'arrow' | 'text';
    color: string;
    note?: string;
  }>
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const scale = window.devicePixelRatio || 1;

  annotations.forEach((annotation) => {
    const { boundingBox, type, color } = annotation;
    const x = (boundingBox.x - window.scrollX) * scale;
    const y = (boundingBox.y - window.scrollY) * scale;
    const width = boundingBox.width * scale;
    const height = boundingBox.height * scale;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3 * scale;

    if (type === 'highlight') {
      // Draw highlight rectangle
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, width, height);

      // Semi-transparent fill
      ctx.fillStyle = color + '20';
      ctx.fillRect(x, y, width, height);
    } else if (type === 'arrow') {
      // Draw arrow pointing to center
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const arrowLength = 50 * scale;

      ctx.beginPath();
      ctx.moveTo(centerX - arrowLength, centerY - arrowLength);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      // Arrow head
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX - 10 * scale, centerY - 15 * scale);
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX - 15 * scale, centerY - 10 * scale);
      ctx.stroke();
    }

    // Draw note if present
    if (annotation.note) {
      ctx.font = `${14 * scale}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = color;
      ctx.fillText(annotation.note, x, y - 5 * scale);
    }
  });
}
