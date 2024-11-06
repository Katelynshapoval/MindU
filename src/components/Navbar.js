import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
// Import Link component for navigation between routes
import { Link } from "react-router-dom";
// Import SidebarData array for sidebar menu items
import { SidebarData } from "./SidebarData";
import "../App.css";
import { IconContext } from "react-icons/lib";
import * as IoIcons from "react-icons/io";
import { getAuth, signOut } from "firebase/auth";
import SignIn from "../components/SignIn";

function Navbar({ user }) {
  // State to track sidebar visibility, default is hidden (false)
  const [sidebar, setSidebar] = useState(false);
  // Toggle function to show or hide the sidebar
  const showSidebar = () => setSidebar(!sidebar);
  const auth = getAuth();
  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      // You could also add redirect logic here if needed
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  return (
    <>
      {/* Provide a default color for all icons using IconContext */}
      <IconContext.Provider value={{ color: "undefined" }}>
        {/* Top navbar section */}
        <div className="navbar">
          <Link to="#" className="menu-bars">
            {/* Menu icon for opening the sidebar */}
            <FaIcons.FaBars color="white" onClick={showSidebar} />
          </Link>
          {user ? (
            <div className="logOut" onClick={handleLogout}>
              <span>Log out</span>
              <IoIcons.IoIosLogOut />
            </div>
          ) : (
            <SignIn />
          )}
        </div>

        {/* Sidebar navigation menu */}
        <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
          <ul className="nav-menu-items" onClick={showSidebar}>
            {/* Close icon at the top of the sidebar */}
            <li className="navbar-toggle">
              <Link to="#" className="menu-bars">
                <AiIcons.AiOutlineClose id="crossSidebar" />
              </Link>
              <img id="logoSidebar" src="./images/logo.png" />
            </li>
            {/* Map through SidebarData to create menu items */}
            {SidebarData.map((item, index) => {
              return (
                <li key={index} className={item.cName}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
