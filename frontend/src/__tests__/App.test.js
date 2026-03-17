import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from '../App';

jest.mock('axios');

const mockTasks = [
  { id: 1, title: 'Task 1', description: 'Desc 1', completed: false },
  { id: 2, title: 'Task 2', description: 'Desc 2', completed: true },
];

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task list', async () => {
    axios.get.mockResolvedValueOnce({ data: mockTasks });
    render(<App />);

    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    const newTask = { id: 3, title: 'New Task', description: '', completed: false };
    const updatedTasks = [...mockTasks, newTask];

    axios.get.mockResolvedValueOnce({ data: mockTasks });
    axios.post.mockResolvedValueOnce({ data: newTask });
    axios.get.mockResolvedValueOnce({ data: updatedTasks });

    render(<App />);

    const titleInput = screen.getByPlaceholderText('Task title');
    const addButton = screen.getByText('Add Task');

    await userEvent.type(titleInput, 'New Task');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  test('toggles task completion', async () => {
    // Task 1 starts as incomplete (shows "Complete"), Task 2 starts as complete (shows "Undo")
    const initialTasks = [
      { id: 1, title: 'Task 1', description: 'Desc 1', completed: false },
      { id: 2, title: 'Task 2', description: 'Desc 2', completed: true },
    ];
    
    // After toggling Task 1, it becomes complete
    const updatedTask = { ...initialTasks[0], completed: true };
    const updatedTasks = [updatedTask, initialTasks[1]];

    // Mock the sequence of API calls
    axios.get.mockResolvedValueOnce({ data: initialTasks });  // Initial render
    
    render(<App />);

    // Wait for initial render and verify Task 1 has "Complete" button
    await waitFor(() => {
      const completeButtons = screen.getAllByText('Complete');
      expect(completeButtons).toHaveLength(1); // Only Task 1 shows "Complete"
      expect(screen.getAllByText('Undo')).toHaveLength(1); // Only Task 2 shows "Undo"
    });

    // Set up mocks for the toggle action
    axios.put.mockResolvedValueOnce({ data: updatedTask });
    axios.get.mockResolvedValueOnce({ data: updatedTasks });

    // Click the "Complete" button for Task 1
    const completeButton = screen.getByText('Complete');
    await userEvent.click(completeButton);

    // After toggling, Task 1 should now show "Undo" and Task 2 still shows "Undo"
    await waitFor(() => {
      const undoButtons = screen.getAllByText('Undo');
      expect(undoButtons).toHaveLength(2); // Both tasks now show "Undo"
      expect(screen.queryByText('Complete')).not.toBeInTheDocument();
    });
  });

  test('deletes a task', async () => {
    const remainingTasks = [mockTasks[1]]; // after deleting task 1

    axios.get.mockResolvedValueOnce({ data: mockTasks });
    axios.delete.mockResolvedValueOnce({});
    axios.get.mockResolvedValueOnce({ data: remainingTasks });

    render(<App />);

    const deleteButtons = await screen.findAllByText('Delete');
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });
});
