import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { contactFormSchema } from '../lib/schema'
import { submitContactMessage } from '#/server/contact'
import { Button } from '#/components/ui/button'
import { Reveal } from '#/components/motion/Reveal'
import { cn } from '#/lib/utils'
import type { ContactFormValues } from '../lib/schema'

const inputClass =
  'h-11 w-full rounded-md border border-border bg-surface px-3 text-body text-foreground ' +
  'placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-ring'

type Status = 'idle' | 'sent' | 'unavailable' | 'error'

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactFormSchema) })
  const submit = useServerFn(submitContactMessage)
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(values: ContactFormValues) {
    const result = await submit({ data: values })
    if (result.ok) {
      setStatus('sent')
      reset()
    } else if (result.reason === 'not-configured') {
      setStatus('unavailable')
    } else {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <Reveal>
        <p role="status" className="text-body text-foreground">
          ✓ Message sent — I'll get back to you soon.
        </p>
      </Reveal>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid w-full max-w-xl gap-4 text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="contact-name" className="text-small font-medium text-foreground">
            Name
          </label>
          <input
            id="contact-name"
            className={cn(inputClass, errors.name && 'border-danger')}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            {...register('name')}
          />
          {errors.name ? (
            <p id="contact-name-error" className="text-small text-danger" role="alert">
              {errors.name.message}
            </p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="contact-email" className="text-small font-medium text-foreground">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            className={cn(inputClass, errors.email && 'border-danger')}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            {...register('email')}
          />
          {errors.email ? (
            <p id="contact-email-error" className="text-small text-danger" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="contact-message" className="text-small font-medium text-foreground">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={4}
          className={cn(inputClass, 'h-auto py-2 leading-relaxed', errors.message && 'border-danger')}
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          {...register('message')}
        />
        {errors.message ? (
          <p id="contact-message-error" className="text-small text-danger" role="alert">
            {errors.message.message}
          </p>
        ) : null}
      </div>

      {/* Honeypot — hidden from real visitors, often filled by bots */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
        {...register('company')}
      />

      {status === 'unavailable' ? (
        <p className="text-small text-muted-foreground">
          Direct messaging isn't wired up yet — use the email button above instead.
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="text-small text-danger">
          Something went wrong sending that — try the email button above instead.
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  )
}
