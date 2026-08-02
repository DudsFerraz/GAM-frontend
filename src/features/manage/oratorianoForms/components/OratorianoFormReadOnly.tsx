import { LockKeyhole } from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { FormPrintSection } from './FormPrintSection'
import { cn } from '@/lib/utils'
import { formatDate, formatDateTime } from '@/lib/format'

import {
  getConfirmationLabel,
  getHealthAnswerLabel,
  getOratorianoFormOriginLabel,
  getOratorianoFormStatusPresentation,
  getResponsibleRelationshipLabel,
} from '../presentation'
import type { ParsedOratorianoFormDetail } from '../parseFormDetail'
import type { OratorianoFormDraft } from '../types'

type HealthQuestion = NonNullable<
  NonNullable<OratorianoFormDraft['health']>['medicalFollowUp']
>
type HealthQuestionKey = Exclude<
  keyof NonNullable<OratorianoFormDraft['health']>,
  'otherCare'
>

type OratorianoFormReadOnlyProps = {
  canGeneratePdf: boolean
  form: ParsedOratorianoFormDetail
  formId: string
  name: string
  oratorianoId: string
}

export function OratorianoFormReadOnly({
  canGeneratePdf,
  form,
  formId,
  name,
  oratorianoId,
}: OratorianoFormReadOnlyProps) {
  const status = getOratorianoFormStatusPresentation(form.status)

  return (
    <>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">
            {typeof form.version === 'number'
              ? `Ficha adicional · versão ${form.version}`
              : 'Ficha adicional · versão não informada'}
          </p>
          <h1 className="break-words font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta segura e somente leitura.
          </p>
        </div>
        <Badge className={status.badgeClassName} variant="outline">
          <span
            aria-hidden="true"
            className={cn('h-2 w-2 rounded-full', status.dotClassName)}
          />
          {status.label}
        </Badge>
      </header>

      <FormPrintSection
        canGenerate={canGeneratePdf}
        currentRevision={form.draftRevision}
        formId={formId}
        isDirty={false}
        name={name}
        oratorianoId={oratorianoId}
        origin={form.origin}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="space-y-3 lg:sticky lg:top-6">
          <Card className="gap-0 py-5">
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <SummaryItem
                  label="Origem"
                  value={getOratorianoFormOriginLabel(form.origin)}
                />
                <SummaryItem
                  label="Revisão"
                  value={typeof form.draftRevision === 'number'
                    ? String(form.draftRevision)
                    : 'Não informada'}
                />
                <SummaryItem
                  label="Criada em"
                  value={formatDateTime(form.createdAt)}
                />
                <SummaryItem
                  label="Assinatura"
                  value={formatDate(form.signedOn)}
                />
              </dl>
            </CardContent>
          </Card>
          <div className="rounded-r-lg border-l-4 border-primary bg-primary/10 p-4 text-sm text-foreground">
            <div className="flex items-start gap-2">
              <LockKeyhole
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              />
              <p>{getReadOnlyDescription(form.status)}</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <IdentificationSection form={form} />
          <FamilySection data={form.data} />
          <HealthSection data={form.data} />
          <DeclarationsSection data={form.data} />
          <SignatureSection data={form.data} />
        </div>
      </div>
    </>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-semibold">{value}</dd>
    </div>
  )
}

function FormSection({
  children,
  number,
  title,
}: {
  children: ReactNode
  number: number
  title: string
}) {
  const headingId = `form-section-${number}`
  return (
    <section aria-labelledby={headingId}>
      <Card className="gap-4 overflow-hidden py-5">
        <CardHeader className="px-5 sm:px-6">
          <h2
            className="flex items-center gap-3 font-heading text-lg"
            id={headingId}
          >
            <span
              aria-hidden="true"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm text-primary"
            >
              {number}
            </span>
            {title}
          </h2>
        </CardHeader>
        <CardContent className="px-5 sm:px-6">{children}</CardContent>
      </Card>
    </section>
  )
}

function DataGrid({ children }: { children: ReactNode }) {
  return <dl className="grid min-w-0 gap-5 sm:grid-cols-2">{children}</dl>
}

function DataItem({
  full = false,
  label,
  value,
}: {
  full?: boolean
  label: string
  value?: string | null
}) {
  const presented = value?.trim() || 'Não informado'
  return (
    <div className={cn('min-w-0', full && 'sm:col-span-2')}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={cn(
        'mt-1 break-words whitespace-pre-wrap font-medium',
        presented === 'Não informado' && 'italic text-muted-foreground',
      )}>
        {presented}
      </dd>
    </div>
  )
}

function IdentificationSection({ form }: { form: ParsedOratorianoFormDetail }) {
  const data = form.data
  const address = [
    data.address?.addressLine,
    data.address?.addressNumber,
    data.address?.neighborhood,
    data.address?.cep,
    data.address?.city,
  ].filter((value): value is string => Boolean(value)).join(' · ')

  return (
    <FormSection number={1} title="Identificação e endereço">
      <DataGrid>
        <DataItem label="Nome" value={data.firstName} />
        <DataItem label="Sobrenome" value={data.surname} />
        <DataItem label="Nascimento" value={data.birthDate
          ? formatDate(data.birthDate)
          : undefined} />
        <DataItem label="Telefone" value={data.phoneNumber} />
        <DataItem label="CPF" value={data.cpf} />
        <DataItem label="RG" value={data.rg} />
        <DataItem full label="Endereço" value={address} />
      </DataGrid>
    </FormSection>
  )
}

function FamilySection({ data }: { data: OratorianoFormDraft }) {
  const responsibleName = [
    data.responsible?.firstName,
    data.responsible?.surname,
  ].filter(Boolean).join(' ')
  const fatherName = [data.father?.firstName, data.father?.surname]
    .filter(Boolean).join(' ')
  const motherName = [data.mother?.firstName, data.mother?.surname]
    .filter(Boolean).join(' ')

  return (
    <FormSection number={2} title="Escola, responsável e família">
      <DataGrid>
        <DataItem label="Escola" value={data.schoolName} />
        <DataItem label="Ano escolar" value={data.schoolGrade} />
        <DataItem
          label="Relação do responsável"
          value={data.responsible?.relationship
            ? getResponsibleRelationshipLabel(data.responsible.relationship)
            : undefined}
        />
        <DataItem
          label="Complemento da relação"
          value={data.responsible?.relationshipComplement}
        />
        <DataItem label="Nome do responsável" value={responsibleName} />
        <DataItem
          label="Responsável com 18 anos ou mais"
          value={data.responsible?.atLeast18 === undefined
            ? undefined
            : data.responsible.atLeast18 ? 'Sim' : 'Não'}
        />
        <DataItem label="Telefone do responsável" value={data.responsible?.phoneNumber} />
        <DataItem label="E-mail do responsável" value={data.responsible?.email} />
        <DataItem label="CPF do responsável" value={data.responsible?.cpf} />
        <DataItem label="Pai" value={fatherName} />
        <DataItem label="CPF do pai" value={data.father?.cpf} />
        <DataItem label="Mãe" value={motherName} />
        <DataItem label="CPF da mãe" value={data.mother?.cpf} />
      </DataGrid>
    </FormSection>
  )
}

const HEALTH_QUESTIONS = [
  ['medicalFollowUp', 'Acompanhamento médico'],
  ['physicalActivityRestriction', 'Restrição para atividade física'],
  ['medicineUse', 'Uso de medicamento'],
  ['allergies', 'Alergias'],
  ['convulsions', 'Convulsões'],
  ['frequentFainting', 'Desmaios frequentes'],
  ['heartCondition', 'Condição cardíaca'],
  ['otherHealthCondition', 'Outra condição de saúde'],
] as const satisfies ReadonlyArray<[HealthQuestionKey, string]>

function HealthSection({ data }: { data: OratorianoFormDraft }) {
  return (
    <FormSection number={3} title="Informações de saúde">
      <div className="space-y-3">
        {HEALTH_QUESTIONS.map(([key, label]) => (
          <HealthQuestionItem
            key={key}
            label={label}
            question={data.health?.[key]}
          />
        ))}
        <DataGrid>
          <DataItem full label="Outros cuidados" value={data.health?.otherCare} />
        </DataGrid>
      </div>
    </FormSection>
  )
}

function HealthQuestionItem({
  label,
  question,
}: {
  label: string
  question?: HealthQuestion
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-muted/20 p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
        <dl>
          <DataItem
            label={label}
            value={question?.answer
              ? getHealthAnswerLabel(question.answer)
              : undefined}
          />
        </dl>
        <dl className="grid min-w-0 gap-3">
          <DataItem label="Explicação" value={question?.explanation} />
          <DataItem
            label="Orientações importantes"
            value={question?.importantInstructions}
          />
        </dl>
      </div>
    </div>
  )
}

function DeclarationsSection({ data }: { data: OratorianoFormDraft }) {
  return (
    <FormSection number={4} title="Declarações">
      <DataGrid>
        <DataItem
          label="Relação de quem assina confirmada"
          value={getConfirmationLabel(data.declarations?.signerRelationshipConfirmed)}
        />
        <DataItem
          label="Veracidade das informações confirmada"
          value={getConfirmationLabel(data.declarations?.informationTruthConfirmed)}
        />
        <DataItem
          label="Informações de saúde atualizadas"
          value={getConfirmationLabel(data.declarations?.healthInformationCurrentConfirmed)}
        />
        <DataItem
          label="Uso das informações compreendido"
          value={getConfirmationLabel(data.declarations?.informationUseUnderstood)}
        />
        <DataItem
          label="Ficha revisada"
          value={getConfirmationLabel(data.declarations?.formReviewed)}
        />
        <DataItem
          label="Autorização de imagem e voz"
          value={getConfirmationLabel(data.declarations?.imageAndVoiceAuthorizationAccepted)}
        />
      </DataGrid>
    </FormSection>
  )
}

function SignatureSection({ data }: { data: OratorianoFormDraft }) {
  return (
    <FormSection number={5} title="Assinatura">
      <DataGrid>
        <DataItem
          label="Data de assinatura"
          value={data.signedOn ? formatDate(data.signedOn) : undefined}
        />
        <DataItem
          label="Relação de quem assina"
          value={data.responsible?.relationship
            ? getResponsibleRelationshipLabel(data.responsible.relationship)
            : undefined}
        />
      </DataGrid>
    </FormSection>
  )
}

function getReadOnlyDescription(status?: string | null): string {
  switch (status) {
    case 'DRAFT':
      return 'Esta ficha está em rascunho e permanece somente para consulta nesta etapa.'
    case 'COMPLETED':
      return 'Esta ficha foi concluída e permanece disponível somente para consulta.'
    case 'SUPERSEDED':
      return 'Esta é uma versão histórica substituída e não pode ser alterada.'
    case 'REVOKED':
      return 'Esta ficha foi revogada e permanece disponível somente para consulta.'
    default:
      return 'O conteúdo permanece protegido contra alterações.'
  }
}
