const DiabetesApp = () => {
  // Состояние приложения
  const [currentView, setCurrentView] = useState('home');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [editingGlucose, setEditingGlucose] = useState(null);
  const [editingWeight, setEditingWeight] = useState(null);
  
  // Пользовательские данные
  const [userProfile, setUserProfile] = useState({
    height: '',
    weight: '',
    glucoseUnit: 'mmol'
  });
  
  // Данные измерений
  const [glucoseRecords, setGlucoseRecords] = useState([]);
  const [weightRecords, setWeightRecords] = useState([]);
  
  // Формы ввода данных
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

  // Загрузка данных при старте
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

  // Функции редактирования и удаления
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

  // Получение текущего времени в формате HH:MM
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  // Получение текущей даты в формате YYYY-MM-DD
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Расчет ИМТ
  const calculateBMI = (weight, height) => {
    const heightM = height / 100;
    return (weight / (heightM * heightM)).toFixed(1);
  };

  // Расчет рекомендуемого потребления воды (4% от веса)
  const calculateWaterIntake = (weight) => {
    return (weight * 0.04).toFixed(1);
  };

  // Компонент первоначальной настройки
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

  // Главный экран
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
        {/* Основная информация */}
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

        {/* Быстрые действия */}
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
            <Plus className="w-5 h-5" />
            <span>Добавить уровень сахара</span>
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
            <Plus className="w-5 h-5" />
            <span>Добавить вес</span>
          </button>
        </div>

        {/* Последние измерения */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Последние измерения</h3>
          
          {glucoseRecords.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Сахар:</span>
                <span className="text-lg font-bold">
                  {glucoseRecords[glucoseRecords.length - 1].value} {userProfile.glucoseUnit === 'mmol' ? 'ммоль/л' : 'мг/дл'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {glucoseRecords[glucoseRecords.length - 1].date} в {glucoseRecords[glucoseRecords.length - 1].time}
              </div>
            </div>
          )}
          
          {weightRecords.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Вес:</span>
                <span className="text-lg font-bold">
                  {weightRecords[weightRecords.length - 1].morning ? weightRecords[weightRecords.length - 1].morning : weightRecords[weightRecords.length - 1].evening} кг
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {weightRecords[weightRecords.length - 1].date}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Экран добавления глюкозы
  const AddGlucoseScreen = () => {
    const handleSubmit = () => {
      if (glucoseForm.value && glucoseForm.time) {
        if (editingGlucose) {
          // Редактирование существующей записи
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
          // Добавление новой записи
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
                type="button"
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
                type="button"
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

  // Экран добавления веса
  const AddWeightScreen = () => {
    const handleSubmit = () => {
      if ((weightForm.morning || weightForm.evening) && weightForm.date) {
        if (editingWeight) {
          // Редактирование существующей записи
          const updatedRecords = weightRecords.map(record =>
            record.id === editingWeight.id
              ? {
                  ...record,
                  morning: weightForm.morning ? parseFloat(weightForm.morning) : null,
                  evening: weightForm.evening ? parseFloat(weightForm.evening) : null,
                  date: weightForm.date
                }
              : record
          );
          setWeightRecords(updatedRecords);
          localStorage.setItem('weightRecords', JSON.stringify(updatedRecords));
          setEditingWeight(null);
        } else {
          // Добавление новой записи
          const existingIndex = weightRecords.findIndex(record => record.date === weightForm.date);
          
          if (existingIndex !== -1) {
            const updatedRecords = [...weightRecords];
            updatedRecords[existingIndex] = {
              ...updatedRecords[existingIndex],
              morning: weightForm.morning ? parseFloat(weightForm.morning) : updatedRecords[existingIndex].morning,
              evening: weightForm.evening ? parseFloat(weightForm.evening) : updatedRecords[existingIndex].evening
            };
            setWeightRecords(updatedRecords);
            localStorage.setItem('weightRecords', JSON.stringify(updatedRecords));
          } else {
            const newRecord = {
              id: Date.now(),
              date: weightForm.date,
              morning: weightForm.morning ? parseFloat(weightForm.morning) : null,
              evening: weightForm.evening ? parseFloat(weightForm.evening) : null
            };
            
            const updatedRecords = [...weightRecords, newRecord];
            setWeightRecords(updatedRecords);
            localStorage.setItem('weightRecords', JSON.stringify(updatedRecords));
          }
        }
        
        setCurrentView('home');
        setWeightForm({
          morning: '',
          evening: '',
          date: getCurrentDate()
        });
      }
    };

    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {editingWeight ? 'Редактировать вес' : 'Добавить вес'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата
              </label>
              <input
                type="date"
                value={weightForm.date}
                onChange={(e) => setWeightForm({...weightForm, date: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Утренний вес (кг)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={weightForm.morning}
                onChange={(e) => setWeightForm({...weightForm, morning: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="75.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Вечерний вес (кг)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={weightForm.evening}
                onChange={(e) => setWeightForm({...weightForm, evening: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="76.0"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('home');
                  setEditingWeight(null);
                  setWeightForm({
                    morning: '',
                    evening: '',
                    date: getCurrentDate()
                  });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600"
              >
                {editingWeight ? 'Сохранить изменения' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Экран статистики
  const StatsScreen = () => {
    // Расчет разности веса
    const calculateWeightDifferences = (records) => {
      return records.map((record, index) => {
        const prevRecord = records[index - 1];
        const dailyDiff = prevRecord && record.morning && prevRecord.morning 
          ? (record.morning - prevRecord.morning).toFixed(1) : null;
        const dayDiff = record.morning && record.evening 
          ? (record.evening - record.morning).toFixed(1) : null;
        const nightDiff = prevRecord && record.morning && prevRecord.evening 
          ? (record.morning - prevRecord.evening).toFixed(1) : null;
        
        return { ...record, dailyDiff, dayDiff, nightDiff };
      });
    };

    const weightWithDiffs = calculateWeightDifferences(weightRecords);

    return (
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Статистика</h2>
          
          {/* Последние записи глюкозы */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center justify-between">
              Уровень сахара
              <button
                onClick={() => window.print()}
                className="text-blue-500 hover:text-blue-700"
              >
                <Printer className="w-5 h-5" />
              </button>
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {glucoseRecords.slice(-5).reverse().map((record) => (
                <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">
                        {record.value} {record.unit === 'mmol' ? 'ммоль/л' : 'мг/дл'}
                      </span>
                      <div className="text-sm text-gray-600">
                        {record.date} {record.time}
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.type === 'fasting' ? 'Натощак' : 
                         record.type === 'after-meal' ? 'После еды' : 'Перед едой'}
                      </div>
                      {record.notes && (
                        <div className="text-sm text-gray-500 mt-1">{record.notes}</div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editGlucoseRecord(record)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGlucoseRecord(record.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Вес с расчетами */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center justify-between">
              Контроль веса
              <button
                onClick={() => window.print()}
                className="text-blue-500 hover:text-blue-700"
              >
                <Printer className="w-5 h-5" />
              </button>
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {weightWithDiffs.slice(-7).reverse().map((record) => (
                <div key={record.id || record.date} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="grid grid-cols-2 gap-2 text-sm flex-1">
                      <div>
                        <span className="font-medium">Дата:</span> {record.date}
                      </div>
                      <div>
                        <span className="font-medium">Утро:</span> {record.morning ? record.morning : '—'} кг
                      </div>
                      <div>
                        <span className="font-medium">Вечер:</span> {record.evening ? record.evening : '—'} кг
                      </div>
                      <div>
                        <span className="font-medium">За сутки:</span> 
                        <span className={record.dailyDiff > 0 ? 'text-red-600' : record.dailyDiff < 0 ? 'text-green-600' : ''}>
                          {record.dailyDiff ? `${record.dailyDiff > 0 ? '+' : ''}${record.dailyDiff}` : '—'} кг
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">За день:</span>
                        <span className={record.dayDiff > 0 ? 'text-red-600' : record.dayDiff < 0 ? 'text-green-600' : ''}>
                          {record.dayDiff ? `${record.dayDiff > 0 ? '+' : ''}${record.dayDiff}` : '—'} кг
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">За ночь:</span>
                        <span className={record.nightDiff > 0 ? 'text-red-600' : record.nightDiff < 0 ? 'text-green-600' : ''}>
                          {record.nightDiff ? `${record.nightDiff > 0 ? '+' : ''}${record.nightDiff}` : '—'} кг
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => editWeightRecord(record)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteWeightRecord(record.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Экран настроек
  const SettingsScreen = () => {
    const [editProfile, setEditProfile] = useState({...userProfile});

    const handleSaveProfile = () => {
      setUserProfile(editProfile);
      localStorage.setItem('diabetesProfile', JSON.stringify(editProfile));
      alert('Настройки сохранены!');
    };

    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Настройки</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Рост (см)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={editProfile.height}
                onChange={(e) => setEditProfile({...editProfile, height: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Текущий вес (кг)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={editProfile.weight}
                onChange={(e) => setEditProfile({...editProfile, weight: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Единицы измерения глюкозы
              </label>
              <select
                value={editProfile.glucoseUnit}
                onChange={(e) => setEditProfile({...editProfile, glucoseUnit: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="mmol">ммоль/л</option>
                <option value="mg">мг/дл</option>
              </select>
            </div>
            
            <button
              onClick={handleSaveProfile}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600"
            >
              Сохранить изменения
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Нижняя навигация
  const BottomNavigation = () => {
    const navItems = [
      { id: 'home', icon: Home, label: 'Главная' },
      { id: 'stats', icon: BarChart3, label: 'Статистика' },
      { id: 'settings', icon: Settings, label: 'Настройки' }
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around max-w-md mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Основной рендер
  if (!isSetupComplete) {
    return <SetupScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'add-glucose' && <AddGlucoseScreen />}
      {currentView === 'add-weight' && <AddWeightScreen />}
      {currentView === 'stats' && <StatsScreen />}
      {currentView === 'settings' && <SettingsScreen />}
      
      {(currentView === 'home' || currentView === 'stats' || currentView === 'settings') && (
        <BottomNavigation />
      )}
    </div>
  );
};

export default DiabetesApp;
const { useState, useEffect } = React;
const { Plus, Home, BarChart3, Settings, Calendar, Printer, Edit2, Trash2 } = lucideReact;

ReactDOM.render(React.createElement(DiabetesApp), document.getElementById('root'));