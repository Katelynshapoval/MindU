// import React from "react";
import SignIn from "../components/SignIn";

import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseApp from "../firebase/firebase";

// import { useOutletContext } from "react-router-dom";

function Home() {
  // const { user } = useOutletContext();
  return (
    <div className="home">
      <h1>Home</h1>
      {/* {user ? <p>Hi, {user.email}</p> : <SignIn />} */}
    </div>
  );
}

export default Home;
