import React from "react";
import { renderToString } from "react-dom/server";
import { Route } from "./src/routes/index.tsx";

// Mock React context for testing render
const Component = Route.options.component;

if (Component) {
  console.log("COMPONENT FUNCTION FOUND");
} else {
  console.error("NO COMPONENT FOUND IN ROUTE");
}
