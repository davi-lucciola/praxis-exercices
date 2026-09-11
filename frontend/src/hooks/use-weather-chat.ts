import { useCallback, useReducer, useRef, useState } from 'react'

import { streamAgentExecute } from '@/lib/agent-stream'
import {
  type AgentExecuteIn,
  extractTextContent,
  normalizeSubmitMessages,
  UnknownEventError,
} from '@/lib/agent-types'
import { chatReducer } from '@/lib/chat-reducer'
import { createId } from '@/lib/utils'

export function useWeatherChat() {
  const [threadId, setThreadId] = useState(createId)
  const [turns, dispatch] = useReducer(chatReducer, [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const newChat = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setThreadId(createId())
    dispatch({ type: 'reset' })
    setError(null)
    setIsLoading(false)
  }, [])

  const submit = useCallback(
    async (input: AgentExecuteIn) => {
      if (isLoading) {
        return
      }

      const messages = normalizeSubmitMessages(input.messages)
      const first = messages[0]
      const content = first ? extractTextContent(first.content).trim() : ''
      if (!content) {
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      dispatch({ type: 'addUser', id: createId(), content })
      dispatch({ type: 'startAssistant', id: createId() })
      setError(null)
      setIsLoading(true)

      try {
        await streamAgentExecute({
          threadId,
          input: { messages },
          signal: controller.signal,
          onEvent: (event) => dispatch({ type: 'applyEvent', event }),
        })
      } catch (cause) {
        if (controller.signal.aborted) {
          return
        }
        const message =
          cause instanceof UnknownEventError
            ? cause.message
            : cause instanceof Error
              ? cause.message
              : 'Não foi possível falar com o assistente.'
        setError(message)
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null
          setIsLoading(false)
        }
      }
    },
    [isLoading, threadId],
  )

  return { threadId, turns, isLoading, error, submit, newChat }
}
