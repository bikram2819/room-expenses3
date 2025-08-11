import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import ExpenseForm from './ExpenseForm'
import ExpenseTable from './ExpenseTable'
import Auth from './Auth'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get session using the new method
    const session = supabase.auth.getSession()
    setUser(session?.user || null)

    // Listen for authentication state changes (login/logout)
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)  // Clear user state
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Room Expenses Tracker</h1>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <ExpenseForm />
          <ExpenseTable />
          <button onClick={handleSignOut}>Sign Out</button> {/* Sign Out Button */}
        </>
      ) : (
        <Auth setUser={setUser} />
      )}
    </div>
  )
}

export default App
