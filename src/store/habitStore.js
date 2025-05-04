import { create } from 'zustand';
import * as THREE from 'three';

// Define color palettes (using THREE.Color for easier manipulation)
const palettes = {
  physical: ['#A3E4FF', '#B8E9FF', '#D1F0FF', '#EAF8FF', '#FFFFFF'].map(c => new THREE.Color(c)),
  mental: ['#9D65C9', '#B37FD4', '#CA99DE', '#E1B3E9', '#F8CDF3'].map(c => new THREE.Color(c)),
  creative: ['#FFD166', '#FFDA7A', '#FFE38F', '#FFECa3', '#FFF6b8'].map(c => new THREE.Color(c)),
  wellness: ['#2EC4B6', '#4FD1C1', '#6FDECC', '#90EBD6', '#B1F8E1'].map(c => new THREE.Color(c)),
  social: ['#F15BB5', '#F475C0', '#F78FCB', '#FAAAD6', '#FDD5E1'].map(c => new THREE.Color(c)),
};

// Helper to get a color based on category and potentially streak/stage
const getColor = (category = 'physical', stage = 0) => {
  const palette = palettes[category] || palettes.physical;
  return palette[Math.min(stage, palette.length - 1)];
};

// Spiral galaxy parameters
const GALAXY_ARMS = 3;
const GALAXY_RADIUS = 40;
const GALAXY_TIGHTNESS = 2.5; // How tightly wound the spirals are
const GALAXY_ARM_SEPARATION = (Math.PI * 2) / GALAXY_ARMS;

// Function to calculate position on a spiral arm
const getSpiralPosition = (index, totalHabits) => {
  const armIndex = index % GALAXY_ARMS;
  // Distribute habits somewhat evenly along arms
  const angleOffset = Math.floor(index / GALAXY_ARMS) * 0.5 / Math.sqrt(totalHabits + 1); // Adjust spread
  const baseAngle = armIndex * GALAXY_ARM_SEPARATION;

  // Calculate distance from center based on index (further out for later habits)
  // Use a non-linear distribution to make it look more natural
  const normalizedIndex = (index + 1) / (totalHabits + 1);
  const distanceFromCenter = Math.pow(normalizedIndex, 0.7) * GALAXY_RADIUS;

  // Calculate angle with spiral offset
  const angle = baseAngle + distanceFromCenter / (GALAXY_RADIUS * GALAXY_TIGHTNESS) + angleOffset;

  // Add some vertical variation
  const y = (Math.random() - 0.5) * 5 * (1 - distanceFromCenter / GALAXY_RADIUS); // Less variation further out

  const x = Math.cos(angle) * distanceFromCenter;
  const z = Math.sin(angle) * distanceFromCenter;

  return [x, y, z];
};


const useHabitStore = create((set, get) => ({
  habits: [
    // Initial dummy data - positions will be recalculated
    { id: 1, name: 'Morning Run', category: 'physical', streak: 5, stage: 0 },
    { id: 2, name: 'Read Tech Article', category: 'mental', streak: 12, stage: 1 },
    { id: 3, name: 'Sketch Idea', category: 'creative', streak: 25, stage: 2 },
    { id: 4, name: 'Meditate', category: 'wellness', streak: 65, stage: 3 },
    { id: 5, name: 'Call Family', category: 'social', streak: 2, stage: 0 },
  ],
  // Function to recalculate all positions (call after add/remove)
  recalculatePositions: () => set((state) => {
    const totalHabits = state.habits.length;
    return {
      habits: state.habits.map((habit, index) => ({
        ...habit,
        position: getSpiralPosition(index, totalHabits),
      })),
    };
  }),
  addHabit: (name, category) => {
    const newHabit = {
      id: Date.now(), // Simple unique ID
      name,
      category,
      streak: 0,
      stage: 0, // Start as nebula/basic
      position: [0, 0, 0], // Placeholder, will be recalculated
    };
    set((state) => ({ habits: [...state.habits, newHabit] }));
    get().recalculatePositions(); // Recalculate positions after adding
  },
  completeHabit: (id) => set((state) => ({
    habits: state.habits.map(habit => {
      if (habit.id === id) {
        const newStreak = habit.streak + 1;
        let newStage = habit.stage;
        // Evolution logic (simplified)
        if (newStreak >= 100 && habit.stage < 4) newStage = 4; // Phenomenon
        else if (newStreak >= 60 && habit.stage < 3) newStage = 3; // Planetary system
        else if (newStreak >= 21 && habit.stage < 2) newStage = 2; // Stable star
        else if (newStreak >= 7 && habit.stage < 1) newStage = 1; // Forming star

        return { ...habit, streak: newStreak, stage: newStage };
      }
      return habit;
    }),
  })),
  removeHabit: (id) => {
     set((state) => ({
       habits: state.habits.filter(habit => habit.id !== id)
     }));
     get().recalculatePositions(); // Recalculate after removing
  },
  getColor, // Expose the helper
}));

// Initial position calculation
useHabitStore.getState().recalculatePositions();

export default useHabitStore;
