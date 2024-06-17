import React, { useEffect, useState } from 'react';
import './dropImage.scss';

function DragDrop({ children, fileTypes }) {
  const [file, setFile] = useState(null);

  const handleDrop = (event) => {
    event.preventDefault();
    const myFile = event.dataTransfer.files[0];
    // Xử lý files đã được thả vào đây
    setFile(myFile);
  };

  const onDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="drop-container" onDrop={handleDrop} onDragOver={onDragOver}>
      {React.cloneElement(children, { file, fileTypes })}
    </div>
  );
}

export default DragDrop;
