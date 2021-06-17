import DocViewer from "react-doc-viewer";
import React from "react";

const ViewerDoc = () => {
	 console.log( window.location.state);
  const docs = [
    
    { uri: window.location.state}, 
  ];

 

  return <DocViewer documents={docs} />;
}
export default ViewerDoc;