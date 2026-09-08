import { Send } from 'lucide-react'
import { type FormEvent, type KeyboardEvent, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function ChatComposer({
  disabled,
  onSubmit,
}: {
  disabled: boolean
  onSubmit: (content: string) => void
}) {
  const [content, setContent] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = content.trim()
    if (!next || disabled) {
      return
    }
    onSubmit(next)
    setContent('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-card/90 px-4 py-4">
      <label htmlFor="chat-message" className="sr-only">
        Mensagem
      </label>
      <div className="flex items-end gap-3">
        <Textarea
          id="chat-message"
          name="message"
          rows={2}
          value={content}
          disabled={disabled}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte por uma cidade"
          className="min-h-12 resize-none bg-background"
        />
        <Button
          type="submit"
          disabled={disabled || content.trim() === ''}
          className="cursor-pointer"
        >
          <Send aria-hidden="true" />
          Enviar
        </Button>
      </div>
    </form>
  )
}
