import React from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './test.page.scss';
import File from '../components/upload/file.upload';
import { getLinkDownloadFile } from '../utils/handleUltils';

const PDFViewer = () => {
  const [numPages, setNumPages] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="main">
      <File
        url={getLinkDownloadFile(
          'https://res.cloudinary.com/hongsonit10/raw/upload/v1712418918/zalo/21138281_NguyenHongSon-1712418914637.pdf'
        )}
        name={'Tiếp thị điện tử'}
        kg={'1.2 MB'}
      >
        <Document
          file="https://res.cloudinary.com/hongsonit10/raw/upload/v1712412040/zalo/21138281_NguyenHongSon-1712412035226.pdf"
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page pageNumber={pageNumber} width={370} />
        </Document>
      </File>
    </div>
  );
};

export default PDFViewer;
