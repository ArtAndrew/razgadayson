import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const tg = window.Telegram?.WebApp;

  const handleNewDream = () => {
    navigate('/dream/new');
  };

  const handleJournal = () => {
    navigate('/journal');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleShare = () => {
    if (tg) {
      tg.switchInlineQuery('Попробуй AI-толкование снов!', ['users', 'groups', 'channels']);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">Разгадай Сон</h1>
        <p className="text-gray-600">AI-толкование снов за 30 секунд</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h2 className="text-lg font-semibold mb-2">Добро пожаловать!</h2>
        <p className="text-gray-600 mb-4">
          Готовы узнать, что означает ваш сон? Наш AI поможет расшифровать символы и скрытые значения.
        </p>
        <button
          onClick={handleNewDream}
          className="w-full bg-purple-600 text-white rounded-lg py-3 font-medium hover:bg-purple-700 transition"
        >
          Ввести новый сон
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleJournal}
          className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition"
        >
          <div className="text-2xl mb-1">📔</div>
          <div className="text-sm font-medium">Дневник снов</div>
        </button>
        
        <button
          onClick={handleProfile}
          className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition"
        >
          <div className="text-2xl mb-1">👤</div>
          <div className="text-sm font-medium">Мой профиль</div>
        </button>
        
        <button
          onClick={handleShare}
          className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition"
        >
          <div className="text-2xl mb-1">🎁</div>
          <div className="text-sm font-medium">Пригласить друга</div>
        </button>
        
        <button
          className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition"
        >
          <div className="text-2xl mb-1">💎</div>
          <div className="text-sm font-medium">Подписка Pro</div>
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Последние сны: сегодня в 07:30
        </p>
      </div>
    </div>
  );
};

export default MainPage;