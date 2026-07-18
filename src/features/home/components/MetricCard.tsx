import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

type MetricCardProps = {
  label: string
  value: string | number
  description: string
  icon: LucideIcon
  className?: string
}

export function MetricCard({ label, value, description, icon: Icon, className }: MetricCardProps) {
  return (
    <Card className={cn('gap-0 py-0 shadow-sm', className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 truncate font-heading text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  )
}
