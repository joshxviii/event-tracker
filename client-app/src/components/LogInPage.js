import React from "react";
import { TestComponent } from "./ui/test-component";
import { DataExample } from "./ui/data-example";


export function LoginPage( { onLogin } ) {
	return (
		<div>
            YOU ARE NOT LOGGED IN

			<TestComponent />

			<DataExample foo="help"/>

			<button
				onClick={onLogin}
			>
				Login
			</button>
		</div>
	);
}