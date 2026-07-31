export const ORATORIANO_PROFILE_NOTICE_VALUES = [
  'oratoriano-excluido',
  'oratoriano-form-rascunho-excluido',
] as const

export const ORATORIANO_PROFILE_NOTICE = {
  formDraftDeleted: 'oratoriano-form-rascunho-excluido',
  oratorianoDeleted: 'oratoriano-excluido',
} as const

export type OratorianoProfileNotice =
  typeof ORATORIANO_PROFILE_NOTICE_VALUES[number]

const noticePresentations = {
  'oratoriano-excluido': {
    description: 'O Oratoriano não aparece mais nas consultas. As presenças anteriores permanecem no histórico.',
    title: 'Cadastro excluído.',
  },
  'oratoriano-form-rascunho-excluido': {
    description: 'A ficha adicional não aparece mais no histórico.',
    title: 'O rascunho foi excluído.',
  },
} as const satisfies Record<OratorianoProfileNotice, {
  description: string
  title: string
}>

export function getOratorianoProfileNoticePresentation(
  notice: OratorianoProfileNotice,
) {
  return noticePresentations[notice]
}
