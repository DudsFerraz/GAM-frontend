import { User, Calendar, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { getMainRoleLabel } from '@/features/account';
import type { MemberResponse } from '../types';

const calculateAge = (birthDateString: string) => {
  if (!birthDateString) return 'N/A';
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

interface MemberCardProps {
  member: MemberResponse;
  onClick: (member: MemberResponse) => void;
  className?: string;
}

export const MemberCard = ({ member, onClick, className }: MemberCardProps) => {
  const memberPicture = (member as { picture?: string }).picture;

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow border-border bg-card group relative overflow-hidden h-full flex flex-col", 
        className
      )}
      onClick={() => onClick(member)}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2 space-y-0">
        <Avatar className="h-12 w-12 border-2 border-border">
          <AvatarImage src={memberPicture} alt={member.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            <User size={20} />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col overflow-hidden">
          <h3 className="font-semibold text-foreground truncate" title={member.account.displayName}>
            {member.account.displayName}
          </h3>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
             <Briefcase size={12} />
             {getMainRoleLabel(member.account.roles.roles)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 flex-1">
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
             <Calendar size={14} className="text-primary/70" />
             <span>{calculateAge(member.birthDate)} anos</span>
          </div>
          
           {/* Status Badge */}
           <div className="mt-2">
              <Badge variant={
                  member.status === 'ACTIVE' ? 'default' : 
                  member.status === 'INACTIVE' ? 'destructive' : 'secondary'
              } className={cn(
                  "font-normal pointer-events-none",
                  member.status === 'ACTIVE' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  member.status === 'INACTIVE' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                  member.status === 'PENDENT' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              )}>
                  {member.status === 'ACTIVE' ? 'Ativo' : member.status === 'INACTIVE' ? 'Inativo' : 'Pendente'}
              </Badge>
           </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 mt-auto">
         <Button variant="ghost" className="w-full text-xs h-8 mt-2 group-hover:bg-primary/5 transition-colors">
            Ver Detalhes
         </Button>
      </CardFooter>
    </Card>
  );
};
