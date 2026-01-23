import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const RichTextEditor = ({ value, onChange, placeholder, className = '', isRTL = false }) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'align'
  ];

  return (
    <div className={`rich-text-editor ${isRTL ? 'rtl' : ''} ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className={isRTL ? 'text-right' : ''}
      />
      <style jsx>{`
        .rich-text-editor.rtl .ql-editor {
          direction: rtl;
          text-align: right;
        }
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-size: 16px;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
        .rich-text-editor .ql-toolbar {
          border-radius: 0.5rem 0.5rem 0 0;
          background-color: #f8fafc;
        }
        .rich-text-editor .ql-container {
          border-radius: 0 0 0.5rem 0.5rem;
        }
      `}</style>
    </div>
  );
};
