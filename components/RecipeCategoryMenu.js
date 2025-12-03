// components/RecipeCategoryMenu.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from './UserContext';
import { FiMoreVertical, FiPlus, FiLogIn, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';

const SYSTEM_CATEGORIES = [
  { name: 'Favorites', slug: 'favorites' },
  { name: 'Christmas', slug: 'christmas' },
  { name: 'Thanksgiving', slug: 'thanksgiving' }
];

const SYSTEM_ORDER = ['favorites', 'christmas', 'thanksgiving'];

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function RecipeCategoryMenu({ recipeId }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const recipeKey = String(recipeId || '');

  // ------------------------------------------------
  // Close other menus
  // ------------------------------------------------
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.id !== recipeId) setOpen(false);
    };
    window.addEventListener('vr-menu-opened', handler);
    return () => window.removeEventListener('vr-menu-opened', handler);
  }, [recipeId]);

  // ------------------------------------------------
  // Toggle menu
  // ------------------------------------------------
  const toggleMenu = (e) => {
    e.stopPropagation();
    if (!open) {
      window.dispatchEvent(
        new CustomEvent('vr-menu-opened', { detail: { id: recipeId } })
      );
    }
    setOpen(!open);
  };

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const clickOutside = () => setOpen(false);
    window.addEventListener('click', clickOutside);
    return () => window.removeEventListener('click', clickOutside);
  }, [open]);

  // ------------------------------------------------
  // Load collections
  // ------------------------------------------------
  useEffect(() => {
    if (!user || !open) return;
    loadCollections();
  }, [user, open]);

  async function loadCollections() {
    if (!user) return;
    setLoading(true);

    try {
      let { data, error } = await supabase
        .from('user_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      let cols = data || [];

      // add missing system categories
      const missing = SYSTEM_CATEGORIES.filter(
        (sys) => !cols.some((x) => x.slug === sys.slug)
      );

      if (missing.length > 0) {
        const { data: inserted } = await supabase
          .from('user_collections')
          .insert(
            missing.map((m) => ({
              user_id: user.id,
              name: m.name,
              slug: m.slug,
              is_system: true,
              recipes: []
            }))
          )
          .select();

        cols = [...cols, ...(inserted || [])];
      }

      // normalize recipe IDs
      cols = cols.map((c) => ({
        ...c,
        recipes: Array.isArray(c.recipes)
          ? c.recipes.map((id) => String(id))
          : []
      }));

      // sorting
      cols.sort((a, b) => {
        const aIndex = SYSTEM_ORDER.indexOf(a.slug);
        const bIndex = SYSTEM_ORDER.indexOf(b.slug);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

      setCollections(cols);
    } catch (err) {
      console.error('loadCollections error:', err);
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------
  // Toggle recipe inside category
  // ------------------------------------------------
  async function toggleCollection(col) {
    if (!user) return;

    setSaving(true);
    try {
      const current = col.recipes.map((x) => String(x));
      const exists = current.includes(recipeKey);
      const next = exists
        ? current.filter((x) => x !== recipeKey)
        : [...current, recipeKey];

      const { error } = await supabase
        .from('user_collections')
        .update({ recipes: next })
        .eq('id', col.id)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadCollections();
    } catch (err) {
      console.error('toggleCollection error:', err);
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------------------------
  // DELETE CATEGORY (RESTORED)
  // ------------------------------------------------
  async function deleteCollection(col) {
    if (!user) return;
    if (col.is_system) return; // NEVER delete system categories

    const yes = confirm(
      `Delete the "${col.name}" category?\nThis will NOT delete the recipes, only remove this custom category.`
    );
    if (!yes) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('user_collections')
        .delete()
        .eq('id', col.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // reload
      await loadCollections();
    } catch (err) {
      console.error('deleteCollection error:', err);
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------------------------
  // Create new category
  // ------------------------------------------------
  async function handleCreateCollection(e) {
    e.preventDefault();
    if (!user) return;

    const name = newName.trim();
    if (!name) return;

    const slug = slugify(name);

    const duplicate = collections.some(
      (c) => c.slug === slug || c.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      alert('A category with that name already exists.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await supabase
        .from('user_collections')
        .insert({
          user_id: user.id,
          name,
          slug,
          is_system: false,
          recipes: []
        })
        .select()
        .single();

      const updated = [...collections, data];

      // Keep ordering
      updated.sort((a, b) => {
        const aIndex = SYSTEM_ORDER.indexOf(a.slug);
        const bIndex = SYSTEM_ORDER.indexOf(b.slug);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

      setCollections(updated);
      setNewName('');
    } catch (err) {
      console.error('createCollection error:', err);
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------
  return (
    <div className='vr-recipe-card__menu'>
      <button
        type='button'
        className='vr-recipe-card__menu-btn'
        onClick={toggleMenu}
      >
        <FiMoreVertical />
      </button>

      {open && (
        <div
          className='vr-recipe-card__menu-panel'
          onClick={(e) => e.stopPropagation()}
        >
          <div className='vr-recipe-card__menu-header'>
            <span>Save to category</span>
            <button
              type='button'
              className='vr-recipe-card__menu-close'
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          {!user ? (
            <div className='vr-recipe-card__menu-guest'>
              <p>Sign in to save recipes to categories.</p>
              <Link
                href='/profile'
                className='vr-btn--guest'
              >
                Sign In / Up
              </Link>
            </div>
          ) : (
            <>
              {loading ? (
                <div className='vr-recipe-card__menu-loading'>Loading…</div>
              ) : (
                <div className='vr-recipe-card__menu-list'>
                  {/* CATEGORY LIST */}
                  {collections.map((col) => (
                    <div
                      key={col.id}
                      className='vr-recipe-card__menu-item-row'
                    >
                      <label className='vr-recipe-card__menu-item'>
                        <input
                          type='checkbox'
                          checked={col.recipes.some(
                            (id) => String(id) === recipeKey
                          )}
                          onChange={() => toggleCollection(col)}
                          disabled={saving}
                        />
                        <span>{col.name}</span>
                      </label>

                      {/* DELETE ICON (Only for custom categories) */}
                      {!col.is_system && (
                        <button
                          type='button'
                          className='vr-recipe-card__menu-delete'
                          onClick={() => deleteCollection(col)}
                          disabled={saving}
                          aria-label='Delete Category'
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}

                  {collections.length === 0 && (
                    <p className='vr-recipe-card__menu-empty'>
                      No categories yet. Create one below.
                    </p>
                  )}
                </div>
              )}

              {/* CREATE NEW CATEGORY */}
              <form
                className='vr-recipe-card__menu-new'
                onSubmit={handleCreateCollection}
              >
                <input
                  type='text'
                  placeholder='New category name'
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button
                  type='submit'
                  disabled={saving}
                >
                  <FiPlus />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
