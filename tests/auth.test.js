import { jest } from '@jest/globals'; 
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import User from "../src/models/User.js";

// Increase timeout for Atlas connection
jest.setTimeout(30000); 

describe("Auth Routes", () => {
  // Cleanup before and after tests
  beforeAll(async () => {
    await User.deleteMany({ email: "test@example.com" });
  });

  afterAll(async () => {
    // Close the connection so Jest can exit properly
    await mongoose.connection.close();
  });

  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("test@example.com");
  });

  it("should login user and return token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});