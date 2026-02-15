/**
 * Vitest setup for Phase 8 component tests.
 */
import React from "react";
import "@testing-library/jest-dom";

// Required for JSX in test files when using automatic JSX runtime
globalThis.React = React;
