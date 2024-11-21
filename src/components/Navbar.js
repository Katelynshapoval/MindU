import React, { useState, useEffect, useRef } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { Link } from "react-router-dom";
import { SidebarData } from "./SidebarData";
import "../App.css";
import { IconContext } from "react-icons/lib";
import * as IoIcons from "react-icons/io";
import { getAuth, signOut } from "firebase/auth";
import SignIn from "../components/SignIn";

function Navbar({ user }) {
  const [sidebar, setSidebar] = useState(false);
  const sidebarRef = useRef(null); // Reference for sidebar

  const showSidebar = () => setSidebar(!sidebar);
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  useEffect(() => {
    // Function to handle clicks outside the sidebar
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current && // Ensure sidebar ref is initialized
        !sidebarRef.current.contains(event.target) && // Check if the click is outside the sidebar
        !event.target.closest(".menu-bars") // Exclude clicks on the menu icon
      ) {
        setSidebar(false); // Close the sidebar
      }
    };

    // Attach event listener to document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <IconContext.Provider value={{ color: "undefined" }}>
        <div className="navbar">
          <Link to="#" className="menu-bars">
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

        <nav
          className={sidebar ? "nav-menu active" : "nav-menu"}
          ref={sidebarRef} // Attach ref to sidebar
        >
          <ul className="nav-menu-items" onClick={showSidebar}>
            <li className="navbar-toggle">
              <Link to="#" className="menu-bars">
                <AiIcons.AiOutlineClose id="crossSidebar" />
              </Link>
              <img id="logoSidebar" src="./images/logo.png" alt="Logo" />
            </li>
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
