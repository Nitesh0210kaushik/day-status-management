import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";

async function getCsrfSession() {
  const response = await request(app).get("/api/v1/auth/csrf");
  const cookie = response.headers["set-cookie"]?.[0]?.split(";")[0];

  if (!cookie || !response.body.csrfToken) {
    throw new Error("CSRF test session could not be created");
  }

  return { cookie, token: response.body.csrfToken as string };
}

describe("API", () => {
  it("returns a healthy status", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("returns 404 for an unknown route", async () => {
    const response = await request(app).get("/api/v1/not-found");

    expect(response.status).toBe(404);
    expect(response.body.error).toContain(
      "Route GET /api/v1/not-found not found",
    );
  });

  it("rejects an invalid day-status date", async () => {
    const response = await request(app).get("/api/v1/day-status/2026-02-31");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Date is not valid");
  });

  it("requires CSRF protection for state-changing requests", async () => {
    const response = await request(app)
      .put("/api/v1/day-status/2026-09-23")
      .send({ content: "Normal working day." });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("CSRF token required");
  });

  it("requires authentication after CSRF validation", async () => {
    const csrf = await getCsrfSession();
    const response = await request(app)
      .put("/api/v1/day-status/2026-09-23")
      .set("Cookie", csrf.cookie)
      .set("X-CSRF-Token", csrf.token)
      .send({ content: "Normal working day." });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Authentication required");
  });

  it("validates registration input before database access", async () => {
    const csrf = await getCsrfSession();
    const response = await request(app)
      .post("/api/v1/auth/register")
      .set("Cookie", csrf.cookie)
      .set("X-CSRF-Token", csrf.token)
      .send({ email: "invalid-email", password: "short" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["fullName"] }),
        expect.objectContaining({ path: ["email"] }),
        expect.objectContaining({ path: ["password"] }),
      ]),
    );
  });
});
