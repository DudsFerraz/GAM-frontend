import { SideNavigation } from './SideNavigation';
import { ColorModeToggle } from '@/components/ColorModeToggle';
import { Outlet } from '@tanstack/react-router';

export const AppLayout = () => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground">
      <SideNavigation />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
        
        <div className="absolute top-4 right-4 z-50">
          <ColorModeToggle/>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full h-full">
            <Outlet /> 
          </div>
        </div>
      </main>
    </div>
  );
};
