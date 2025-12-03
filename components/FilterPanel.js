import { useState, useEffect, useRef, useMemo } from 'react';

export default function FilterPanel({
  allRecipes = [],
  difficultyOptions = ['easy', 'medium', 'hard'],
  initialTimeRange = { min: 0, max: 60 },
  onFilterChange
}) {
  // ---------------------------
  // INTERNAL STATE
  // ---------------------------
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]); // list of image slugs
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [maxTime, setMaxTime] = useState(initialTimeRange.max);

  const previousIngredients = useRef([]);

  // ---------------------------
  // HELPERS
  // ---------------------------
  const getRecipeIngredients = (rec) => {
    let ings = rec.ingredients;
    if (typeof ings === 'string') {
      try {
        ings = JSON.parse(ings);
      } catch {
        ings = [];
      }
    }
    return Array.isArray(ings) ? ings : [];
  };

  const getRecipeTime = (rec) => {
    if (typeof rec.total_time === 'number') return rec.total_time;
    if (typeof rec.cook_time === 'number') return rec.cook_time;
    return null;
  };

  // ---------------------------
  // INIT TIME RANGE FROM RECIPES
  // (runs when allRecipes first loads / changes)
  // ---------------------------
  useEffect(() => {
    if (!allRecipes.length) return;

    let minT = Infinity;
    let maxTLocal = 0;

    allRecipes.forEach((rec) => {
      const t = getRecipeTime(rec);
      if (typeof t === 'number') {
        if (t < minT) minT = t;
        if (t > maxTLocal) maxTLocal = t;
      }
    });

    if (minT === Infinity) minT = 0;
    if (maxTLocal === 0) maxTLocal = initialTimeRange.max ?? 60;

    setTimeRange({ min: minT, max: maxTLocal });
    setMaxTime(maxTLocal);
  }, [allRecipes, initialTimeRange.max]);

  // ---------------------------
  // BASE POOL: recipes that co-exist with filters
  //   - respect maxTime
  //   - contain ALL selected ingredient slugs (image)
  // ---------------------------
  const pool = useMemo(() => {
    if (!allRecipes.length) return [];

    return allRecipes.filter((rec) => {
      const t = getRecipeTime(rec);
      if (maxTime != null && typeof t === 'number' && t > maxTime) {
        return false;
      }

      if (selectedIngredients.length > 0) {
        const recImageSlugs = getRecipeIngredients(rec)
          .map((i) => i.image)
          .filter(Boolean);

        const hasAllSelected = selectedIngredients.every((slug) =>
          recImageSlugs.includes(slug)
        );
        if (!hasAllSelected) return false;
      }

      return true;
    });
  }, [allRecipes, selectedIngredients, maxTime]);

  // ---------------------------
  // AVAILABLE DIFFICULTY FROM POOL
  // (time + selectedIngredients applied; NOT selectedDifficulty)
  // ---------------------------
  const availableDifficulty = useMemo(() => {
    const diffState = { easy: false, medium: false, hard: false };

    pool.forEach((rec) => {
      const d = rec.difficulty?.toLowerCase();
      if (d && diffState[d] !== undefined) {
        diffState[d] = true;
      }
    });

    return diffState;
  }, [pool]);

  // ---------------------------
  // INGREDIENT OPTIONS (CO-EXIST LOGIC)
  //   - start from pool (time + ingredients)
  //   - optionally filter by selectedDifficulty
  //   - dedupe by image slug
  // ---------------------------
  const ingredientOptions = useMemo(() => {
    const ingMap = new Map();

    let source = pool;
    if (selectedDifficulty) {
      source = source.filter(
        (r) => r.difficulty?.toLowerCase() === selectedDifficulty
      );
    }

    source.forEach((rec) => {
      const ings = getRecipeIngredients(rec);
      ings.forEach((i) => {
        if (!i?.image) return;
        const key = i.image; // unique slug
        if (!ingMap.has(key)) {
          ingMap.set(key, {
            key,
            label: key.replace(/-/g, ' ')
          });
        }
      });
    });

    return Array.from(ingMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [pool, selectedDifficulty]);

  // ---------------------------
  // FILTERED INGREDIENTS (SEARCH)
  // ---------------------------
  const filteredIngredients = useMemo(
    () =>
      ingredientOptions.filter((i) =>
        i.label.toLowerCase().includes(ingredientSearch.toLowerCase())
      ),
    [ingredientOptions, ingredientSearch]
  );

  // ---------------------------
  // SEND FILTER CHANGES UP
  // ---------------------------
  useEffect(() => {
    onFilterChange({
      ingredients: selectedIngredients, // list of image slugs
      difficulty: selectedDifficulty,
      maxTime
    });
  }, [selectedIngredients, selectedDifficulty, maxTime, onFilterChange]);

  // ---------------------------
  // FADE-OUT ANIMATION FOR REMOVED PILLS
  // ---------------------------
  useEffect(() => {
    const prevKeys = previousIngredients.current.map((i) => i.key);
    const currKeys = ingredientOptions.map((i) => i.key);

    const removed = prevKeys.filter((key) => !currKeys.includes(key));

    removed.forEach((removedKey) => {
      const el = document.querySelector(
        `.vr-filter-pill[data-ing="${removedKey}"]`
      );
      if (el) {
        el.classList.add('vr-filter-pill--fade-out');
        setTimeout(() => {
          if (el && el.parentNode) el.parentNode.removeChild(el);
        }, 250);
      }
    });

    previousIngredients.current = ingredientOptions;
  }, [ingredientOptions]);

  // ---------------------------
  // CLEAR FILTERS
  // ---------------------------
  const clearFilters = () => {
    setSelectedIngredients([]);
    setSelectedDifficulty(null);
    setIngredientSearch('');
    setMaxTime(timeRange.max);
  };

  return (
    <div className='vr-filter-panel'>
      {/* SEARCH */}
      <div className='vr-filter-group'>
        <label className='vr-filter-label'>Search Ingredients</label>
        <input
          type='text'
          className='vr-filter-search'
          placeholder='Type to filter ingredients...'
          value={ingredientSearch}
          onChange={(e) => setIngredientSearch(e.target.value)}
        />
      </div>

      {/* INGREDIENT PILLS */}
      <div className='vr-filter-group'>
        <label className='vr-filter-label'>Ingredients</label>
        <div className='vr-filter-multiselect'>
          {filteredIngredients.map((ing) => (
            <button
              key={ing.key}
              data-ing={ing.key}
              className={
                'vr-filter-pill vr-anim-pill ' +
                (selectedIngredients.includes(ing.key)
                  ? 'vr-filter-pill--active'
                  : '') +
                ' vr-filter-pill--fade-in'
              }
              onClick={() =>
                setSelectedIngredients((prev) =>
                  prev.includes(ing.key)
                    ? prev.filter((x) => x !== ing.key)
                    : [...prev, ing.key]
                )
              }
            >
              {ing.label}
            </button>
          ))}
        </div>
      </div>

      {/* DIFFICULTY */}
      <div className='vr-filter-group'>
        <label className='vr-filter-label'>Difficulty</label>
        <div className='vr-filter-multiselect vr-filter-difficulty'>
          {difficultyOptions
            .filter((d) => availableDifficulty[d])
            .map((diff) => (
              <button
                key={diff}
                className={
                  'vr-filter-pill ' +
                  (selectedDifficulty === diff ? 'vr-filter-pill--active' : '')
                }
                onClick={() =>
                  setSelectedDifficulty(
                    selectedDifficulty === diff ? null : diff
                  )
                }
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
        </div>
      </div>

      {/* TIME SLIDER */}
      <div className='vr-filter-group'>
        <label className='vr-filter-label'>
          Max Cook Time:
          <span className='vr-filter-label__value'> {maxTime} min</span>
        </label>

        <input
          type='range'
          className='vr-slider'
          min={timeRange.min}
          max={timeRange.max}
          step='5'
          value={maxTime}
          onChange={(e) => setMaxTime(Number(e.target.value))}
        />

        <div className='vr-filter-slider__scale'>
          <span>{timeRange.min} min</span>
          <span>{timeRange.max} min</span>
        </div>
      </div>

      {/* CLEAR */}
      <div className='vr-filter-actions vr-filter-actions--sticky'>
        <button
          className='vr-meal-planner__clear'
          onClick={clearFilters}
        >
          Clear Filter
        </button>
      </div>
    </div>
  );
}
