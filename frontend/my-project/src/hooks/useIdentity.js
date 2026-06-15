import { useState, useEffect } from 'react'

const KEY = 'arva_identity'

export function useIdentity() {
  const [identity, setIdentityState] = useState(null) // { id, name, color_idx, isAdmin }
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (stored) setIdentityState(JSON.parse(stored))
    } catch {}
    setLoaded(true)
  }, [])

  function setIdentity(person) {
    setIdentityState(person)
    if (person) localStorage.setItem(KEY, JSON.stringify(person))
    else localStorage.removeItem(KEY)
  }

  function clearIdentity() { setIdentity(null) }

  return { identity, setIdentity, clearIdentity, loaded }
}