import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default function ExpenseTable() {
  const [expenses, setExpenses] = useState([])
  const [allExpenses, setAllExpenses] = useState([])
  const [personFilter, setPersonFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    fetchExpenses()
    const sub = supabase
      .channel('expenses1-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses1' }, () => {
        fetchExpenses()
      })
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [])

  async function fetchExpenses() {
    const { data, error } = await supabase
      .from('expenses1')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setAllExpenses(data)
      setExpenses(data)
    }
  }

  function applyFilters() {
    let filtered = [...allExpenses]
    if (personFilter) {
      filtered = filtered.filter((exp) =>
        exp.person.toLowerCase().includes(personFilter.toLowerCase())
      )
    }
    if (fromDate) {
      filtered = filtered.filter((exp) =>
        new Date(exp.created_at) >= new Date(fromDate)
      )
    }
    if (toDate) {
      filtered = filtered.filter((exp) =>
        new Date(exp.created_at) <= new Date(toDate)
      )
    }
    setExpenses(filtered)
  }

  function exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(expenses)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, 'room-expenses.xlsx')
  }

  function handleEdit(exp) {
    const newDescription = prompt("Edit description:", exp.description)
    const newAmount = prompt("Edit amount:", exp.amount)
    const newPerson = prompt("Edit person:", exp.person)

    if (newDescription && newAmount && newPerson) {
      updateExpense(exp.id, newDescription, newAmount, newPerson)
    }
  }

  async function updateExpense(id, description, amount, person) {
    const { error } = await supabase
      .from('expenses1')
      .update({ description, amount, person })
      .match({ id })

    if (error) {
      console.error("Error updating expense:", error)
      alert("Error: " + error.message)
    } else {
      alert("Expense updated!")
      fetchExpenses() // Refresh the table
    }
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm("Are you sure you want to delete this expense?")
    if (confirmDelete) {
      const { error } = await supabase.from('expenses1').delete().match({ id })
      if (error) {
        console.error("Error deleting expense:", error)
        alert("Error: " + error.message)
      } else {
        alert("Expense deleted!")
        fetchExpenses() // Refresh the table
      }
    }
  }

  return (
    <div>
      <h2>All Expenses</h2>

      {/* Export Button */}
      <button onClick={exportToExcel} style={{ marginBottom: '1rem' }}>
        Export to Excel
      </button>

      {/* Filter Section */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Filter by person"
          value={personFilter}
          onChange={(e) => setPersonFilter(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <button onClick={applyFilters}>Apply Filters</button>
      </div>

      {/* Expenses Table */}
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Person</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.description}</td>
              <td>₹{exp.amount}</td>
              <td>{exp.person}</td>
              <td>{new Date(exp.created_at).toLocaleString()}</td>
              <td>
                <button onClick={() => handleEdit(exp)}>Edit</button>
                <button onClick={() => handleDelete(exp.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
