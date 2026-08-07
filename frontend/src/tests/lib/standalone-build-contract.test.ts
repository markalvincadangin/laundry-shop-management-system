import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const outputDirectory = join(process.cwd(), "out");

describe("standalone build contract", () => {
  it("does not embed the development API URL in static JavaScript", () => {
    const assetPaths = readdirSync(join(outputDirectory, "_next/static"), {
      recursive: true,
      encoding: "utf8",
    }).filter((assetPath) => assetPath.endsWith(".js"));

    expect(assetPaths.length).toBeGreaterThan(0);

    const assetsWithDevelopmentUrl = assetPaths.filter((assetPath) =>
      readFileSync(join(outputDirectory, "_next/static", assetPath), "utf8").includes(
        "http://localhost:8080/api"
      )
    );

    expect(assetsWithDevelopmentUrl).toEqual([]);
  });
});
