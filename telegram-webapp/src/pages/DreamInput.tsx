import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DreamInput: React.FC = () => {
  const navigate = useNavigate();
  const [dreamText, setDreamText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const tg = window.Telegram?.WebApp;

  const handleSubmit = () => {
    if (dreamText.length >= 20) {
      // TODO: Submit to API
      navigate('/dream/result/123');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (tg) {
      tg.HapticFeedback.impactOccurred('light');
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button onClick={handleBack} className="mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">Новый сон</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Опишите свой сон
        </label>
        <textarea
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          placeholder="Мне приснилось..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          rows={6}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            {dreamText.length} символов (минимум 20)
          </span>
          <button
            onClick={toggleRecording}
            className={`p-2 rounded-full ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800">
          💡 Совет: Опишите как можно больше деталей - символы, эмоции, цвета, действия
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={dreamText.length < 20}
        className="w-full bg-purple-600 text-white rounded-lg py-3 font-medium hover:bg-purple-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Разгадать сон
      </button>
    </div>
  );
};

export default DreamInput;