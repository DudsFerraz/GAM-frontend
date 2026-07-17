import type { KeyboardEvent } from 'react'
import { Calendar, Mail, User } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

import type { MemberListItem } from '../types'
import { getMemberStatusLabel } from '../presentation'

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

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    onClick(member)
  }

  return (
    <Card
      aria-label={`Ver detalhes de ${fullName}`}
      className={cn(
        'group relative flex h-full cursor-pointer flex-col overflow-hidden border-border bg-card transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      onClick={() => onClick(member)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <Avatar className="h-12 w-12 border-2 border-border">
          <AvatarFallback className="bg-primary/10 text-primary">
            <User size={20} />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <h3 className="truncate font-semibold text-foreground" title={fullName}>
            {fullName}
          </h3>
          <p className="truncate text-xs text-muted-foreground" title={member.displayName}>
            {member.displayName}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
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
              member.status === 'ACTIVE' &&
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
              member.status === 'INACTIVE' &&
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            )}
            variant={member.status === 'INACTIVE' ? 'destructive' : 'secondary'}
          >
            {statusLabel}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="mt-auto pb-4 pt-0">
        <span className="mt-2 w-full rounded-md px-3 py-2 text-center text-xs font-medium text-primary transition-colors group-hover:bg-primary/5">
          Ver detalhes
        </span>
      </CardFooter>
    </Card>
  )
}
