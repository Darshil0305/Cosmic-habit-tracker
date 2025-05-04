import React, { useState } from 'react';
import useHabitStore from '../store/habitStore';

function Hud() {
  const { habits, addHabit } = useHabitStore(); // Removed completeHabit, interaction is 3D
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('physical');

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addHabit(newHabitName, newHabitCategory);
      setNewHabitName('');
      // Add sound/visual feedback here later
    }
  };

  return (
    <div className="hud">
      <h1>Cosmic Habit Tracker</h1>
      <div>
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="New Habit Name"
          aria-label="New Habit Name"
        />
        <select
           value={newHabitCategory}
           onChange={(e) => setNewHabitCategory(e.target.value)}
           aria-label="Habit Category"
        >
          <option value="physical">Physical (Blue Star)</option>
          <option value="mental">Mental (Purple Nebula)</option>
          <option value="creative">Creative (Golden Dust)</option>
          <option value="wellness">Wellness (Green Gas)</option>
          <option value="social">Social (Pink Nursery)</option>
        </select>
        <button onClick={handleAddHabit}>✨ Add New Celestial Body</button>
      </div>
      <h2>Your Galaxy</h2>
      <ul>
        {habits.length === 0 && <li>Your universe awaits creation...</li>}
        {habits.map(habit => (
          <li key={habit.id} style={{ borderLeft: `3px solid ${useHabitStore.getState().getColor(habit.category, habit.stage).getStyle()}` }}>
            {habit.name} ({habit.category}) - Streak: {habit.streak} [Stage {habit.stage}]
            {/* Add icons or mini previews later */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Hud;
