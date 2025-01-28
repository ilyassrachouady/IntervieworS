import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Timer, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { generateQuestions, analyzeResponse, type InterviewQuestion, type FeedbackResponse } from '../lib/gemini';
import { speechService } from '../lib/speech';

const jobRoles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
];

const topics = {
  'Frontend Developer': ['React', 'JavaScript', 'CSS', 'Web Performance', 'Accessibility'],
  'Backend Developer': ['Node.js', 'Databases', 'API Design', 'Security', 'Scalability'],
  'Full Stack Developer': ['Frontend', 'Backend', 'Databases', 'API Design', 'System Design'],
  'DevOps Engineer': ['CI/CD', 'Cloud Services', 'Containers', 'Infrastructure', 'Monitoring'],
  'Data Scientist': ['Machine Learning', 'Statistics', 'Python', 'Data Analysis', 'Big Data'],
};

export function InterviewSimulator() {
  const [selectedRole, setSelectedRole] = useState('');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const generatedQuestions = await generateQuestions(
        selectedRole,
        topics[selectedRole as keyof typeof topics]
      );
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setAnswer('');
      setFeedback(null);
      setTimer(0);
      setIsTimerRunning(true);
      
      speakQuestion(generatedQuestions[0].question);
    } catch (err) {
      setError('Failed to generate interview questions. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const speakQuestion = (text: string) => {
    setIsSpeaking(true);
    speechService.speak(text, () => setIsSpeaking(false));
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      speakQuestion(questions[currentQuestionIndex].question);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setIsTimerRunning(false);
      const response = await analyzeResponse(questions[currentQuestionIndex], answer);
      setFeedback(response);
    } catch (err) {
      setError('Failed to analyze your answer. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer('');
      setFeedback(null);
      resetTranscript();
      setTimer(0);
      setIsTimerRunning(true);
      speakQuestion(questions[currentQuestionIndex + 1].question);
    }
  };

  const toggleRecording = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Role Selection */}
      {!questions.length && (
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6">Start Your Interview Practice</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Choose a role...</option>
                {jobRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {selectedRole && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Topics Covered:</h3>
                <div className="flex flex-wrap gap-2">
                  {topics[selectedRole as keyof typeof topics].map(topic => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={startInterview}
              disabled={!selectedRole || isLoading}
              className="w-full bg-primary text-white py-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Preparing Interview...</span>
                </>
              ) : (
                <>
                  <span>Start Interview</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Interview Interface */}
      {questions.length > 0 && (
        <div className="space-y-6">
          {/* Progress and Timer */}
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Timer className="w-4 h-4" />
                <span className="font-mono">{formatTime(timer)}</span>
              </div>
            </div>
          </div>

          {/* Question Display */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Interview Question</h3>
              <button
                onClick={toggleSpeech}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={isSpeaking ? "Stop Speaking" : "Read Question"}
              >
                {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
            </div>
            <p className="text-lg mb-4">{questions[currentQuestionIndex].question}</p>
            {questions[currentQuestionIndex].context && (
              <div className="flex items-start space-x-2 text-gray-600 bg-gray-50 p-4 rounded-lg">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{questions[currentQuestionIndex].context}</p>
              </div>
            )}
          </div>

          {/* Answer Input */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Your Response</h4>
              {browserSupportsSpeechRecognition && (
                <button
                  onClick={toggleRecording}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  {listening ? (
                    <>
                      <MicOff className="w-5 h-5 text-red-500" />
                      <span className="text-sm">Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      <span className="text-sm">Start Recording</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              placeholder="Type or speak your answer..."
            />
            <button
              onClick={submitAnswer}
              disabled={isLoading || !answer.trim()}
              className="w-full mt-4 bg-primary text-white py-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Submit Answer</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback Display */}
          {feedback && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h4 className="text-xl font-semibold mb-6">Feedback Analysis</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                  <span className="font-medium">Overall Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${feedback.score}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-primary">{feedback.score}/100</span>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{feedback.feedback}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-green-600 mb-3 flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Strengths</span>
                    </h5>
                    <ul className="space-y-2">
                      {feedback.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-orange-600 mb-3 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>Areas for Improvement</span>
                    </h5>
                    <ul className="space-y-2">
                      {feedback.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span className="text-gray-700">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {currentQuestionIndex < questions.length - 1 && (
                  <button
                    onClick={nextQuestion}
                    className="w-full bg-primary text-white py-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}