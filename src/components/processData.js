import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const fetchFeedbackData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "feedback"));
    const data = querySnapshot.docs.map((doc) => doc.data());

    // Initialize count objects
    const schoolTypeCount = {};
    const sentimentCount = {};
    const resourceCount = {};

    data.forEach((entry) => {
      // Count school types
      if (entry.schoolType) {
        schoolTypeCount[entry.schoolType] =
          (schoolTypeCount[entry.schoolType] || 0) + 1;
      }

      // Count sentiments
      if (entry.sentiment) {
        sentimentCount[entry.sentiment] =
          (sentimentCount[entry.sentiment] || 0) + 1;
      }

      // Count resources (if the field exists and is an array)
      if (Array.isArray(entry.resources)) {
        entry.resources.forEach((resource) => {
          resourceCount[resource] = (resourceCount[resource] || 0) + 1;
        });
      }
    });

    return { schoolTypeCount, sentimentCount, resourceCount };
  } catch (error) {
    console.error("Error fetching feedback data:", error);
    return { schoolTypeCount: {}, sentimentCount: {}, resourceCount: {} };
  }
};
