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
    jest.clearAllMocks(); // Clear mock call history between tests
  });

  test('renders task list', async () => {
    axios.get.mockResolvedValueOnce({ data: mockTasks }); // Only one GET on mount
    render(<App />);

    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    const newTask = { id: 3, title: 'New Task', description: '', completed: false };
    const updatedTasks = [...mockTasks, newTask];

    // Simulate: mount GET → POST → re-fetch GET
    axios.get.mockResolvedValueOnce({ data: mockTasks });       // initial render
    axios.post.mockResolvedValueOnce({ data: newTask });        // add task
    axios.get.mockResolvedValueOnce({ data: updatedTasks });    // re-fetch after add

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
    const updatedTask = { ...mockTasks[0], completed: true };
    const updatedTasks = [updatedTask, mockTasks[1]];

    // Simulate: mount GET → PUT → re-fetch GET
    axios.get.mockResolvedValueOnce({ data: mockTasks });       // initial render
    axios.put.mockResolvedValueOnce({ data: updatedTask });     // toggle task
    axios.get.mockResolvedValueOnce({ data: updatedTasks });    // re-fetch after toggle

    render(<App />);

    // Wait for the "Complete" button (only task 1 has it initially)
    const completeButton = await screen.findByText('Complete', {}, { timeout: 5000 });
    await userEvent.click(completeButton);

    // After toggling, the button should become "Undo"
    await waitFor(() => {
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });
  });

  test('deletes a task', async () => {
    const remainingTasks = [mockTasks[1]]; // after deleting task 1

    // Simulate: mount GET → DELETE → re-fetch GET
    axios.get.mockResolvedValueOnce({ data: mockTasks });       // initial render
    axios.delete.mockResolvedValueOnce({});                      // delete task
    axios.get.mockResolvedValueOnce({ data: remainingTasks });   // re-fetch after delete

    render(<App />);

    const deleteButtons = await screen.findAllByText('Delete');
    await userEvent.click(deleteButtons[0]); // delete first task

    await waitFor(() => {
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    });
  });
});
