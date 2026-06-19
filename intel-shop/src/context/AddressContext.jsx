import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'

const AddressContext = createContext(null)

export function AddressProvider({ children }) {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState([])

  const load = useCallback(async () => {
    if (!user) { setAddresses([]); return }
    try {
      const { data } = await api.get('/users/addresses/')
      setAddresses(Array.isArray(data) ? data : (data.results ?? []))
    } catch {
      setAddresses([])
    }
  }, [user])

  useEffect(() => { load() }, [load])

  async function addAddress(data) {
    await api.post('/users/addresses/', data)
    await load()
  }

  async function updateAddress(id, data) {
    await api.patch(`/users/addresses/${id}/`, data)
    await load()
  }

  async function deleteAddress(id) {
    await api.delete(`/users/addresses/${id}/`)
    await load()
  }

  async function setDefault(id) {
    await api.post(`/users/addresses/${id}/set-default/`)
    await load()
  }

  const defaultAddress = addresses.find(a => a.is_default) || null

  return (
    <AddressContext.Provider value={{ addresses, defaultAddress, addAddress, updateAddress, deleteAddress, setDefault }}>
      {children}
    </AddressContext.Provider>
  )
}

export function useAddress() {
  return useContext(AddressContext)
}
