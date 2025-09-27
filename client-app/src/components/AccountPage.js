import React from "react";

export const AccountPage = () => {
  return (
    <header>
      <div id="Test" className="">
      <nav className="flex justify-between items-center p-4 bg-white shadow">
      <div className="flex items-center space-x-2">
        <span className="text-blue-600 font-bold text-lg">EventTracker </span>
        <a href="/HomePage" className="ml-4 text-gray-600 hover:text-blue-600">Home </a>
        <a href="/" className="ml-4 text-blue-600 font-medium">Account</a>
      </div>
      <button className="text-gray-600 hover:text-red-500">Sign Out</button>
    </nav>
    </div>
    </header>
  );
}
