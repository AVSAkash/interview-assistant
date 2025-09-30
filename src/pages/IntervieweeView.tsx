import { useState, useEffect, useMemo } from 'react';
import { Typography, Card, Descriptions, Button, Input, Spin, Modal, Result, message, Statistic } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../features/store';
import { startInterview, addQuestion, submitAnswer, nextQuestion, resetInterview } from '../features/interviewSlice';
import { addCandidate } from '../features/candidatesSlice';
import ResumeUpload from '../components/ResumeUpload';
import type { CandidateDetails } from '../services/resumeParser';
import { generateQuestion, evaluateAnswer, generateSummary } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const getDifficulty = (index: number): 'easy' | 'medium' | 'hard' => {
  if (index < 2) return 'easy';
  if (index < 4) return 'medium';
  return 'hard';
};

const getTimerDuration = (index: number): number => {
  const difficulty = getDifficulty(index);
  switch (difficulty) {
    case 'easy': return 20;
    case 'medium': return 60;
    case 'hard': return 120;
    default: return 60;
  }
};

const IntervieweeView = () => {
  const dispatch: AppDispatch = useDispatch();
  const { status, questions, currentQuestionIndex, candidateDetails: savedDetails } = useSelector((state: RootState) => state.interview);

  const [localDetails, setLocalDetails] = useState<CandidateDetails | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  const expiryTimestamp = useMemo(() => {
    if (status === 'in-progress' && questions.length > 0) {
      const duration = getTimerDuration(currentQuestionIndex);
      return Date.now() + duration * 1000;
    }
    return Date.now();
  }, [currentQuestionIndex, status, questions.length]);


  useEffect(() => {
    if (status === 'in-progress') {
      setShowWelcomeBack(true);
    }
  }, []);

  const handleUploadSuccess = (details: CandidateDetails) => {
    setLocalDetails(details);
  };

  const handleStartInterview = async () => {
    if (!localDetails?.name || !localDetails?.email || !localDetails?.phone) {
      message.error('Please ensure Name, Email, and Phone are filled.');
      return;
    }
    setIsLoading(true);
    try {
      dispatch(startInterview({ name: localDetails.name, email: localDetails.email, phone: localDetails.phone }));
      const firstQuestion = await generateQuestion('easy');
      dispatch(addQuestion(firstQuestion));
    } catch (error) {
      message.error('Failed to start the interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || isLoading) return;

    setIsLoading(true);
    try {
      const evaluation = await evaluateAnswer(currentQuestion.questionText, currentAnswer);
      dispatch(submitAnswer({ answer: currentAnswer, ...evaluation }));
      setCurrentAnswer('');

      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex] = { ...currentQuestion, answer: currentAnswer, ...evaluation };

      if (currentQuestionIndex === 5) {
        const summary = await generateSummary(updatedQuestions);
        const finalScore = Math.round(updatedQuestions.reduce((acc, q) => acc + q.score, 0) / 6);
        
        dispatch(addCandidate({
          id: new Date().toISOString(),
          details: savedDetails!,
          interview: updatedQuestions,
          finalScore,
          summary,
          date: new Date().toLocaleDateString(),
        }));
        dispatch(nextQuestion());
      } else {
        const nextDifficulty = getDifficulty(currentQuestionIndex + 1);
        const nextQ = await generateQuestion(nextDifficulty);
        dispatch(nextQuestion());
        dispatch(addQuestion(nextQ));
      }
    } catch (error) {
      message.error('Failed to submit answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  if (status === 'finished') {
    return (
      <Result
        status="success"
        title="You have successfully completed the interview!"
        subTitle="The interviewer will be in touch with you soon regarding the next steps."
        extra={[<Button type="primary" key="start_new" onClick={() => { dispatch(resetInterview()); setLocalDetails(null); }}>Start New Interview</Button>]}
      />
    );
  }

  if (status === 'in-progress' && questions.length > 0) {
    return (
      <Spin spinning={isLoading} tip="Processing...">
        <Card 
          title={`Question ${currentQuestionIndex + 1} of 6 (${getDifficulty(currentQuestionIndex)})`}
          extra={
            <Statistic.Countdown 
              key={currentQuestionIndex} 
              title="Time Remaining" 
              value={expiryTimestamp} 
              format="mm:ss" 
              onFinish={() => {
                message.warning('Time is up! Submitting your answer.');
                handleAnswerSubmit();
              }}
            />
          }
        >
          <Title level={4}>{questions[currentQuestionIndex]?.questionText}</Title>
          <TextArea
            rows={6}
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            disabled={isLoading}
          />
          <Button type="primary" onClick={handleAnswerSubmit} loading={isLoading} style={{ marginTop: '16px' }}>
            Submit Answer
          </Button>
        </Card>
      </Spin>
    );
  }

  return (
    <div>
      <Title level={2}>Candidate Interview</Title>
      {!localDetails ? (
        <Card title="Step 1: Upload Your Resume">
          <ResumeUpload onUploadSuccess={handleUploadSuccess} />
        </Card>
      ) : (
        <Card title="Step 2: Confirm Your Details and Start">
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name"><Text editable={{ onChange: (val) => setLocalDetails({ ...localDetails, name: val }) }}>{localDetails.name || ''}</Text></Descriptions.Item>
            <Descriptions.Item label="Email"><Text editable={{ onChange: (val) => setLocalDetails({ ...localDetails, email: val }) }}>{localDetails.email || ''}</Text></Descriptions.Item>
            <Descriptions.Item label="Phone"><Text editable={{ onChange: (val) => setLocalDetails({ ...localDetails, phone: val }) }}>{localDetails.phone || ''}</Text></Descriptions.Item>
          </Descriptions>
          <Button type="primary" onClick={handleStartInterview} loading={isLoading} style={{ marginTop: '24px' }}>
            Start Interview
          </Button>
        </Card>
      )}
      <Modal
        title="Welcome Back!"
        open={showWelcomeBack}
        onOk={() => setShowWelcomeBack(false)}
        onCancel={() => {
          dispatch(resetInterview());
          setLocalDetails(null);
          setShowWelcomeBack(false);
        }}
        okText="Resume Interview"
        cancelText="Restart"
      >
        <p>You have an interview in progress. Would you like to resume where you left off?</p>
      </Modal>
    </div>
  );
};


export default IntervieweeView;
