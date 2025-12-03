import { createContext, useContext, useEffect, useState } from 'react';

const MealPlannerContext = createContext();

const STORAGE_KEY = 'vr-meal-planner-items';
const CHECKED_KEY = 'vr-meal-planner-checked'; // New storage key

export function MealPlannerProvider({ children }) {
  const [plannerItems, setPlannerItems] = useState([]);
  const [checkedIngredients, setCheckedIngredients] = useState([]); // Store checked names
  const [isInitialized, setIsInitialized] = useState(false);

  // -----------------------------------------------------
  // LOAD FROM LOCAL STORAGE
  // -----------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Load Items
      const rawItems = window.localStorage.getItem(STORAGE_KEY);
      if (rawItems) {
        const parsed = JSON.parse(rawItems);
        if (Array.isArray(parsed)) setPlannerItems(parsed);
      }

      // Load Checked State
      const rawChecked = window.localStorage.getItem(CHECKED_KEY);
      if (rawChecked) {
        const parsed = JSON.parse(rawChecked);
        if (Array.isArray(parsed)) setCheckedIngredients(parsed);
      }
    } catch (err) {
      console.error('Failed to load planner:', err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // -----------------------------------------------------
  // SAVE TO LOCAL STORAGE
  // -----------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plannerItems));
      window.localStorage.setItem(
        CHECKED_KEY,
        JSON.stringify(checkedIngredients)
      );
    } catch (err) {
      console.error('Failed to save planner:', err);
    }
  }, [plannerItems, checkedIngredients, isInitialized]);

  // -----------------------------------------------------
  // ACTIONS
  // -----------------------------------------------------
  const addRecipeToPlanner = (recipe) => {
    setPlannerItems((prev) => {
      if (prev.some((p) => p.id === recipe.id)) return prev;
      return [
        ...prev,
        {
          id: recipe.id,
          slug: recipe.slug,
          title: recipe.title,
          cuisine: recipe.cuisine,
          ingredients: recipe.ingredients,
          includeIngredients: true
        }
      ];
    });
  };

  const removeRecipeFromPlanner = (id) => {
    setPlannerItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleIncludeIngredients = (id) => {
    setPlannerItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, includeIngredients: !item.includeIngredients }
          : item
      )
    );
  };

  // NEW: Toggle Checkmark for Ingredient
  const toggleIngredientCheck = (ingredientName) => {
    setCheckedIngredients((prev) => {
      const name = ingredientName.trim().toLowerCase();
      if (prev.includes(name)) {
        return prev.filter((i) => i !== name);
      }
      return [...prev, name];
    });
  };

  const clearPlanner = () => {
    setPlannerItems([]);
    setCheckedIngredients([]);
  };

  const isInPlanner = (id) => {
    return plannerItems.some((item) => item.id === id);
  };

  return (
    <MealPlannerContext.Provider
      value={{
        plannerItems,
        checkedIngredients, // Export state
        toggleIngredientCheck, // Export action
        addRecipeToPlanner,
        removeRecipeFromPlanner,
        toggleIncludeIngredients,
        clearPlanner,
        isInPlanner
      }}
    >
      {children}
    </MealPlannerContext.Provider>
  );
}

export const useMealPlanner = () => useContext(MealPlannerContext);
