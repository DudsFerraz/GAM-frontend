import { Calendar, ChevronRight, Mail, User } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
} from '@/components/ui/Card'
import { cn } from '@/lib/utils'

import type { MemberListItem } from '../types'
import {
  getMemberStatusBadgeClassName,
  getMemberStatusLabel,
} from '../presentation'

function calculateAge(birthDate: string | null): string {
  if (!birthDate) {
    return 'Não informado'
  }

  const [year, month, day] = birthDate.split('-').map(Number)
  if (!year || !month || !day) {
    return 'Não informado'
  }

  const today = new Date()
  let age = today.getFullYear() - year
  const hasNotHadBirthday =
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)

  if (hasNotHadBirthday) {
    age -= 1
  }

  return `${age} anos`
}

interface MemberCardProps {
  member: MemberListItem
  onClick: (member: MemberListItem) => void
  className?: string
}

export function MemberCard({ member, onClick, className }: MemberCardProps) {
  const fullName = [member.firstName, member.surname].filter(Boolean).join(' ')
  const statusLabel = getMemberStatusLabel(member.status)

  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden border-border bg-card',
        className,
      )}
      interactive
    >
      <CardActionArea
        aria-label={`Ver detalhes de ${fullName}`}
        onClick={() => onClick(member)}
      />
      <CardHeader className="pointer-events-none relative z-[1] flex flex-row items-center gap-4 space-y-0 pb-2">
        <Avatar className="h-12 w-12 border-2 border-border">
          <AvatarFallback className="bg-primary/10 text-primary">
            <User aria-hidden="true" size={20} />
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <h3 className="truncate font-semibold text-foreground" title={fullName}>
            {fullName}
          </h3>
          <p className="truncate text-xs text-muted-foreground" title={member.displayName}>
            {member.displayName}
          </p>
        </div>
        <ChevronRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
        />
      </CardHeader>
      <CardContent className="pointer-events-none relative z-[1] flex-1 pb-2">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar aria-hidden="true" className="text-primary/70" size={14} />
            <span>{calculateAge(member.birthDate)}</span>
          </div>
          {member.email && (
            <div className="flex items-center gap-2 truncate">
              <Mail aria-hidden="true" className="shrink-0 text-primary/70" size={14} />
              <span className="truncate" title={member.email}>
                {member.email}
              </span>
            </div>
          )}
          <Badge
            className={cn(
              'pointer-events-none mt-1 font-normal',
              getMemberStatusBadgeClassName(member.status),
            )}
            variant={member.status === 'INACTIVE' ? 'destructive' : 'secondary'}
          >
            {statusLabel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
