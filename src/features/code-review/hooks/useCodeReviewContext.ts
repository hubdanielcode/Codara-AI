import { useContext } from "react";
import { CodeReviewContext } from "../context/CodeReviewContext";

const useCodeReviewContext = () => {
  const context = useContext(CodeReviewContext);

  if (!context) {
    throw new Error(
      "CodeReviewContext must be used inside an CodeReviewProvider",
    );
  }
  return context;
};

export { useCodeReviewContext };
