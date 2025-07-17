import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/')} className="mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">Профиль</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <h2 className="font-semibold text-lg">{user?.first_name || 'Пользователь'}</h2>
            <p className="text-sm text-gray-600">@{user?.username || 'username'}</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Статус</span>
            <span className="font-medium text-green-600">Free</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Толкований сегодня</span>
            <span className="font-medium">0 / 1</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="font-semibold mb-3">Статистика</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Всего снов</span>
            <span className="font-medium">24</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Дней подряд</span>
            <span className="font-medium">7 🔥</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Любимый символ</span>
            <span className="font-medium">Вода 🌊</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="font-semibold mb-3">Достижения</h3>
        <div className="flex gap-3">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-1">
              <span className="text-xl">🌟</span>
            </div>
            <p className="text-xs">Новичок</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-1">
              <span className="text-xl">📝</span>
            </div>
            <p className="text-xs">10 снов</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-1">
              <span className="text-xl">🔥</span>
            </div>
            <p className="text-xs">7 дней</p>
          </div>
        </div>
      </div>

      <button
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg py-3 font-medium hover:opacity-90 transition"
      >
        Оформить Pro подписку
      </button>
    </div>
  );
};

export default Profile;