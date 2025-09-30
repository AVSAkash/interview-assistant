import { useSelector } from 'react-redux';
import type{ RootState } from '../features/store';
import { Table, Typography, Tag, Descriptions } from 'antd';
import type { TableProps } from 'antd';
import type{ Question } from '../features/interviewSlice';

const { Title, Paragraph, Text } = Typography;

interface Candidate {
  id: string;
  details: { name: string; email: string; phone: string; };
  interview: Question[];
  finalScore: number;
  summary: string;
  date: string;
}

const InterviewerView = () => {
  const candidates = useSelector((state: RootState) => state.candidates.candidates);

  const expandedRowRender = (record: Candidate) => {
    return (
      <Descriptions title="Interview Details" bordered column={1} size="small">
        {record.interview.map((q, index) => (
          <Descriptions.Item key={index} label={`Q${index + 1}: ${q.questionText}`}>
            <Paragraph><strong>Answer:</strong> {q.answer || "No answer provided."}</Paragraph>
            <Paragraph><strong>Feedback:</strong> {q.feedback}</Paragraph>
            <Tag color={q.score > 7 ? 'green' : q.score > 4 ? 'orange' : 'red'}>Score: {q.score}/10</Tag>
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };

  const columns: TableProps<Candidate>['columns'] = [
    {
      title: 'Name',
      dataIndex: ['details', 'name'],
      key: 'name',
      sorter: (a, b) => a.details.name.localeCompare(b.details.name),
    },
    {
      title: 'Final Score',
      dataIndex: 'finalScore',
      key: 'finalScore',
      sorter: (a, b) => a.finalScore - b.finalScore,
      render: (score: number) => (
        <Tag color={score > 7 ? 'green' : score > 4 ? 'orange' : 'red'}>
          {score} / 10
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'AI Summary',
      dataIndex: 'summary',
      key: 'summary',
    },
    {
      title: 'Contact',
      dataIndex: ['details', 'email'],
      key: 'contact',
      render: (_, record) => (
        <>
          <Text>{record.details.email}</Text><br />
          <Text>{record.details.phone}</Text>
        </>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Interviewer Dashboard</Title>
      <Paragraph>List of all candidates who have completed the interview. Click the '+' icon to see detailed Q&A.</Paragraph>
      <Table
        columns={columns}
        dataSource={candidates}
        rowKey="id"
        expandable={{ expandedRowRender }}
      />
    </div>
  );
};


export default InterviewerView;
