import { describe, expect, it } from "vitest";
import { courseCoverSrc, slugifyCourseTitle } from "./course-cover";

describe("courseCoverSrc", () => {
  it("prefers cover_url", () => {
    expect(
      courseCoverSrc({
        title: "Amazon FBA",
        cover_url: "https://cdn.example/cover.png",
        cover_path: "covers/old.png",
      })
    ).toBe("https://cdn.example/cover.png");
  });

  it("uses cover_path when it is a public path", () => {
    expect(
      courseCoverSrc({
        title: "Amazon FBA",
        cover_path: "/uploads/cover.png",
      })
    ).toBe("/uploads/cover.png");
  });

  it("falls back to /courses/{slug}.png", () => {
    expect(courseCoverSrc({ title: "Amazon FBA Private Label Mastery" })).toBe(
      "/courses/amazon-fba-private-label-mastery.png"
    );
    expect(slugifyCourseTitle("ABCD Test")).toBe("abcd-test");
  });
});
