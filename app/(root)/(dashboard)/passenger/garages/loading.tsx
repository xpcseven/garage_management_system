import React from "react";

const loading = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      <div className="h-20 w-20 rounded-full border-4 border-purple-500 border-t-purple-600 animate-spin" />
    </div>
  );
};

export default loading;

