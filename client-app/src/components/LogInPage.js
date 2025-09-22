import React from "react";
import { TestComponent } from "./ui/test-component";
import { DataExample } from "./ui/data-example";

export const LogInPage = () => {
	return (
		<div>
            YOU ARE NOT LOGGED IN

			<TestComponent />

			<DataExample foo="help"/>
		</div>
	);
}