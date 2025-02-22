import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Import Firebase app instance

export async function getAdminEmails() {
  try {
    const adminsCollection = collection(db, "admins");
    const snapshot = await getDocs(adminsCollection);

    // Extract only email field
    const adminEmails = snapshot.docs.map((doc) => doc.data().email);

    return adminEmails;
  } catch (error) {
    console.error("Error fetching admin emails:", error);
    return [];
  }
}
