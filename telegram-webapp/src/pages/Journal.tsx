import React from 'react';
import { useNavigate } from 'react-router-dom';

const Journal: React.FC = () => {
  const navigate = useNavigate();

  const dreams = [
    { id: 1, date: '12 янв', symbol: '🌊', title: 'Сон о море', preview: 'Плавал в спокойном океане...' },
    { id: 2, date: '10 янв', symbol: '🦋', title: 'Полет бабочки', preview: 'Превратился в бабочку и летал...' },
    { id: 3, date: '8 янв', symbol: '🏠', title: 'Старый дом', preview: 'Вернулся в дом детства...' },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/')} className="mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">Дневник снов</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Всего снов</p>
            <p className="text-2xl font-bold">24</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Дней подряд</p>
            <p className="text-2xl font-bold">7 🔥</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Топ символ</p>
            <p className="text-2xl">🌊</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Поиск по снам..."
          className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      <div className="space-y-3">
        {dreams.map(dream => (
          <button
            key={dream.id}
            onClick={() => navigate(`/dream/result/${dream.id}`)}
            className="w-full bg-white rounded-lg shadow-sm p-4 text-left hover:shadow-md transition"
          >
            <div className="flex items-start">
              <div className="text-3xl mr-3">{dream.symbol}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold">{dream.title}</h3>
                  <span className="text-sm text-gray-500">{dream.date}</span>
                </div>
                <p className="text-sm text-gray-600">{dream.preview}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Journal;