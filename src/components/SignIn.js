import { signInWithGooglePopup } from "../firebase/firebase";
import { FcGoogle } from "react-icons/fc";

const SignIn = () => {
  const logGoogleUser = async () => {
    const response = await signInWithGooglePopup();
    console.log(response);
  };
  return (
    <div className="account">
      <button onClick={logGoogleUser}>
        Sign In <FcGoogle />
      </button>
    </div>
  );
};
export default SignIn;
