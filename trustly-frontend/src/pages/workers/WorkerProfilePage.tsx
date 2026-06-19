import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { workerProfileApi } from '../../api/workerProfile.api'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { Textarea } from '../../components/ui/Textarea'
import { useFormErrors } from '../../hooks/useFormErrors'
import { getCitiesForState, INDIA_STATES, isKnownIndianState } from '../../data/indiaLocations'
import type { WorkerProfileResponse } from '../../types/models'

export function WorkerProfilePage() {
  const [profile, setProfile] = useState<WorkerProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)
  const { getError, handleApiError, clearErrors, formError, setFieldErrors } = useFormErrors()

  const [bio, setBio] = useState('')
  const [experienceYears, setExperienceYears] = useState('0')
  const [city, setCity] = useState('')
  const [state, setStateVal] = useState('')

  const cityOptions = useMemo(() => getCitiesForState(state), [state])
  const hasSelectedState = isKnownIndianState(state)

  const handleStateChange = (value: string) => {
    setStateVal(value)
    setCity('')
  }

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
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()

    if (!hasSelectedState) {
      setFieldErrors({ state: 'Select a valid state from the list' })
      return
    }

    if (!cityOptions.includes(city)) {
      setFieldErrors({ city: 'Select a valid city from the selected state' })
      return
    }

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
            <Input
              label="State"
              name="state"
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              error={getError('state')}
              list="india-state-options"
              placeholder="Search and select state"
              required
            />
            <datalist id="india-state-options">
              {INDIA_STATES.map((stateName) => (
                <option key={stateName} value={stateName} />
              ))}
            </datalist>
            <Input
              label="City"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={getError('city')}
              list="india-city-options"
              placeholder={hasSelectedState ? 'Search and select city' : 'Select state first'}
              disabled={!hasSelectedState}
              required
            />
            <datalist id="india-city-options">
              {cityOptions.map((cityName) => (
                <option key={cityName} value={cityName} />
              ))}
            </datalist>
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
