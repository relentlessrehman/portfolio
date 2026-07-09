import { Resend } from 'resend'
import { getContactNotifyEmail, getResendApiKey, isResendConfigured } from './env'
import type { ContactFormValues } from '#/features/contact/lib/schema'

/**
 * Best-effort email notification when a contact message arrives. Optional —
 * the message is already saved to Supabase regardless of whether this
 * succeeds, so a Resend outage never loses a submission.
 */
export async function sendContactNotification(message: ContactFormValues): Promise<void> {
  if (!isResendConfigured()) return
  try {
    const resend = new Resend(getResendApiKey())
    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: getContactNotifyEmail()!,
      replyTo: message.email,
      subject: `New portfolio message from ${message.name}`,
      text: `From: ${message.name} <${message.email}>\n\n${message.message}`,
    })
  } catch {
    // Notification is a convenience, not the source of truth — swallow.
  }
}
