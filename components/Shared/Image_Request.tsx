import React from "react";
import Image from "next/image";

const Image_Request = ({ expFile }: any) => {
  return (
    <div>
      <Image
        className="h-[900px] w-[600px]"
        alt="ImgRequest"
        height={500}
        width={500}
        src={expFile ? expFile : "/DefaultBook.png"}
      />
    </div>
  );
};

export default Image_Request;
