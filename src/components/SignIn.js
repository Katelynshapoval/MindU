import { signInWithGooglePopup } from "../firebase/firebase";
import { FcGoogle } from "react-icons/fc";
import "../css/signInGoogle.css";

const SignIn = () => {
  const logGoogleUser = async () => {
    try {
      const response = await signInWithGooglePopup();
    } catch (error) {
      // Handle error if any occurs during sign-in
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div className="account">
      {/* <button onClick={logGoogleUser}>
        Sign In <FcGoogle />
      </button> */}

      <button className="signInGoogle" onClick={logGoogleUser}>
        Iniciar sesión
      </button>
    </div>
  );
};

export default SignIn;

{
  /* <button onClick={logGoogleUser}>
        Sign In <FcGoogle />
      </button> */
}
