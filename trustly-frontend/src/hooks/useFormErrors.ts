import { useCallback, useState } from 'react'
import { parseFieldErrors, parseErrorMessage } from '../api/client'

export function useFormErrors() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const clearErrors = useCallback(() => {
    setFieldErrors({})
    setFormError(null)
  }, [])

  const handleApiError = useCallback((error: unknown) => {
    const fields = parseFieldErrors(error)
    if (Object.keys(fields).length > 0) {
      setFieldErrors(fields)
      setFormError('Please fix the highlighted fields.')
    } else {
      setFormError(parseErrorMessage(error))
    }
  }, [])

  const getError = useCallback((field: string) => fieldErrors[field], [fieldErrors])

  return { fieldErrors, formError, clearErrors, handleApiError, getError, setFieldErrors }
}
