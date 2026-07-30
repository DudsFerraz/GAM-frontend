import criancasImage from '@/assets/images/criancas_oratorio.jpeg'
import dbJovens from '@/assets/images/db_jovens.jpg'
import dbJovensMaria from '@/assets/images/db_jovens_maria.jpg'
import gamImage from '@/assets/images/gam.jpg'

export type MissionSlide = {
  image: string
  quotation: string
}

export const missionSlides = [
  {
    image: gamImage,
    quotation: '“Leva-me aonde os homens necessitem a Tua palavra”',
  },
  {
    image: criancasImage,
    quotation: '“Basta que sejam jovens para que eu os ame”',
  },
  {
    image: dbJovens,
    quotation: '“Deus nos colocou no mundo para os outros”',
  },
  {
    image: dbJovensMaria,
    quotation:
      '“Não é com pancadas, mas com a mansidão e a caridade que deverás ganhar esses teus amigos.”',
  },
] as const satisfies readonly MissionSlide[]
