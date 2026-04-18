import { jest } from '@jest/globals';
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Task from "../src/models/Task.js";

jest.setTimeout(30000); 

let token;
let taskId;

beforeAll(async () => {
  // 1. Cleanup: Remove existing test user/tasks
  await User.deleteMany({ email: "task@example.com" });
  await Task.deleteMany({});

  // 2. Register
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Task User",
      email: "task@example.com",
      password: "123456"
    });

  // 3. Login
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "task@example.com",
      password: "123456"
    });

  token = res.body.token;
});

// CRITICAL: Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe("Task Routes", () => {
  it("should not allow access without token", async () => {
    const res = await request(app)
      .get("/api/tasks");

    expect(res.statusCode).toBe(401);
  });

  it("should create a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "Testing"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test Task");

    taskId = res.body._id;
  });

  it("should get user tasks only", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});