// import React from "react";
import SignIn from "../components/SignIn";

import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseApp from "../firebase/firebase";

function Home() {
  return (
    <div className="home">
      <h1>Home</h1>
    </div>
  );
}

export default Home;
