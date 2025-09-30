import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { InboxOutlined } from '@ant-design/icons';
import { message, Typography } from 'antd';
import { type CandidateDetails, parseResume } from '../services/resumeParser';

const { Title, Paragraph } = Typography;

interface ResumeUploadProps {
  onUploadSuccess: (details: CandidateDetails) => void;
}

const ResumeUpload = ({ onUploadSuccess }: ResumeUploadProps) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        const details = await parseResume(file);
        message.success(`${file.name} uploaded and parsed successfully.`);
        onUploadSuccess(details);
      } catch (error) {
        message.error(String(error));
      }
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: '2px dashed #d9d9d9',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? '#fafafa' : '#fff',
      }}
    >
      <input {...getInputProps()} />
      <Paragraph>
        <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
      </Paragraph>
      <Title level={4}>Click or drag file to this area to upload</Title>
      <Paragraph>
        Upload your resume to automatically fill in your details. Supports .pdf and .docx
      </Paragraph>
    </div>
  );
};

export default ResumeUpload;
