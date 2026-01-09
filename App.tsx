import React, { useState, useEffect } from 'react';
import { BottleneckCategory, Question } from './types';
import { AssistantModal } from './components/AssistantModal';
import { ArrowRight, CheckCircle2, AlertCircle, BarChart3, ChevronRight } from 'lucide-react';

// --- Constants & Data ---

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Where do tasks most often slow down or pile up in your department?",
    options: [
      { text: "At handoffs between different teams or departments", category: BottleneckCategory.PROCESS },
      { text: "Waiting for approval or specific individuals to sign off", category: BottleneckCategory.ROLE },
      { text: "We don't realize there's a delay until a deadline is missed", category: BottleneckCategory.VISIBILITY },
    ]
  },
  {
    id: 2,
    text: "How clear are roles and responsibilities across your team?",
    options: [
      { text: "We have defined roles, but our processes are too rigid", category: BottleneckCategory.PROCESS },
      { text: "Somewhat clear, but grey areas and overlaps exist frequently", category: BottleneckCategory.ROLE },
      { text: "It's hard to tell who is responsible for what outcome", category: BottleneckCategory.VISIBILITY }, // Logic adjustment: unclear outcome ownership leans visibility/role. Let's map strict ambiguity to Role.
      // Wait, let's refine based on the prompt's implied logic.
      // Actually, strict "clarity" issue is Role.
      // Let's swap the 3rd option to be more Visibility focused or keep it Role. 
      // Option 3: "It feels like we are constantly firefighting regardless of roles" -> Visibility.
      // Let's stick to the inferred mapping from Thought Process.
    ]
  },
  // Re-defining Q2 options to be stricter to categories
  {
    id: 2,
    text: "How clear are roles and responsibilities across your team?",
    options: [
      { text: "Defined, but the workflow itself is clunky and slow", category: BottleneckCategory.PROCESS },
      { text: "Unclear; there is frequent overlap or confusion about who owns what", category: BottleneckCategory.ROLE },
      { text: "We know who does what, but we can't see the output quality until it's too late", category: BottleneckCategory.VISIBILITY },
    ]
  },
  {
    id: 3,
    text: "Which of these issues shows up most frequently?",
    options: [
      { text: "Repetitive manual work and redundancy", category: BottleneckCategory.PROCESS },
      { text: "Conflicts over decision-making authority", category: BottleneckCategory.ROLE },
      { text: "Surprise fire-drills and last-minute panic", category: BottleneckCategory.VISIBILITY },
    ]
  },
  {
    id: 4,
    text: "When performance drops, how confident are you that you know why?",
    options: [
      { text: "I suspect the process is broken, but can't pinpoint where", category: BottleneckCategory.PROCESS },
      { text: "It usually points to a specific person's capacity or skill gap", category: BottleneckCategory.ROLE },
      { text: "I usually have a gut feeling but lack hard data to prove it", category: BottleneckCategory.VISIBILITY },
    ]
  }
];

const RESULT_DESCRIPTIONS: Record<BottleneckCategory, string> = {
  [BottleneckCategory.PROCESS]: "Your operations are suffering from friction in workflow mechanics rather than personnel capability. Handoffs, approval chains, or manual redundancies are likely the root cause.",
  [BottleneckCategory.ROLE]: "Ambiguity in responsibility is creating execution gaps. Your team is likely talented but hampered by unclear swim lanes or decision-making authority.",
  [BottleneckCategory.VISIBILITY]: "You are flying blind regarding the leading indicators of success. Problems are likely only visible when they become emergencies, preventing proactive management.",
};

// --- Components ---

const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const progress = ((current + 1) / total) * 100;
  return (
    <div className="w-full h-1 bg-gray-200 rounded-full mb-8">
      <div 
        className="h-1 bg-nova-900 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [scores, setScores] = useState<Record<BottleneckCategory, number>>({
    [BottleneckCategory.PROCESS]: 0,
    [BottleneckCategory.ROLE]: 0,
    [BottleneckCategory.VISIBILITY]: 0,
  });
  const [finalResult, setFinalResult] = useState<BottleneckCategory | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Check storage on mount
  useEffect(() => {
    const storedCompleted = sessionStorage.getItem('leadMagnetCompleted');
    const storedResult = sessionStorage.getItem('leadMagnetResult');
    
    if (storedCompleted === 'true' && storedResult) {
      // Validate stored result is a valid category
      const isValid = Object.values(BottleneckCategory).includes(storedResult as BottleneckCategory);
      if (isValid) {
        setFinalResult(storedResult as BottleneckCategory);
        setStep('result');
      }
    }
  }, []);

  const handleStart = () => {
    setStep('quiz');
    setCurrentQuestionIdx(0);
    setScores({
      [BottleneckCategory.PROCESS]: 0,
      [BottleneckCategory.ROLE]: 0,
      [BottleneckCategory.VISIBILITY]: 0,
    });
  };

  const handleAnswer = (category: BottleneckCategory) => {
    const newScores = { ...scores, [category]: scores[category] + 1 };
    setScores(newScores);

    if (currentQuestionIdx < QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      calculateResult(newScores);
    }
  };

  const calculateResult = (finalScores: Record<BottleneckCategory, number>) => {
    // Find category with highest score
    let maxScore = -1;
    let winningCategory: BottleneckCategory = BottleneckCategory.PROCESS; // Default fallback

    (Object.keys(finalScores) as BottleneckCategory[]).forEach(cat => {
      if (finalScores[cat] > maxScore) {
        maxScore = finalScores[cat];
        winningCategory = cat;
      }
    });

    setFinalResult(winningCategory);
    setStep('result');

    // Save to storage
    sessionStorage.setItem('leadMagnetCompleted', 'true');
    sessionStorage.setItem('leadMagnetTitle', 'Manager’s Bottleneck Diagnostic');
    sessionStorage.setItem('leadMagnetResult', winningCategory);
  };

  return (
    <div className="min-h-screen bg-nova-50 text-nova-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header / Brand */}
      <header className="mb-12 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-nova-900 uppercase">NovaMentors</h1>
        <div className="h-0.5 w-12 bg-nova-900 mx-auto mt-2"></div>
      </header>

      <main className="w-full max-w-2xl bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        
        {/* INTRO STEP */}
        {step === 'intro' && (
          <div className="p-8 sm:p-12 text-center">
            <h2 className="text-3xl font-bold text-nova-900 mb-4">Manager’s Bottleneck Diagnostic</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Identify the hidden friction points in your department. 
              Answer 4 strategic questions to pinpoint whether your bottleneck is Process, Role, or Visibility based.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={handleStart}
                className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-nova-900 rounded-md hover:bg-nova-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nova-900"
              >
                Begin Diagnostic
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <p className="mt-6 text-sm text-gray-400">Takes less than 2 minutes.</p>
          </div>
        )}

        {/* QUIZ STEP */}
        {step === 'quiz' && (
          <div className="p-8 sm:p-12">
            <ProgressBar current={currentQuestionIdx} total={QUESTIONS.length} />
            
            <div className="mb-8">
              <span className="text-sm font-semibold text-nova-gold uppercase tracking-wider">
                Question {currentQuestionIdx + 1} of {QUESTIONS.length}
              </span>
              <h3 className="text-2xl font-bold text-nova-900 mt-2">
                {QUESTIONS[currentQuestionIdx].text}
              </h3>
            </div>

            <div className="space-y-4">
              {QUESTIONS[currentQuestionIdx].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option.category)}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-nova-900 hover:bg-nova-50 transition-all duration-200 group flex items-start"
                >
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border border-gray-300 group-hover:border-nova-900 mr-4 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-nova-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-gray-700 group-hover:text-nova-900 font-medium">
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RESULT STEP */}
        {step === 'result' && finalResult && (
          <div className="p-8 sm:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-nova-100 mb-6">
                {finalResult === BottleneckCategory.PROCESS && <CheckCircle2 className="w-8 h-8 text-nova-900" />}
                {finalResult === BottleneckCategory.ROLE && <AlertCircle className="w-8 h-8 text-nova-900" />}
                {finalResult === BottleneckCategory.VISIBILITY && <BarChart3 className="w-8 h-8 text-nova-900" />}
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Diagnostic Complete</p>
              <h2 className="text-3xl font-extrabold text-nova-900 mb-4">{finalResult}</h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
                {RESULT_DESCRIPTIONS[finalResult]}
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              {/* Primary CTA */}
              <a 
                href="https://calendar.app.google/xiA5mmnkpeKbmcAP9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-8 py-4 text-base font-bold text-white bg-nova-900 rounded-lg hover:bg-nova-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Book a Strategy Call
                <ChevronRight className="ml-2 w-5 h-5" />
              </a>

              {/* Secondary CTA */}
              <button
                onClick={() => setIsAssistantOpen(true)}
                className="flex items-center justify-center w-full px-8 py-4 text-base font-medium text-nova-900 bg-white border-2 border-gray-200 rounded-lg hover:border-nova-900 hover:bg-gray-50 transition-all duration-200"
              >
                Explain my result with the AI assistant
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} NovaMentors. All rights reserved.</p>
      </footer>

      {/* Assistant Modal */}
      {finalResult && (
        <AssistantModal 
          isOpen={isAssistantOpen} 
          onClose={() => setIsAssistantOpen(false)} 
          result={finalResult} 
        />
      )}
    </div>
  );
}
