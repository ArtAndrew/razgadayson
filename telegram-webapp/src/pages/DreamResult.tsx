import React from 'react';
import { useNavigate } from 'react-router-dom';

const DreamResult: React.FC = () => {
  const navigate = useNavigate();
  const tg = window.Telegram?.WebApp;

  const handleSave = () => {
    // TODO: Save to journal
    if (tg) {
      tg.showPopup({
        title: 'Сохранено',
        message: 'Сон добавлен в ваш дневник',
        buttons: [{ type: 'ok' }]
      });
    }
  };

  const handleShare = () => {
    if (tg) {
      tg.shareMessage('Посмотри мое толкование сна!');
    }
  };

  const handleDeepAnalysis = () => {
    // TODO: Check subscription and navigate
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Толкование сна</h1>
        <button onClick={() => navigate('/')} className="text-purple-600">
          Готово
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-2xl">🌙</span>
          </div>
          <div>
            <h2 className="font-semibold">Главный символ</h2>
            <p className="text-sm text-gray-600">Луна - перемены и интуиция</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="font-semibold mb-2">Толкование</h3>
        <p className="text-gray-700 leading-relaxed">
          Ваш сон указывает на период внутренних изменений. Луна символизирует интуицию и скрытые эмоции. 
          Возможно, вы находитесь на пороге важных решений, и ваше подсознание подсказывает обратить внимание 
          на внутренний голос.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="font-semibold mb-2">Эмоциональный фон</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Спокойствие</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Интуиция</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Надежда</span>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-white border border-gray-300 rounded-lg py-2 font-medium hover:bg-gray-50 transition"
        >
          Сохранить
        </button>
        <button
          onClick={handleShare}
          className="flex-1 bg-white border border-gray-300 rounded-lg py-2 font-medium hover:bg-gray-50 transition"
        >
          Поделиться
        </button>
      </div>

      <button
        onClick={handleDeepAnalysis}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg py-3 font-medium hover:opacity-90 transition"
      >
        🔮 Глубокий анализ (Pro)
      </button>
    </div>
  );
};

export default DreamResult;