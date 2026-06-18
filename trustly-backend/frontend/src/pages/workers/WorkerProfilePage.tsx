import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { workerProfileApi } from '../../api/workerProfile.api'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { Textarea } from '../../components/ui/Textarea'
import { useFormErrors } from '../../hooks/useFormErrors'
import type { WorkerProfileResponse } from '../../types/models'

export function WorkerProfilePage() {
  const [profile, setProfile] = useState<WorkerProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)
  const completionPromptShown = useRef(false)
  const { getError, handleApiError, clearErrors, formError } = useFormErrors()

  const [bio, setBio] = useState('')
  const [experienceYears, setExperienceYears] = useState('0')
  const [city, setCity] = useState('')
  const [state, setStateVal] = useState('')

  const fillFormFromProfile = (p: WorkerProfileResponse) => {
    setBio(p.bio ?? '')
    setExperienceYears(String(p.experienceYears ?? 0))
    setCity(p.city ?? '')
    setStateVal(p.state ?? '')
  }

  useEffect(() => {
    workerProfileApi
      .getMy()
      .then((p) => {
        setProfile(p)
        fillFormFromProfile(p)
        setEditing(!p.profileCompleted)
        if (!p.profileCompleted && !completionPromptShown.current) {
          toast('Complete your worker profile', { icon: '!' })
          completionPromptShown.current = true
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setSubmitting(true)
    try {
      await workerProfileApi.complete({
        bio,
        experienceYears: Number(experienceYears),
        city,
        state: state,
      })
      toast.success('Profile updated successfully')
      const updated = await workerProfileApi.getMy()
      setProfile(updated)
      fillFormFromProfile(updated)
      setEditing(!updated.profileCompleted)
    } catch (err) {
      handleApiError(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Skeleton height={300} />

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Worker Profile</h1>
          <p>{profile?.workerName} - {profile?.categoryName}</p>
        </div>
        {profile && !editing && (
          <Button
            type="button"
            onClick={() => {
              fillFormFromProfile(profile)
              clearErrors()
              setEditing(true)
            }}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {profile && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="flex-between">
            <span>Profile Status</span>
            <Badge value={profile.profileCompleted ? 'COMPLETED' : 'PENDING'} tone={profile.profileCompleted ? 'success' : 'warning'} />
          </div>
        </div>
      )}

      {profile && !editing ? (
        null
      ) : (
        <div className="card">
          <form onSubmit={handleSubmit} className="form-grid two-col">
            <Textarea label="Bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} error={getError('bio')} required className="full-width" />
            <Input label="Experience (years)" name="experienceYears" type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} error={getError('experienceYears')} required />
            <Input label="City" name="city" value={city} onChange={(e) => setCity(e.target.value)} error={getError('city')} required />
            <Input label="State" name="state" value={state} onChange={(e) => setStateVal(e.target.value)} error={getError('state')} required />
            {formError && <p className="form-error full-width">{formError}</p>}
            <div className="form-actions full-width">
              {profile?.profileCompleted && (
                <Button type="button" variant="secondary" onClick={() => setEditing(false)} disabled={submitting}>Cancel</Button>
              )}
              <Button type="submit" loading={submitting}>Save Profile</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
