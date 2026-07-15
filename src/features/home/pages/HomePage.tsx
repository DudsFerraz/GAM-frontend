import { AboutSection } from '../components/AboutSection'
import { HomeFooter } from '../components/HomeFooter'
import { HomeHeader } from '../components/HomeHeader'
import { HeroSection } from '../components/HeroSection'
import { MissionCta } from '../components/MissionCta'
import { PillarsSection } from '../components/PillarsSection'

import { House, MapPin, Users, type LucideIcon } from 'lucide-react'


export type Pillar = { icon: LucideIcon; title: string; description: string }

const pillars: Pillar[] = [
  { icon: House, title: 'Oratório', description: 'Um espaço de amizade, recreação e cuidado para crianças e adolescentes.' },
  { icon: MapPin, title: 'Missão', description: 'Presença e serviço junto a comunidades, famílias e jovens de diferentes lugares.' },
  { icon: Users, title: 'Comunidade', description: 'Uma caminhada feita de formação, oração, voluntariado e fraternidade.' },
]

export function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf7] text-[#17324d]">
      <HomeHeader />
      <HeroSection />
      <AboutSection />
      <PillarsSection pillars={pillars} />
      <MissionCta />
      <HomeFooter />
    </main>
  )
}
