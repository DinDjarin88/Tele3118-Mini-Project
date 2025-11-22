import React, { useEffect, useMemo, useState } from "react";

// Backend constant retained
const BACKEND_BASE =
  process.env.REACT_APP_BACKEND_BASE || "http://localhost:8000";

// Hook for list logic
function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${BACKEND_BASE}/api/studentlist`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const normalized = Array.isArray(data)
        ? data.map((s) => ({ name: s.name, mark: Number(s.mark) }))
        : [];
      setStudents(normalized);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const stats = useMemo(() => {
    if (students.length === 0) return { count: 0, avg: 0, max: null, min: null };
    const marks = students.map((s) => Number(s.mark) || 0);
    const sum = marks.reduce((a, b) => a + b, 0);
    const avg = sum / marks.length;
    const max = Math.max(...marks);
    const min = Math.min(...marks);
    return { count: students.length, avg, max, min };
  }, [students]);

  return { students, loading, err, refresh, stats };
}

// Add student form
function AddStudentForm({ onSaved }) {
  const [name, setName] = useState("");
  const [mark, setMark] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const payload = { student: name.trim(), mark: Number(mark) };
      const res = await fetch(`${BACKEND_BASE}/api/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      setMsg("Saved successfully");
      setName("");
      setMark("");
      onSaved?.();
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div>
        <label>
          Name:
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            maxLength={16}
          />
        </label>
      </div>
      <div>
        <label>
          Mark:
          <input
            type="number"
            value={mark}
            onChange={e => setMark(e.target.value)}
            required
            min={0}
          />
        </label>
      </div>
      <div>
        <button type="submit" disabled={busy}>
          {busy ? "Saving..." : "Save"}
        </button>
      </div>
      {msg && <div>{msg}</div>}
    </form>
  );
}

// Lookup form Element
function LookupForm() {

  //query variable stores the user input, initialluy set to empty (useState Hooks)
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  //sends the request as soon as submitted and 
  const search = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setResult(null);


    //Try Catch Blocks to catch any errors if they are thrown 
    try {
      const res = await fetch(
        `${BACKEND_BASE}/api/studentmark/${encodeURIComponent(query.trim())}`
      );
      if (res.status === 404) {
        setMsg("Not found");
      } else if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      } else {
        const data = await res.json();
        setResult(data);
      }
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };


  //Once form is submitted, it will return the students needed to be returned
  return (
    <form onSubmit={search}>
      <div>
        <input
          placeholder="Enter student name"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div>
        <button type="submit" disabled={busy}>
          {busy ? "Searching..." : "Search"}
        </button>
      </div>
      {msg && <div>{msg}</div>}
      {result && (
        <div>
          <div>Name: {result.name}</div>
          <div>Mark: {result.mark}</div>
        </div>
      )}
    </form>
  );
}

// Table of students element
function StudentsTable({ students }) {
  // If
  if (!students?.length) return <div>No students yet.</div>;
  const sorted = [...students].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" })
  );
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Mark</th>
        </tr>
      </thead>
      <tbody>
        {/* Table mapes all the names and marks to each row */}
        {sorted.map((s) => (
          <tr key={s.name}>
            <td>{s.name}</td>
            <td>{s.mark}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Main app
export default function App() {
  const { students, loading, err, refresh, stats } = useStudents();

  return (
    <div>
      <h1>TELE3118 Student Marks</h1>
      <div>Backend base: {BACKEND_BASE}</div>

      <h2>Add/Update Student</h2>
      <AddStudentForm onSaved={refresh} />

      <h2>Lookup Student</h2>
      <LookupForm />


      {/* Calls the refresh function when the button is pressed on the frontend */}
      <h2>Students</h2>
      <button onClick={refresh}>Refresh</button>
      {loading && <div>Loading...</div>}
      {err && <div style={{ color: "red" }}>Error: {err}</div>}
      {!loading && !err && <StudentsTable students={students} />}


      {/* Renders the summary, if stats are undefined, then uses - instead */}
      <h2>Summary</h2>
      <ul>
        <li>Total: {stats.count}</li>
        <li>Average: {stats.avg.toFixed(2)}</li>
        <li>Max: {stats.max ?? "-"}</li>
        <li>Min: {stats.min ?? "-"}</li>
      </ul>
    </div>
  );
}
