import { SideNavigation } from './SideNavigation';
import { ColorModeToggle } from '@/components/ColorModeToggle';
import { Outlet } from '@tanstack/react-router';

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-sans text-foreground md:h-screen md:flex-row md:overflow-hidden">
      <SideNavigation />

      <main className="relative flex min-h-0 flex-1 flex-col transition-all duration-300 md:h-full md:overflow-hidden">
        
        <div className="absolute right-4 top-4 z-50 hidden md:block">
          <ColorModeToggle/>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 pt-20 scroll-smooth sm:px-6 md:p-8">
          <div className="mx-auto h-full w-full max-w-7xl">
            <Outlet /> 
          </div>
        </div>
      </main>
    </div>
  );
};
