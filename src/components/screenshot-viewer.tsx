'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, ZoomIn, ZoomOut, Move, Pencil, Square, ArrowRight, Type, Undo, Download, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Annotation {
  id: string
  type: 'arrow' | 'rectangle' | 'text' | 'draw'
  points: { x: number; y: number }[]
  color: string
  text?: string
}

interface ScreenshotViewerProps {
  src: string
  alt?: string
  className?: string
}

export function ScreenshotViewer({ src, alt = 'Screenshot', className }: ScreenshotViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [tool, setTool] = useState<'pan' | 'arrow' | 'rectangle' | 'text' | 'draw' | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [currentColor, setCurrentColor] = useState('#ef4444')
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']

  const tools = [
    { id: 'pan', icon: Move, label: 'Pan' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'draw', icon: Pencil, label: 'Draw' },
    { id: 'text', icon: Type, label: 'Text' },
  ]

  useEffect(() => {
    if (isOpen && canvasRef.current && imgRef.current) {
      const canvas = canvasRef.current
      const img = imgRef.current

      const setupCanvas = () => {
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height
        redrawCanvas()
      }

      if (img.complete) {
        setupCanvas()
      } else {
        img.onload = setupCanvas
      }
    }
  }, [isOpen, annotations])

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    annotations.forEach(ann => {
      ctx.strokeStyle = ann.color
      ctx.fillStyle = ann.color
      ctx.lineWidth = 3
      ctx.lineCap = 'round'

      switch (ann.type) {
        case 'arrow':
          if (ann.points.length >= 2) {
            const [start, end] = ann.points
            ctx.beginPath()
            ctx.moveTo(start.x, start.y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()
            // Arrow head
            const angle = Math.atan2(end.y - start.y, end.x - start.x)
            const len = 15
            ctx.beginPath()
            ctx.moveTo(end.x, end.y)
            ctx.lineTo(end.x - len * Math.cos(angle - Math.PI / 6), end.y - len * Math.sin(angle - Math.PI / 6))
            ctx.moveTo(end.x, end.y)
            ctx.lineTo(end.x - len * Math.cos(angle + Math.PI / 6), end.y - len * Math.sin(angle + Math.PI / 6))
            ctx.stroke()
          }
          break
        case 'rectangle':
          if (ann.points.length >= 2) {
            const [p1, p2] = ann.points
            ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)
          }
          break
        case 'text':
          if (ann.text && ann.points.length > 0) {
            ctx.font = 'bold 18px sans-serif'
            ctx.fillText(ann.text, ann.points[0].x, ann.points[0].y)
          }
          break
        case 'draw':
          if (ann.points.length > 1) {
            ctx.beginPath()
            ctx.moveTo(ann.points[0].x, ann.points[0].y)
            ann.points.forEach(p => ctx.lineTo(p.x, p.y))
            ctx.stroke()
          }
          break
      }
    })
  }

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tool || tool === 'pan') return
    const coords = getCanvasCoords(e)

    if (tool === 'text') {
      const text = prompt('Enter text:')
      if (text) {
        setAnnotations([...annotations, {
          id: `a_${Date.now()}`,
          type: 'text',
          points: [coords],
          color: currentColor,
          text
        }])
      }
      return
    }

    setIsDrawing(true)
    setDrawStart(coords)

    if (tool === 'draw') {
      setAnnotations([...annotations, {
        id: `a_${Date.now()}`,
        type: 'draw',
        points: [coords],
        color: currentColor
      }])
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !tool) return
    const coords = getCanvasCoords(e)

    if (tool === 'draw') {
      setAnnotations(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.type === 'draw') {
          last.points.push(coords)
        }
        return updated
      })
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !tool || tool === 'pan') return
    const coords = getCanvasCoords(e)

    if (tool === 'arrow' || tool === 'rectangle') {
      setAnnotations([...annotations, {
        id: `a_${Date.now()}`,
        type: tool,
        points: [drawStart, coords],
        color: currentColor
      }])
    }

    setIsDrawing(false)
  }

  const handleUndo = () => {
    setAnnotations(prev => prev.slice(0, -1))
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return

    // Create a new canvas with the image and annotations
    const exportCanvas = document.createElement('canvas')
    const ctx = exportCanvas.getContext('2d')!
    exportCanvas.width = img.naturalWidth || img.width
    exportCanvas.height = img.naturalHeight || img.height

    // Draw original image
    ctx.drawImage(img, 0, 0)
    // Draw annotations on top
    ctx.drawImage(canvas, 0, 0)

    const link = document.createElement('a')
    link.download = 'annotated-screenshot.png'
    link.href = exportCanvas.toDataURL('image/png')
    link.click()
  }

  return (
    <>
      {/* Thumbnail */}
      <div
        className={cn(
          "relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-pointer group",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          className="w-full h-auto transition-transform group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
            <Maximize2 className="w-4 h-4" />
            <span className="text-sm font-medium">Click to view & annotate</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium">Screenshot Viewer</h3>
              <span className="text-xs text-slate-400">Click and drag to annotate</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="text-white hover:bg-slate-700">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-400 w-16 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="text-white hover:bg-slate-700">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-slate-700 mx-2" />
              <Button variant="ghost" size="sm" onClick={handleUndo} disabled={annotations.length === 0} className="text-white hover:bg-slate-700">
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} className="text-white hover:bg-slate-700">
                <Download className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-slate-700 mx-2" />
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-slate-700">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
            {/* Tools */}
            <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
              {tools.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTool(tool === t.id ? null : t.id as any)}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    tool === t.id ? "bg-coral-500 text-white" : "text-slate-300 hover:bg-slate-600"
                  )}
                  title={t.label}
                >
                  <t.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            <div className="w-px h-8 bg-slate-600" />

            {/* Colors */}
            <div className="flex items-center gap-1">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setCurrentColor(c)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform",
                    currentColor === c ? "border-white scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Image Container */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto flex items-center justify-center p-8"
            style={{ cursor: tool === 'pan' ? 'grab' : tool ? 'crosshair' : 'default' }}
          >
            <div
              className="relative"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
            >
              <img
                ref={imgRef}
                src={src}
                alt={alt}
                className="max-w-none"
                draggable={false}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => setIsDrawing(false)}
              />
            </div>
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 bg-slate-900 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-500">
              Select a tool above, then click and drag on the image to annotate. Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">Esc</kbd> to close.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
