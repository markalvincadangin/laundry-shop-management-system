import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { OrderPipelineSkeleton } from "@/components/features/dashboard/OrderPipeline";

describe("OrderPipeline", () => {
  describe("OrderPipelineSkeleton", () => {
    it("renders exactly 5 skeleton columns for the pipeline", () => {
      render(<OrderPipelineSkeleton />);
      
      const columns = screen.getAllByTestId("pipeline-skeleton-col");
      expect(columns).toHaveLength(5);
    });
  });
});
