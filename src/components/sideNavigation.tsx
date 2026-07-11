import { useState, useMemo } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Home, Users, LogOut, ChevronLeft, ChevronRight,User as UserIcon,Loader2, type LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useGetAccountInfo } from '@/hooks/useGetAccount'; 
import { useAccountPermissions } from '@/hooks/useAccountPermissions'; 

type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  requiredPermission?: string; 
};

const NAV_ITEMS: NavItem[] = [
  { 
    label: 'Início', 
    icon: Home, 
    href: '/home' 
  },
  { 
    label: 'Gestão dos membros', 
    icon: Users, 
    href: '/manage/members',
    requiredPermission: 'MEMBER_MANAGE'
  },
];

export const SideNavigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const { user, account, logout, isLoading: isLoadingUser } = useGetAccountInfo();
  const { permissions, isLoading: isLoadingPermissions } = useAccountPermissions(account);

  const router = useRouterState(); 
  const currentPath = router.location.pathname;

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const filteredNavItems = useMemo(() => {
    if (!user) return [];
    
    return NAV_ITEMS.filter((item) => {
      if (!item.requiredPermission) return true;
      return permissions.includes(item.requiredPermission);
    });
  }, [user, permissions]);

  if (isLoadingUser || (user && isLoadingPermissions)) {
    return (
      <aside className="h-screen w-20 border-r border-border bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
      </aside>
    );
  }

  if (!user) return null;

  return (
    <aside 
      className={cn(
        "relative flex flex-col h-screen border-r border-border bg-background text-foreground transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-20" : "w-[280px]"
      )}
    >
      {/* --- BOTÃO DE TOGGLE --- */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="absolute -right-4 top-6 h-8 w-8 rounded-full shadow-md z-50 bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label={isCollapsed ? "Expandir menu" : "Retrair menu"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>

      {/* --- CABEÇALHO --- */}
      <div className="flex items-center justify-center p-6 h-20 border-b border-border/50">
        {!isCollapsed ? (
           <h1 className="text-2xl font-heading font-bold tracking-tight text-primary animate-in fade-in duration-300">
             GAM
           </h1>
        ) : (
          <h1 className="text-xl font-heading font-bold tracking-tight text-primary">
            GAM
          </h1>
        )}
      </div>

      {/* --- PERFIL DO USUÁRIO --- */}
      <div className={cn(
        "flex items-center gap-3 p-4 mx-2 mt-2 rounded-lg bg-muted/30 border border-border/50 transition-all duration-300",
        isCollapsed && "justify-center px-0 mx-2 flex-col gap-2 bg-transparent border-none"
      )}>
        <Avatar className={cn("border-2 border-background shadow-sm", isCollapsed ? "h-8 w-8" : "h-10 w-10")}>
          <AvatarImage src={user.picture || undefined} alt={user.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            <UserIcon size={isCollapsed ? 14 : 18} />
          </AvatarFallback>
        </Avatar>
        
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-sm font-medium text-foreground truncate" title={user.name}>
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground truncate" title={user.roleLabel}>
              {user.roleLabel}
            </span>
          </div>
        )}
      </div>

      {/* --- LISTA DE NAVEGAÇÃO --- */}
      <nav className="flex-1 overflow-y-auto py-6 px-2">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = currentPath === item.href;
            
            return (
              <li key={item.label}>
                <Link 
                  to={item.href}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 font-medium text-sm",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon 
                    className={cn(
                      "shrink-0 transition-colors", 
                      isCollapsed ? "h-5 w-5" : "h-4 w-4",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )} 
                  />
                  
                  {!isCollapsed && (
                    <span className="truncate animate-in fade-in slide-in-from-left-2 duration-200">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* --- RODAPÉ / LOGOUT --- */}
      <div className="p-4 border-t border-border mt-auto">
        <button 
          onClick={() => logout()}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-destructive/20",
            isCollapsed && "justify-center px-0"
          )}
          title="Sair da conta"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
};