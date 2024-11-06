import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Tips from "./Routes/Tips";
import Home from "./Routes/Home";
import Chat from "./Routes/Chat";
import Support from "./Routes/Support";
import App from "./App"; // Import App.js here

// Define the router configuration
const router = createBrowserRouter([
  {
    path: "/", // Root path of the app
    element: <App />, // Main layout from App.js
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "tips",
        element: <Tips />,
      },
      {
        path: "chat",
        element: <Chat />,
      },
      {
        path: "support",
        element: <Support />,
      },
    ],
  },
]);

// Render the application into the root element of the HTML file
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
