import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const fetchFeedbackData = async () => {
  const querySnapshot = await getDocs(collection(db, "feedback"));
  const data = querySnapshot.docs.map((doc) => doc.data());

  // Count responses for schoolType
  const schoolTypeCount = {};
  const sentimentCount = {};
  const resourceCount = {};

  data.forEach((entry) => {
    schoolTypeCount[entry.schoolType] =
      (schoolTypeCount[entry.schoolType] || 0) + 1;

    sentimentCount[entry.sentiment] =
      (sentimentCount[entry.sentiment] || 0) + 1;
  });

  return { schoolTypeCount, sentimentCount };
};
