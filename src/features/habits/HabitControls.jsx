import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addHabit, selectAllHabits } from './habitsSlice'; // Import action and selector
// Use styles from App.css or create specific ones
// import './HabitControls.css';

function HabitControls() {
  const dispatch = useDispatch();
  const habits = useSelector(selectAllHabits); // Get habits to display count or list if needed
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('physical');

  const handleAddHabit = (e) => {
    e.preventDefault(); // Prevent form submission if wrapped in form
    if (newHabitName.trim()) {
      dispatch(addHabit(newHabitName, newHabitCategory));
      setNewHabitName('');
    }
  };

  return (
    // Use class from App.css or a new specific one
    <div className="controls-panel">
      <h2>Add New Habit</h2>
      <form onSubmit={handleAddHabit}>
        <div>
          <label htmlFor="habit-name">Name:</label>
          <input
            id="habit-name"
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="E.g., Morning Meditation"
            required
          />
        </div>
        <div>
          <label htmlFor="habit-category">Category:</label>
          <select
             id="habit-category"
             value={newHabitCategory}
             onChange={(e) => setNewHabitCategory(e.target.value)}
          >
            <option value="physical">Physical (Blue Star)</option>
            <option value="mental">Mental (Purple Nebula)</option>
            <option value="creative">Creative (Golden Dust)</option>
            <option value="wellness">Wellness (Green Gas)</option>
            <option value="social">Social (Pink Nursery)</option>
          </select>
        </div>
        <button type="submit">✨ Add Celestial Body</button>
      </form>

      {/* Optional: Display habit list or count */}
      {/*
      <h2>Your Habits ({habits.length})</h2>
      <ul>
        {habits.map(habit => (
          <li key={habit.id}>
            {habit.name} (Streak: {habit.streak})
          </li>
        ))}
      </ul>
      */}
    </div>
  );
}

export default HabitControls;
