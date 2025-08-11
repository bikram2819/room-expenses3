import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function ExpenseForm() {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [person, setPerson] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description || !amount || !person) return alert("Please fill all fields")

    setLoading(true)
    const { error } = await supabase.from('expenses1').insert([
      { description, amount: parseFloat(amount), person }
    ])
    setLoading(false)

    if (error) {
      console.error("Error adding expense:", error.message)
      alert("Error: " + error.message)
    } else {
      alert("Expense added!")
      setDescription('')
      setAmount('')
      setPerson('')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h2>Add Expense</h2>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ marginRight: '1rem' }}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ marginRight: '1rem' }}
      />
      <input
        type="text"
        placeholder="Person"
        value={person}
        onChange={(e) => setPerson(e.target.value)}
        style={{ marginRight: '1rem' }}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Add Expense"}
      </button>
    </form>
  )
}
