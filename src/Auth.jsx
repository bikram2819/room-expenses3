import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    let { user, error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setUser(user)  // Set the authenticated user in the app
      console.log('User signed up/logged in:', user)

      // Insert user data into the custom user table (if signed up)
      if (isSignUp) {
        console.log('Inserting user into custom table...')

        const { data, error: insertError } = await supabase
          .from('your_custom_user_table')  // Replace with your custom user table name
          .insert([
            { user_id: user.id, other_info: 'Additional user info' }  // Modify as needed
          ])

        if (insertError) {
          console.error('Error inserting user data:', insertError.message)
          alert('Error inserting user data: ' + insertError.message)
        } else {
          console.log('User data inserted:', data)
          alert('User data inserted successfully into custom table!')
        }
      }
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      <p>
        {isSignUp
          ? 'Already have an account?'
          : 'Don’t have an account?'}
        <button onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  )
}
