import React from "react";
import { TestComponent } from "./ui/TestComponent";
import { DataExample } from "./ui/DataExample";

export const LogInPage = () => {
  return (
    <div>
        <TestComponent />

        <DataExample foo="help"/>
    </div>
  );
}