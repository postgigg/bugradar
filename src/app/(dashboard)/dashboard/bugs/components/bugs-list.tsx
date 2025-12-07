'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import {
  Search, Filter, LayoutGrid, List,
  Bug, X, GripVertical, Plus, MoreHorizontal,
  AlertTriangle, Clock, User, ExternalLink, Image as ImageIcon,
  Loader2, Terminal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { priorityColors, statusColors } from '@/lib/brand'

interface Bug {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  source: string
  created_at: string
  page_url: string | null
  browser_name: string | null
  screenshot_url: string | null
  claude_fixing?: boolean
  claude_fix_started_at?: string
  projects: { id: string; name: string } | null
  users: { id: string; full_name: string; email: string; avatar_url: string | null } | null
}

interface Project {
  id: string
  name: string
}

interface BugsListProps {
  initialBugs: Bug[]
  projects: Project[]
}

type ViewMode = 'kanban' | 'list'
type StatusFilter = 'all' | 'new' | 'open' | 'in_progress' | 'resolved' | 'closed'
type PriorityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low'

const KANBAN_COLUMNS = [
  { id: 'new', title: 'New', icon: '🆕', color: 'bg-coral-500' },
  { id: 'open', title: 'Open', icon: '📂', color: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', icon: '🔧', color: 'bg-amber-500' },
  { id: 'resolved', title: 'Resolved', icon: '✅', color: 'bg-green-500' },
  { id: 'closed', title: 'Closed', icon: '📦', color: 'bg-slate-500' },
]

export function BugsList({ initialBugs, projects }: BugsListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [bugs, setBugs] = useState(initialBugs)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [draggingBug, setDraggingBug] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  // Filter bugs
  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!bug.title.toLowerCase().includes(query) &&
            !bug.description?.toLowerCase().includes(query)) {
          return false
        }
      }
      if (statusFilter !== 'all' && bug.status !== statusFilter) return false
      if (priorityFilter !== 'all' && bug.priority !== priorityFilter) return false
      if (projectFilter !== 'all' && bug.projects?.id !== projectFilter) return false
      return true
    })
  }, [bugs, searchQuery, statusFilter, priorityFilter, projectFilter])

  // Group bugs by status for kanban
  const bugsByStatus = useMemo(() => {
    const grouped: Record<string, Bug[]> = {}
    KANBAN_COLUMNS.forEach(col => { grouped[col.id] = [] })
    filteredBugs.forEach(bug => {
      if (grouped[bug.status]) grouped[bug.status].push(bug)
    })
    return grouped
  }, [filteredBugs])

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all'

  const clearFilters = () => {
    setStatusFilter('all')
    setPriorityFilter('all')
    setProjectFilter('all')
    setSearchQuery('')
  }

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, bugId: string) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', bugId)
    setDraggingBug(bugId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const bugId = e.dataTransfer.getData('text/plain')
    setDragOverColumn(null)
    setDraggingBug(null)

    const bug = bugs.find(b => b.id === bugId)
    if (!bug || bug.status === newStatus) return

    // Optimistic update
    setBugs(prev => prev.map(b => b.id === bugId ? { ...b, status: newStatus } : b))

    // Update in database
    const { error } = await supabase
      .from('bugs')
      .update({ status: newStatus })
      .eq('id', bugId)

    if (error) {
      // Revert on error
      setBugs(prev => prev.map(b => b.id === bugId ? { ...b, status: bug.status } : b))
    }
  }, [bugs, supabase])

  const handleDragEnd = useCallback(() => {
    setDraggingBug(null)
    setDragOverColumn(null)
  }, [])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'secondary' : 'ghost'}
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-coral-500 rounded-full" />
            )}
          </Button>

          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-slate-50 dark:bg-slate-800/50">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              )}
            >
              <LayoutGrid className="w-4 h-4 inline mr-1.5" />
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              )}
            >
              <List className="w-4 h-4 inline mr-1.5" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4 animate-fade-in bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="block w-40 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                className="block w-40 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Project</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="block w-48 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
                <X className="w-4 h-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Stats Bar */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">{filteredBugs.length}</span> actions
        </span>
        <div className="flex items-center gap-4">
          {KANBAN_COLUMNS.slice(0, 4).map(col => (
            <span key={col.id} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className={cn('w-2 h-2 rounded-full', col.color)} />
              {bugsByStatus[col.id]?.length || 0}
            </span>
          ))}
        </div>
      </div>

      {/* Kanban or List */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          columns={KANBAN_COLUMNS}
          bugsByStatus={bugsByStatus}
          draggingBug={draggingBug}
          dragOverColumn={dragOverColumn}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />
      ) : (
        <ListView bugs={filteredBugs} />
      )}
    </div>
  )
}

// Kanban Board Component
interface KanbanBoardProps {
  columns: typeof KANBAN_COLUMNS
  bugsByStatus: Record<string, Bug[]>
  draggingBug: string | null
  dragOverColumn: string | null
  onDragStart: (e: React.DragEvent, bugId: string) => void
  onDragOver: (e: React.DragEvent, columnId: string) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, columnId: string) => void
  onDragEnd: () => void
}

function KanbanBoard({
  columns, bugsByStatus, draggingBug, dragOverColumn,
  onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd
}: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
      {columns.map(column => (
        <div
          key={column.id}
          className={cn(
            'flex-shrink-0 w-72 flex flex-col rounded-xl transition-all duration-200',
            dragOverColumn === column.id && 'ring-2 ring-coral-500 ring-offset-2'
          )}
          onDragOver={(e) => onDragOver(e, column.id)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className={cn('w-3 h-3 rounded-full', column.color)} />
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                {column.title}
              </h3>
              <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                {bugsByStatus[column.id]?.length || 0}
              </span>
            </div>
            <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Cards Container */}
          <div className={cn(
            'flex-1 space-y-6 min-h-[400px] p-2 rounded-lg transition-colors',
            dragOverColumn === column.id
              ? 'bg-coral-50 dark:bg-coral-900/20 border-2 border-dashed border-coral-300 dark:border-coral-700'
              : 'bg-slate-100/50 dark:bg-slate-800/30'
          )}>
            {bugsByStatus[column.id]?.map(bug => (
              <KanbanCard
                key={bug.id}
                bug={bug}
                isDragging={draggingBug === bug.id}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))}

            {bugsByStatus[column.id]?.length === 0 && (
              <div className={cn(
                'flex flex-col items-center justify-center h-32 text-slate-400 dark:text-slate-500',
                dragOverColumn === column.id && 'text-coral-500'
              )}>
                <Bug className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs">
                  {dragOverColumn === column.id ? 'Drop here' : 'No actions'}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Kanban Card
interface KanbanCardProps {
  bug: Bug
  isDragging: boolean
  onDragStart: (e: React.DragEvent, bugId: string) => void
  onDragEnd: () => void
}

function KanbanCard({ bug, isDragging, onDragStart, onDragEnd }: KanbanCardProps) {
  const priority = priorityColors[bug.priority as keyof typeof priorityColors] || priorityColors.medium
  const isClaudeFixing = bug.claude_fixing && bug.status === 'in_progress'

  return (
    <Link href={`/dashboard/bugs/${bug.id}`}>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, bug.id)}
        onDragEnd={onDragEnd}
        className={cn(
          'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700',
          'p-3 cursor-grab active:cursor-grabbing transition-all duration-200',
          'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 group relative',
          isDragging && 'opacity-50 shadow-lg scale-105 rotate-2',
          isClaudeFixing && 'ring-2 ring-coral-500 ring-offset-1 border-coral-300 dark:border-coral-700'
        )}
      >
        {/* Claude Fixing Indicator */}
        {isClaudeFixing && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="flex items-center gap-1 px-2 py-1 bg-coral-500 text-white text-[10px] font-medium rounded-full shadow-lg animate-pulse">
              <Terminal className="w-3 h-3" />
              <span>Claude fixing</span>
            </div>
          </div>
        )}

        {/* Priority & Screenshot */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', priority.bg, priority.text)}>
            {bug.priority}
          </span>
          <div className="flex items-center gap-1">
            {isClaudeFixing && (
              <Loader2 className="w-3.5 h-3.5 text-coral-500 animate-spin" />
            )}
            {bug.screenshot_url && (
              <span className="text-slate-400">
                <ImageIcon className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="font-medium text-slate-900 dark:text-white text-sm leading-snug mb-2 line-clamp-2 group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors">
          {bug.title}
        </h4>

        {/* Description preview */}
        {bug.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {bug.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {bug.projects && (
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                {bug.projects.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(bug.created_at)}
            </span>
            {bug.users && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center text-white text-xs font-medium">
                {bug.users.full_name?.charAt(0) || bug.users.email.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Drag indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        </div>
      </div>
    </Link>
  )
}

// List View Component
function ListView({ bugs }: { bugs: Bug[] }) {
  if (bugs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Bug className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400">No actions found</p>
        <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your filters</p>
      </Card>
    )
  }

  return (
    <Card className="divide-y divide-slate-200 dark:divide-slate-700 overflow-hidden">
      {bugs.map((bug) => {
        const priority = priorityColors[bug.priority as keyof typeof priorityColors] || priorityColors.medium
        const status = statusColors[bug.status as keyof typeof statusColors] || statusColors.open

        const isClaudeFixing = bug.claude_fixing && bug.status === 'in_progress'

        return (
          <Link
            key={bug.id}
            href={`/dashboard/bugs/${bug.id}`}
            className={cn(
              "flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group relative",
              isClaudeFixing && "bg-coral-50 dark:bg-coral-900/10"
            )}
          >
            {/* Claude fixing indicator */}
            {isClaudeFixing && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-coral-500 animate-pulse" />
            )}

            <div className={cn('w-2 h-2 rounded-full flex-shrink-0', priority.dot)} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <p className="font-medium text-slate-900 dark:text-white group-hover:text-coral-600 dark:group-hover:text-coral-400 truncate">
                  {bug.title}
                </p>
                {isClaudeFixing && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 rounded-full text-xs font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Claude fixing
                  </span>
                )}
                {bug.screenshot_url && (
                  <ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </div>
              {bug.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {bug.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={cn('text-xs px-2 py-0.5 rounded-full', status.bg, status.text)}>
                {bug.status.replace('_', ' ')}
              </span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', priority.bg, priority.text)}>
                {bug.priority}
              </span>
            </div>

            <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 w-20 text-right">
              {formatRelativeTime(bug.created_at)}
            </span>

            {bug.users && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-white">
                  {bug.users.full_name?.charAt(0) || bug.users.email.charAt(0)}
                </span>
              </div>
            )}
          </Link>
        )
      })}
    </Card>
  )
}
