import { describe, expect, it } from "vitest";
import { createCareerOsServer } from "../src/server.js";

describe("createCareerOsServer", () => {
  it("creates a Node HTTP server instance", () => {
    const server = createCareerOsServer();

    expect(typeof server.listen).toBe("function");
    expect(typeof server.close).toBe("function");

    server.close();
  });
});
