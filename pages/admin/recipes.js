import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';

export default function RecipesAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [editingId, setEditingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  // Fetch a big chunk of recipes once (admin only)
  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const res = await fetch('/api/recipes?page=1&per_page=1000');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load recipes');
        setRows(json.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Determine columns dynamically from first row
  const columns = useMemo(() => {
    if (!rows.length) return [];
    const keys = Object.keys(rows[0]);
    // Ensure ID is always first
    return ['id', ...keys.filter((k) => k !== 'id')];
  }, [rows]);

  // Free-text search across ALL columns, any type
  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) =>
      columns.some((col) => {
        const val = row[col];
        if (val === null || typeof val === 'undefined') return false;
        if (typeof val === 'object') {
          try {
            return JSON.stringify(val).toLowerCase().includes(q);
          } catch {
            return false;
          }
        }
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [rows, columns, search]);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const startIndex = (page - 1) * perPage;
  const paginated = filtered.slice(startIndex, startIndex + perPage);

  // Reset to page 1 when search or perPage changes
  useEffect(() => {
    setPage(1);
  }, [search, perPage]);

  function handleEdit(row) {
    setEditingId(row.id);
    const draft = {};
    columns.forEach((col) => {
      const val = row[col];
      if (typeof val === 'object' && val !== null) {
        draft[col] = JSON.stringify(val, null, 2);
      } else if (typeof val === 'undefined' || val === null) {
        draft[col] = '';
      } else {
        draft[col] = String(val);
      }
    });
    setDrafts((prev) => ({ ...prev, [row.id]: draft }));
  }

  function handleDraftChange(id, col, value) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [col]: value
      }
    }));
  }

  function handleCancel() {
    setEditingId(null);
  }

  async function handleSave(id) {
    const draft = drafts[id];
    if (!draft) return;

    const payload = {};
    columns.forEach((col) => {
      if (col === 'id') return;

      const original = rows.find((r) => r.id === id)?.[col];
      const raw = draft[col];

      if (typeof original === 'object' && original !== null) {
        // JSON columns: parse from textarea
        try {
          payload[col] = raw ? JSON.parse(raw) : null;
        } catch (e) {
          alert(`Column "${col}" must be valid JSON.\n\n${e.message}`);
          throw e;
        }
      } else if (typeof original === 'number') {
        const num = Number(raw);
        if (Number.isNaN(num)) {
          alert(`Column "${col}" must be a number.`);
          throw new Error(`Invalid number for ${col}`);
        }
        payload[col] = num;
      } else if (typeof original === 'boolean') {
        payload[col] = raw === 'true' || raw === true;
      } else {
        payload[col] = raw;
      }
    });

    try {
      setLoading(true);
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to update recipe');
      }

      const updatedRow = json.data;
      setRows((prev) => prev.map((r) => (r.id === id ? updatedRow : r)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      if (!err.message.startsWith('Invalid')) {
        alert(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Copies the ID and the specific column content for ALL visible rows (filtered).
   * Formats it specifically for AI context usage.
   */
  async function handleCopyColumn(col) {
    // We use 'filtered' instead of 'rows' so the copy respects your search bar results.
    // If you want absolutely everything regardless of search, swap 'filtered' with 'rows'.
    const textData = filtered
      .map((row) => {
        let val = row[col];
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        } else if (val === undefined || val === null) {
          val = 'N/A';
        }

        return `RECIPE_ID: ${row.id}\n${col.toUpperCase()}: ${val}`;
      })
      .join('\n\n----------------------------------------\n\n');

    try {
      await navigator.clipboard.writeText(textData);
      alert(
        `Copied "${col}" data for ${filtered.length} recipes to clipboard.\n\nReady to paste into Chat AI!`
      );
    } catch (err) {
      console.error('Failed to copy', err);
      alert('Failed to copy to clipboard');
    }
  }

  return (
    <>
      <Head>
        <title>Recipe Admin</title>
      </Head>
      <section className='vr-admin'>
        <header className='vr-admin__header'>
          <h1 className='vr-admin__title'>Recipes Admin</h1>
          <p className='vr-admin__subtitle'>
            Local-only editor for the <code>recipes</code> table.
          </p>
        </header>

        <div className='vr-admin__toolbar'>
          <input
            type='text'
            className='vr-admin__search'
            placeholder='Search in any column...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <p className='vr-admin__error'>{error}</p>}
        {loading && !rows.length && (
          <p className='vr-admin__status'>Loading recipes...</p>
        )}
        {!loading && !rows.length && !error && (
          <p className='vr-admin__status'>No recipes found.</p>
        )}

        {rows.length > 0 && (
          <>
            <div className='vr-admin__table-wrapper'>
              <table className='vr-admin__table'>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px'
                          }}
                        >
                          <span>{col}</span>
                          <button
                            type='button'
                            title={`Copy all ${col} data for AI`}
                            onClick={() => handleCopyColumn(col)}
                            style={{
                              background: 'none',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              padding: '2px 6px'
                            }}
                          >
                            📋
                          </button>
                        </div>
                      </th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row) => {
                    const isEditing = row.id === editingId;
                    const draft = drafts[row.id] || {};

                    return (
                      <tr
                        key={row.id}
                        className={isEditing ? 'vr-admin__row--editing' : ''}
                      >
                        {columns.map((col) => {
                          const original = row[col];
                          const value = isEditing
                            ? draft[col]
                            : typeof original === 'object' && original !== null
                            ? JSON.stringify(original)
                            : original ?? '';

                          const isObject =
                            typeof original === 'object' && original !== null;

                          return (
                            <td key={col}>
                              {isObject ? (
                                <textarea
                                  className='vr-admin__input vr-admin__input--textarea'
                                  disabled={!isEditing}
                                  value={value}
                                  onChange={(e) =>
                                    handleDraftChange(
                                      row.id,
                                      col,
                                      e.target.value
                                    )
                                  }
                                  rows={4}
                                />
                              ) : (
                                <input
                                  className='vr-admin__input'
                                  type='text'
                                  disabled={!isEditing}
                                  value={value}
                                  onChange={(e) =>
                                    handleDraftChange(
                                      row.id,
                                      col,
                                      e.target.value
                                    )
                                  }
                                />
                              )}
                            </td>
                          );
                        })}
                        <td className='vr-admin__actions'>
                          {isEditing ? (
                            <>
                              <button
                                type='button'
                                className='vr-admin__btn'
                                onClick={() => handleSave(row.id)}
                                disabled={loading}
                              >
                                Save
                              </button>
                              <button
                                type='button'
                                className='vr-admin__btn'
                                onClick={handleCancel}
                                disabled={loading}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type='button'
                              className='vr-admin__btn'
                              onClick={() => handleEdit(row)}
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className='vr-admin__pagination'>
              <button
                type='button'
                className='vr-admin__btn'
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className='vr-admin__page-info'>
                Page {page} of {totalPages} ({filtered.length} records)
              </span>
              <label className='vr-admin__per-page'>
                Per page:
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>
              <button
                type='button'
                className='vr-admin__btn'
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}

// 🔒 Only render this page on localhost (and not in production)
export async function getServerSideProps(context) {
  const host = context.req.headers.host || '';
  const isLocalhost = host.startsWith('localhost');

  if (process.env.NODE_ENV === 'production' || !isLocalhost) {
    return {
      notFound: true
    };
  }

  return { props: {} };
}
