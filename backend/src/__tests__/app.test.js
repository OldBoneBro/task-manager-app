const request = require('supertest');
const { app, dbReady, pool } = require('../index');

beforeAll(async () => {
  // Wait for the database table to be created
  await dbReady();
});

beforeEach(async () => {
  // Clear the tasks table before each test
  const client = await pool.connect();
  try {
    if (process.env.NODE_ENV === 'test') {
      // Get current schema
      const schemaRes = await client.query('SHOW search_path');
      await client.query(`DELETE FROM tasks`);
    }
  } finally {
    client.release();
  }
});

afterAll(async () => {
  // Clean up test schema
  if (process.env.NODE_ENV === 'test') {
    const client = await pool.connect();
    try {
      const schemaRes = await client.query('SHOW search_path');
      const currentSchema = schemaRes.rows[0].search_path.split(',')[0].trim();
      if (currentSchema.startsWith('test_schema')) {
        await client.query(`DROP SCHEMA IF EXISTS ${currentSchema} CASCADE`);
      }
    } finally {
      client.release();
    }
  }
  await pool.end();
});

describe('Task API', () => {

    it('GET /api/tasks - should return all tasks', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/tasks - should create a new task', async () => {
    const newTask = { title: 'Test Task', description: 'Test Desc' };
    const res = await request(app)
      .post('/api/tasks')
      .send(newTask);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(newTask.title);
  });

  it('PUT /api/tasks/:id - should update task completion', async () => {
    // First create a task
    const createRes = await request(app)
      .post('/api/tasks')
      .send({ title: 'Update Test', description: '' });
    const taskId = createRes.body.id;

    // Then update it
    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ completed: true });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.completed).toBe(true);
  });

  it('DELETE /api/tasks/:id - should delete a task', async () => {
    // Create a task
    const createRes = await request(app)
      .post('/api/tasks')
      .send({ title: 'Delete Test', description: '' });
    const taskId = createRes.body.id;

    // Delete it
    const deleteRes = await request(app).delete(`/api/tasks/${taskId}`);
    expect(deleteRes.statusCode).toBe(200);

    // Verify it's gone
    const getRes = await request(app).get('/api/tasks');
    const deletedTask = getRes.body.find(t => t.id === taskId);
    expect(deletedTask).toBeUndefined();
  });
});
