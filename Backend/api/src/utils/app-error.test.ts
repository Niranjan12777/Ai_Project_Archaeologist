import { describe, expect, it } from "vitest";
import { AppError } from "./app-error.js";

describe("AppError", () => {
  it("stores status code and structured details", () => {
    const details = { field: "email" };
    const error = new AppError("Invalid input", 422, details);

    expect(error.message).toBe("Invalid input");
    expect(error.statusCode).toBe(422);
    expect(error.details).toEqual(details);
  });
});
