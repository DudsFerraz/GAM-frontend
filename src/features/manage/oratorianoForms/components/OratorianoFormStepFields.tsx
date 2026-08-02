import {
  useFormContext,
  useWatch,
  type FieldPathByValue,
} from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

import {
  isMinorAtSignedDate,
  type OratorianoFormValues,
} from '../schemas/formDraftSchema'
import {
  getHealthAnswerLabel,
  getResponsibleRelationshipLabel,
} from '../presentation'

type TextPath = FieldPathByValue<OratorianoFormValues, string>
type BooleanPath = FieldPathByValue<
  OratorianoFormValues,
  boolean | undefined
>

export function IdentificationStep() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField autoComplete="given-name" label="Nome" maxLength={32} name="firstName" required />
      <TextField autoComplete="family-name" label="Sobrenome completo" maxLength={64} name="surname" required />
      <TextField label="Data de nascimento" name="birthDate" required type="date" />
      <TextField inputMode="numeric" label="CPF" maxLength={18} name="cpf" required />
      <TextField label="RG" maxLength={20} name="rg" />
      <TextField autoComplete="tel" label="Telefone" maxLength={32} name="phoneNumber" required />
      <TextField className="sm:col-span-2" label="Logradouro" maxLength={200} name="address.addressLine" required />
      <TextField label="Número" maxLength={32} name="address.addressNumber" required />
      <TextField label="Bairro" maxLength={100} name="address.neighborhood" required />
      <TextField inputMode="numeric" label="CEP" maxLength={9} name="address.cep" required />
      <TextField label="Cidade" maxLength={100} name="address.city" required />
    </div>
  )
}

export function FamilyStep() {
  const { control } = useFormContext<OratorianoFormValues>()
  const relationship = useWatch({ control, name: 'responsible.relationship' })
  const birthDate = useWatch({ control, name: 'birthDate' })
  const signedOn = useWatch({ control, name: 'signedOn' })
  const isSelf = relationship === 'SELF'
  const isMother = relationship === 'MOTHER'
  const isFather = relationship === 'FATHER'
  const isMinor = isMinorAtSignedDate(birthDate, signedOn)
  const needsComplement = relationship === 'RELATIVE'
    || relationship === 'REFERENCE_ADULT'

  return (
    <div className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Escola" maxLength={200} name="schoolName" required={isMinor} />
        <TextField label="Ano escolar" maxLength={100} name="schoolGrade" required={isMinor} />
      </div>

      <section aria-labelledby="responsible-heading" className="space-y-5">
        <div>
          <h3 className="font-heading text-base font-semibold" id="responsible-heading">
            Pessoa responsável
          </h3>
          <p className="text-sm text-muted-foreground">
            Para menores de idade, informe uma pessoa responsável com 18 anos ou mais.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField label="Relação com o Oratoriano" name="responsible.relationship" required={isMinor}>
            <option value="">Selecione</option>
            {(['SELF', 'MOTHER', 'FATHER', 'RELATIVE', 'REFERENCE_ADULT'] as const)
              .map((value) => (
                <option key={value} value={value}>
                  {getResponsibleRelationshipLabel(value)}
                </option>
              ))}
          </SelectField>
          <SelectField label="Tem 18 anos ou mais?" name="responsible.atLeast18" required={isMinor}>
            <option value="">Selecione</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </SelectField>
          {needsComplement && (
            <TextField
              className="sm:col-span-2"
              description="Explique o vínculo de forma breve."
              label="Qual é a relação?"
              maxLength={120}
              name="responsible.relationshipComplement"
              required
            />
          )}
        </div>

        {isSelf ? (
          <Alert>
            <AlertTitle>Dados do próprio Oratoriano</AlertTitle>
            <AlertDescription>
              Nome, CPF e telefone serão usados a partir da identificação, sem duplicar o preenchimento.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Nome do responsável" maxLength={32} name="responsible.firstName" />
            <TextField label="Sobrenome do responsável" maxLength={64} name="responsible.surname" />
            <TextField inputMode="numeric" label="CPF do responsável" maxLength={18} name="responsible.cpf" />
            <TextField autoComplete="tel" label="Telefone do responsável" maxLength={32} name="responsible.phoneNumber" />
            <TextField autoComplete="email" className="sm:col-span-2" label="E-mail do responsável" maxLength={254} name="responsible.email" type="email" />
          </div>
        )}
      </section>

      <section aria-labelledby="family-heading" className="space-y-5">
        <div>
          <h3 className="font-heading text-base font-semibold" id="family-heading">
            Vínculos familiares
          </h3>
          <p className="text-sm text-muted-foreground">
            Se informar pai ou mãe, preencha nome, sobrenome e CPF completos.
          </p>
        </div>
        {!isFather && <ParentFields kind="father" label="Pai" />}
        {!isMother && <ParentFields kind="mother" label="Mãe" />}
        {(isFather || isMother) && (
          <p className="text-sm text-muted-foreground">
            Os dados de {isFather ? 'pai' : 'mãe'} serão derivados da pessoa responsável informada acima.
          </p>
        )}
      </section>
    </div>
  )
}

function ParentFields({ kind, label }: { kind: 'father' | 'mother'; label: string }) {
  const { control } = useFormContext<OratorianoFormValues>()
  const parent = useWatch({ control, name: kind })
  const hasValue = Object.values(parent).some((value) => value.trim())

  return (
    <fieldset className="grid gap-5 rounded-xl border p-4 sm:grid-cols-3">
      <legend className="px-2 text-sm font-semibold">{label}</legend>
      <TextField label="Nome" maxLength={32} name={`${kind}.firstName`} required={hasValue} />
      <TextField label="Sobrenome" maxLength={64} name={`${kind}.surname`} required={hasValue} />
      <TextField inputMode="numeric" label="CPF" maxLength={18} name={`${kind}.cpf`} required={hasValue} />
    </fieldset>
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
] as const

export function HealthStep() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Para cada item, escolha uma resposta. Quando responder “Sim”, descreva a situação.
      </p>
      {HEALTH_QUESTIONS.map(([key, label]) => (
        <HealthQuestionField
          isMedicine={key === 'medicineUse'}
          key={key}
          label={label}
          name={key}
        />
      ))}
      <TextAreaField
        description="Inclua somente cuidados relevantes que ainda não apareceram acima."
        label="Outros cuidados"
        maxLength={5000}
        name="health.otherCare"
      />
    </div>
  )
}

function HealthQuestionField({
  isMedicine,
  label,
  name,
}: {
  isMedicine: boolean
  label: string
  name: typeof HEALTH_QUESTIONS[number][0]
}) {
  const { control } = useFormContext<OratorianoFormValues>()
  const answer = useWatch({ control, name: `health.${name}.answer` })
  return (
    <fieldset className="grid gap-4 rounded-xl border bg-muted/15 p-4 sm:grid-cols-2">
      <legend className="px-2 font-medium">{label}</legend>
      <SelectField label="Resposta" name={`health.${name}.answer`} required>
        <option value="">Selecione</option>
        {(['YES', 'NO', 'NOT_INFORMED'] as const).map((value) => (
          <option key={value} value={value}>{getHealthAnswerLabel(value)}</option>
        ))}
      </SelectField>
      <TextAreaField
        description={answer === 'YES'
          ? 'Obrigatória para uma resposta afirmativa.'
          : 'Deixe em branco quando a resposta não for “Sim”.'}
        label="Explicação"
        maxLength={2000}
        name={`health.${name}.explanation`}
        required={answer === 'YES'}
      />
      {isMedicine && (
        <TextAreaField
          className="sm:col-span-2"
          description="Inclua horários, dosagem ou orientação importante, se houver uso de medicamento."
          label="Orientações importantes"
          maxLength={2000}
          name="health.medicineUse.importantInstructions"
        />
      )}
    </fieldset>
  )
}

const DECLARATIONS = [
  ['signerRelationshipConfirmed', 'Confirmo a relação de quem assina com o Oratoriano.'],
  ['informationTruthConfirmed', 'Confirmo que as informações prestadas são verdadeiras.'],
  ['healthInformationCurrentConfirmed', 'Confirmo que as informações de saúde estão atualizadas.'],
  ['informationUseUnderstood', 'Compreendo como estas informações serão utilizadas.'],
  ['formReviewed', 'Revisei o preenchimento desta ficha.'],
  ['imageAndVoiceAuthorizationAccepted', 'Autorizo o uso de imagem e voz conforme informado.'],
] as const

export function DeclarationsStep() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {DECLARATIONS.map(([name, label]) => (
          <CheckboxField key={name} label={label} name={`declarations.${name}`} required />
        ))}
      </div>
      <TextField
        description="Use a data registrada na ficha ou na assinatura realizada no sistema."
        label="Data de assinatura"
        name="signedOn"
        required
        type="date"
      />
    </div>
  )
}

export function ReviewStep({ values }: { values: OratorianoFormValues }) {
  const answeredHealth = HEALTH_QUESTIONS.filter(
    ([key]) => values.health[key].answer,
  ).length
  const name = [values.firstName.trim(), values.surname.trim()]
    .filter(Boolean)
    .join(' ')
  return (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Revise antes de salvar</AlertTitle>
        <AlertDescription>
          O salvamento substituirá integralmente os dados atuais do rascunho. Campos apagados também serão removidos.
        </AlertDescription>
      </Alert>
      <div className="grid gap-3 sm:grid-cols-2">
        <ReviewCard label="Identificação" value={name || 'Ainda não informada'} />
        <ReviewCard
          label="Escola e responsável"
          value={values.responsible.relationship
            ? getResponsibleRelationshipLabel(values.responsible.relationship)
            : 'Relação ainda não informada'}
        />
        <ReviewCard
          label="Informações de saúde"
          value={`${answeredHealth} de ${HEALTH_QUESTIONS.length} respostas informadas`}
        />
        <ReviewCard
          label="Assinatura"
          value={values.signedOn || 'Data ainda não informada'}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Você pode salvar um rascunho incompleto e continuar depois. Erros de formato precisam ser corrigidos antes do salvamento.
      </p>
    </div>
  )
}

function ReviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}

function TextField({
  className,
  description,
  label,
  name,
  required = false,
  ...inputProps
}: Omit<React.ComponentProps<typeof Input>, 'name'> & {
  description?: string
  label: string
  name: TextPath
  required?: boolean
}) {
  const { control } = useFormContext<OratorianoFormValues>()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className} required={required}>
          <FormLabel>{label}</FormLabel>
          <FormControl nativeRequired={false}><Input {...inputProps} {...field} /></FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function TextAreaField({
  className,
  description,
  label,
  maxLength,
  name,
  required = false,
}: {
  className?: string
  description?: string
  label: string
  maxLength: number
  name: TextPath
  required?: boolean
}) {
  const { control } = useFormContext<OratorianoFormValues>()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className} required={required}>
          <FormLabel>{label}</FormLabel>
          <FormControl nativeRequired={false}><Textarea maxLength={maxLength} rows={3} {...field} /></FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function SelectField({
  children,
  label,
  name,
  required = false,
}: {
  children: React.ReactNode
  label: string
  name: TextPath
  required?: boolean
}) {
  const { control } = useFormContext<OratorianoFormValues>()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem required={required}>
          <FormLabel>{label}</FormLabel>
          <FormControl nativeRequired={false}><Select {...field}>{children}</Select></FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function CheckboxField({
  label,
  name,
  required = false,
}: {
  label: string
  name: BooleanPath
  required?: boolean
}) {
  const { control } = useFormContext<OratorianoFormValues>()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-start gap-3 rounded-xl border p-4" required={required}>
          <FormControl nativeRequired={false}>
            <Checkbox
              checked={field.value ?? false}
              onBlur={field.onBlur}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              ref={field.ref}
            />
          </FormControl>
          <div className="grid gap-1">
            <FormLabel className="cursor-pointer text-foreground">{label}</FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}
