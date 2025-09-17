const { useState, useEffect } = React;

const DiabetesApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [editingGlucose, setEditingGlucose] = useState(null);
  const [editingWeight, setEditingWeight] = useState(null);
  
  const [userProfile, setUserProfile] = useState({
    height: '',
    weight: '',
    glucoseUnit: 'mmol'
  });
  
  const [glucoseRecords, setGlucoseRecords] = useState([]);
  const [weightRecords, setWeightRecords] = useState([]);
  
  const [glucoseForm, setGlucoseForm] = useState({
    value: '',
    time: '',
    type: 'fasting',
    notes: ''
  });
  
  const [weightForm, setWeightForm] = useState({
    morning: '',
    evening: '',
    date: ''
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('diabetesProfile');
    const savedGlucose = localStorage.getItem('glucoseRecords');
    const savedWeight = localStorage.getItem('weightRecords');
    
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
      setIsSetupComplete(true);
    }
    
    if (savedGlucose) {
      setGlucoseRecords(JSON.parse(savedGlucose));
    }
    
    if (savedWeight) {
      setWeightRecords(JSON.parse(savedWeight));
    }
  }, []);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const calculateBMI = (weight, height) => {
    const heightM = height / 100;
    return (weight / (heightM * heightM)).toFixed(1);
  };

  const calculateWaterIntake = (weight) => {
    return (weight * 0.04).toFixed(1);
  };

  const editGlucoseRecord = (record) => {
    setEditingGlucose(record);
    setGlucoseForm({
      value: record.value.toString(),
      time: record.time,
      type: record.type,
      notes: record.notes || ''
    });
    setCurrentView('add-glucose');
  };

  const deleteGlucoseRecord = (id) => {
    if (confirm('Удалить эту запись?')) {
      const updatedRecords = glucoseRecords.filter(record => record.id !== id);
      setGlucoseRecords(updatedRecords);
      localStorage.setItem('glucoseRecords', JSON.stringify(updatedRecords));
    }
  };

  const editWeightRecord = (record) => {
    setEditingWeight(record);
    setWeightForm({
      morning: record.morning ? record.morning.toString() : '',
      evening: record.evening ? record.evening.toString() : '',
      date: record.date
    });
    setCurrentView('add-weight');
  };

  const deleteWeightRecord = (id) => {
    if (confirm('Удалить эту запись?')) {
      const updatedRecords = weightRecords.filter(record => record.id !== id);
      setWeightRecords(updatedRecords);
      localStorage.setItem('weightRecords', JSON.stringify(updatedRecords));
    }
  };

  const SetupScreen = () => {
    const [setup, setSetup] = useState({
      height: '',
      weight: '',
      glucoseUnit: 'mmol'
    });

    const handleSetupSubmit = () => {
      if (setup.height && setup.weight) {
        setUserProfile(setup);
        setIsSetupComplete(true);
        localStorage.setItem('diabetesProfile', JSON.stringify(setup));
      }
    };

    return (
      <div className="min-h-screen bg-blue-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">
            Добро пожаловать!
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Пожалуйста, введите ваши основные параметры
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Рост (см)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={setup.height}
                onChange={(e) => setSetup({...setup, height: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Например: 170"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Текущий вес (кг)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={setup.weight}
                onChange={(e) => setSetup({...setup, weight: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Например: 75.5"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Единицы измерения глюкозы
              </label>
              <select
                value={setup.glucoseUnit}
                onChange={(e) => setSetup({...setup, glucoseUnit: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="mmol">ммоль/л</option>
                <option value="mg">мг/дл</option>
              </select>
            </div>
            
            <button
              type="button"
              onClick={handleSetupSubmit}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Сохранить и продолжить
            </button>
          </div>
        </div>
      </div>
    );
  };

  const HomeScreen = () => {
    const currentWeight = weightRecords.length > 0 ? 
      (weightRecords[weightRecords.length - 1].morning ? weightRecords[weightRecords.length - 1].morning : 
       weightRecords[weightRecords.length - 1].evening ? weightRecords[weightRecords.length - 1].evening : 
       userProfile.weight) 
      : userProfile.weight;
    
    const bmi = calculateBMI(currentWeight, userProfile.height);
    const waterIntake = calculateWaterIntake(currentWeight);

    return (
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ваши показатели</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{bmi}</div>
              <div className="text-sm text-gray-600">ИМТ</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{waterIntake}л</div>
              <div className="text-sm text-gray-600">Норма воды</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              setGlucoseForm({
                value: '',
                time: getCurrentTime(),
                type: 'fasting',
                notes: ''
              });
              setCurrentView('add-glucose');
            }}
            className="w-full bg-red-500 text-white p-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-red-600"
          >
            <span>+ Добавить уровень сахара</span>
          </button>
          
          <button
            onClick={() => {
              setWeightForm({
                morning: '',
                evening: '',
                date: getCurrentDate()
              });
              setCurrentView('add-weight');
            }}
            className="w-full bg-blue-500 text-white p-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-600"
          >
            <span>+ Добавить вес</span>
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setCurrentView('stats')}
            className="w-full bg-green-500 text-white p-3 rounded-lg font-medium hover:bg-green-600"
          >
            📊 Статистика
          </button>
          
          <button
            onClick={() => setCurrentView('settings')}
            className="w-full bg-gray-500 text-white p-3 rounded-lg font-medium hover:bg-gray-600"
          >
            ⚙️ Настройки
          </button>
        </div>

        {glucoseRecords.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Последние измерения сахара</h3>
            <div className="space-y-2">
              {glucoseRecords.slice(-3).reverse().map((record) => (
                <div key={record.id} className="p-3 bg-gray-50 rounded-lg flex justify-between">
                  <div>
                    <span className="font-medium">
                      {record.value} {record.unit === 'mmol' ? 'ммоль/л' : 'мг/дл'}
                    </span>
                    <div className="text-sm text-gray-600">
                      {record.date} в {record.time}
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => editGlucoseRecord(record)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => deleteGlucoseRecord(record.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const AddGlucoseScreen = () => {
    const handleSubmit = () => {
      if (glucoseForm.value && glucoseForm.time) {
        if (editingGlucose) {
          const updatedRecords = glucoseRecords.map(record =>
            record.id === editingGlucose.id
              ? {
                  ...record,
                  value: parseFloat(glucoseForm.value),
                  time: glucoseForm.time,
                  type: glucoseForm.type,
                  notes: glucoseForm.notes
                }
              : record
          );
          setGlucoseRecords(updatedRecords);
          localStorage.setItem('glucoseRecords', JSON.stringify(updatedRecords));
          setEditingGlucose(null);
        } else {
          const newRecord = {
            id: Date.now(),
            value: parseFloat(glucoseForm.value),
            time: glucoseForm.time,
            type: glucoseForm.type,
            notes: glucoseForm.notes,
            date: getCurrentDate(),
            unit: userProfile.glucoseUnit
          };
          
          const updatedRecords = [...glucoseRecords, newRecord];
          setGlucoseRecords(updatedRecords);
          localStorage.setItem('glucoseRecords', JSON.stringify(updatedRecords));
        }
        
        setCurrentView('home');
        setGlucoseForm({
          value: '',
          time: '',
          type: 'fasting',
          notes: ''
        });
      }
    };

    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {editingGlucose ? 'Редактировать уровень сахара' : 'Добавить уровень сахара'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Значение ({userProfile.glucoseUnit === 'mmol' ? 'ммоль/л' : 'мг/дл'})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={glucoseForm.value}
                onChange={(e) => setGlucoseForm({...glucoseForm, value: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={userProfile.glucoseUnit === 'mmol' ? "5.5" : "100"}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Время измерения
              </label>
              <input
                type="time"
                value={glucoseForm.time}
                onChange={(e) => setGlucoseForm({...glucoseForm, time: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип измерения
              </label>
              <select
                value={glucoseForm.type}
                onChange={(e) => setGlucoseForm({...glucoseForm, type: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="fasting">Натощак</option>
                <option value="after-meal">После еды</option>
                <option value="before-meal">Перед едой</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заметки (необязательно)
              </label>
              <textarea
                value={glucoseForm.notes}
                onChange={(e) => setGlucoseForm({...glucoseForm, notes: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Дополнительная информация"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setCurrentView('home');
                  setEditingGlucose(null);
                  setGlucoseForm({
                    value: '',
                    time: '',
                    type: 'fasting',
                    notes: ''
                  });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600"
              >
                {editingGlucose ? 'Сохранить изменения' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isSetupComplete) {
    return <SetupScreen />;
  }

  if (currentView === 'add-glucose') {
    return <AddGlucoseScreen />;
  }

  return <HomeScreen />;
};

ReactDOM.render(<DiabetesApp />, document.getElementById('root'));
