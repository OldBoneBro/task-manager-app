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
    axios.get.mockResolvedValue({ data: mockTasks });
  });

  test('renders task list', async () => {
    render(<App />);
    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    axios.post.mockResolvedValue({ data: { id: 3, title: 'New Task', description: '', completed: false } });
    axios.get.mockResolvedValue({ data: [...mockTasks, { id: 3, title: 'New Task', description: '', completed: false }] });

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
    axios.put.mockResolvedValue({ data: { ...mockTasks[0], completed: true } });
    axios.get.mockResolvedValue({ data: [{ ...mockTasks[0], completed: true }, mockTasks[1]] });

    render(<App />);
    
    const completeButton = await screen.findAllByText('Complete');
    await userEvent.click(completeButton[0]);

    await waitFor(() => {
      expect(screen.getByText('Undo')).toBeInTheDocument(); // button changes to Undo
    });
  });

  test('deletes a task', async () => {
    axios.delete.mockResolvedValue({});
    axios.get.mockResolvedValue({ data: [mockTasks[1]] }); // after delete, only task 2 remains

    render(<App />);
    
    const deleteButtons = await screen.findAllByText('Delete');
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    });
  });
});
