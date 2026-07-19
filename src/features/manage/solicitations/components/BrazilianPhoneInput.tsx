import { forwardRef, type ComponentPropsWithoutRef, type Ref } from 'react'
import { IMaskMixin } from 'react-imask'

import { Input } from '@/components/ui/Input'

const MaskedInput = IMaskMixin(({ inputRef, ...props }) => (
  <Input {...props} ref={inputRef as Ref<HTMLInputElement>} />
))

const phoneMask = {
  mask: [
    { mask: '+00 (00) 0000-0000' },
    { mask: '+00 (00) 00000-0000' },
  ],
  prepare: (appended: string, masked: { value: string }) => (
    masked.value === '' && !appended.startsWith('+') ? `+55${appended}` : appended
  ),
  dispatch: (appended: string, dynamicMasked: { value: string; compiledMasks: Array<unknown> }) => {
    const digits = `${dynamicMasked.value}${appended}`.replace(/\D/g, '')
    return dynamicMasked.compiledMasks[digits[4] === '9' ? 1 : 0]
  },
} as const

type BrazilianPhoneInputProps = Omit<
  ComponentPropsWithoutRef<typeof Input>,
  'onChange' | 'value'
> & {
  value: string
  onAccept: (value: string) => void
}

export const BrazilianPhoneInput = forwardRef<HTMLInputElement, BrazilianPhoneInputProps>(
  function BrazilianPhoneInput({ value, onAccept, ...props }, ref) {
    return (
      <MaskedInput
        {...props}
        inputRef={ref}
        mask={phoneMask.mask}
        dispatch={phoneMask.dispatch}
        onAccept={onAccept}
        placeholder="+55 (19) 99999-9999"
        value={value}
      />
    )
  },
)
