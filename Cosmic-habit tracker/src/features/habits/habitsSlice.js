import { createSlice, createSelector } from '@reduxjs/toolkit';
import * as THREE from 'three';

// --- NEW Color Palettes (Vibrant Cosmic Theme) ---
const palettes = {
  // Deep Blues / Cyan / White Highlights
  physical: ['#0d3b66', '#2a6f97', '#61a5c2', '#a9d6e5', '#ffffff'],
  // Indigo / Deep Purple / Magenta Flashes
  mental: ['#480ca8', '#7209b7', '#b5179e', '#f72585', '#ff75a0'],
  // Intense Orange / Fiery Red / Golden Yellow
  creative: ['#ff8c00', '#ff6700', '#ff4500', '#ffd700', '#fffacd'],
  // Ethereal Teal / Seafoam Green / Light Blue Hints
  wellness: ['#00a896', '#02c39a', '#48cae4', '#90e0ef', '#caf0f8'],
  // Vibrant Pink / Deep Violet / Warm Magenta
  social: ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d'], // Example: Using a warmer, more diverse palette for social
  // Alternative Social (Pink/Violet focus):
  // social: ['#d00000', '#e85d04', '#faa307', '#ffba08', '#9d4edd'], // Another vibrant option
  // social: ['#ff006e', '#ff4d9e', '#ff85c8', '#ffb3e0', '#ffd6f0'], // Pink focus
};


// --- Spiral Galaxy Positioning Logic ---
const GALAXY_ARMS = 3;
const GALAXY_RADIUS = 40;
const GALAXY_TIGHTNESS = 2.5;
const GALAXY_ARM_SEPARATION = (Math.PI * 2) / GALAXY_ARMS;

const getSpiralPosition = (index, totalHabits) => {
  const safeTotalHabits = Math.max(totalHabits, 1);
  const armIndex = index % GALAXY_ARMS;
  const angleOffset = Math.floor(index / GALAXY_ARMS) * 0.5 / Math.sqrt(safeTotalHabits);
  const baseAngle = armIndex * GALAXY_ARM_SEPARATION;
  const normalizedIndex = totalHabits > 0 ? (index + 1) / totalHabits : 0;
  const distanceFromCenter = Math.pow(normalizedIndex, 0.7) * GALAXY_RADIUS;
  const angle = baseAngle + distanceFromCenter / (GALAXY_RADIUS * GALAXY_TIGHTNESS) + angleOffset;
  const y = (Math.random() - 0.5) * 5 * (1 - distanceFromCenter / GALAXY_RADIUS);
  const x = Math.cos(angle) * distanceFromCenter;
  const z = Math.sin(angle) * distanceFromCenter;
  return [x, y, z];
};

// --- Initial State ---
const initialState = {
  items: [
    { id: 1, name: 'Morning Run', category: 'physical', streak: 5, stage: 0, position: [0,0,0] },
    { id: 2, name: 'Read Tech Article', category: 'mental', streak: 12, stage: 1, position: [0,0,0] },
    { id: 3, name: 'Sketch Idea', category: 'creative', streak: 25, stage: 2, position: [0,0,0] },
    { id: 4, name: 'Meditate', category: 'wellness', streak: 65, stage: 3, position: [0,0,0] },
    { id: 5, name: 'Call Family', category: 'social', streak: 2, stage: 0, position: [0,0,0] },
  ],
};

// --- Slice Definition ---
const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    addHabit: {
      reducer(state, action) {
        if (!Array.isArray(state.items)) {
            state.items = [];
        }
        state.items.push(action.payload);
        const totalHabits = state.items.length;
        state.items.forEach((habit, index) => {
          habit.position = getSpiralPosition(index, totalHabits);
        });
      },
      prepare(name, category) {
        return {
          payload: {
            id: Date.now(),
            name,
            category,
            streak: 0,
            stage: 0,
            position: [0, 0, 0],
          }
        }
      }
    },
    completeHabit(state, action) {
      if (!Array.isArray(state.items)) return;
      const habit = state.items.find(h => h.id === action.payload.id);
      if (habit) {
        habit.streak += 1;
        if (habit.streak >= 100 && habit.stage < 4) habit.stage = 4;
        else if (habit.streak >= 60 && habit.stage < 3) habit.stage = 3;
        else if (habit.streak >= 21 && habit.stage < 2) habit.stage = 2;
        else if (habit.streak >= 7 && habit.stage < 1) habit.stage = 1;
      }
    },
    removeHabit(state, action) {
        if (!Array.isArray(state.items)) return;
        state.items = state.items.filter(h => h.id !== action.payload.id);
        const totalHabits = state.items.length;
        state.items.forEach((habit, index) => {
          habit.position = getSpiralPosition(index, totalHabits);
        });
    },
    recalculateAllPositions(state) {
        if (!Array.isArray(state.items)) {
            console.warn("recalculateAllPositions called but state.items is not an array:", state.items);
            return;
        }
        const totalHabits = state.items.length;
        state.items.forEach((habit, index) => {
          if (habit) {
             habit.position = getSpiralPosition(index, totalHabits);
          }
        });
    }
  }
});

// --- Actions ---
export const { addHabit, completeHabit, removeHabit, recalculateAllPositions } = habitsSlice.actions;

// --- Selectors ---
export const selectAllHabits = (state) => state.habits.items || [];

export const selectHabitColor = createSelector(
  [
    (state, category) => category,
    (state, category, stage) => stage
  ],
  (category = 'physical', stage = 0) => {
    // Use the updated palettes
    const palette = palettes[category] || palettes.physical;
    // Ensure stage index is within bounds
    const colorIndex = Math.min(Math.max(stage, 0), palette.length - 1);
    return palette[colorIndex];
  }
);

export const selectHabitThreeColor = createSelector(
  [selectHabitColor],
  (hexColor) => new THREE.Color(hexColor)
);

// --- Reducer Export ---
export default habitsSlice.reducer;
