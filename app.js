const { useState, useEffect } = React;
const { Plus, Home, BarChart3, Settings, Calendar, Printer, Edit2, Trash2 } = lucideReact;

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

    return React.createElement('div', {
      className: "min-h-screen bg-blue-50 p-4 flex items-center justify-center"
    }, 
      React.createElement('div', {
        className: "bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
      },
        React.createElement('h2', {
          className: "text-2xl font-bold text-center mb-6 text-blue-900"
        }, "Добро пожаловать!"),
        React.createElement('p', {
          className: "text-gray-600 mb-6 text-center"
        }, "Пожалуйста, введите ваши основные параметры"),
        React.createElement('div', {
          className: "space-y-4"
        },
          React.createElement('div', {},
            React.createElement('label', {
              className: "block text-sm font-medium text-gray-700 mb-2"
            }, "Рост (см)"),
            React.createElement('input', {
              type: "text",
              inputMode: "numeric",
              value: setup.height,
              onChange: (e) => setSetup({...setup, height: e.target.value}),
              className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              placeholder: "Например: 170",
              required: true
            })
          ),
          React.createElement('div', {},
            React.createElement('label', {
              className: "block text-sm font-medium text-gray-700 mb-2"
            }, "Текущий вес (кг)"),
            React.createElement('input', {
              type: "text",
              inputMode: "decimal",
              value: setup.weight,
              onChange: (e) => setSetup({...setup, weight: e.target.value}),
              className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              placeholder: "Например: 75.5",
              required: true
            })
          ),
          React.createElement('div', {},
            React.createElement('label', {
              className: "block text-sm font-medium text-gray-700 mb-2"
            }, "Единицы измерения глюкозы"),
            React.createElement('select', {
              value: setup.glucoseUnit,
              onChange: (e) => setSetup({...setup, glucoseUnit: e.target.value}),
              className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            },
              React.createElement('option', { value: 'mmol' }, 'ммоль/л'),
              React.createElement('option', { value: 'mg' }, 'мг/дл')
            )
          ),
          React.createElement('button', {
            type: "button",
            onClick: handleSetupSubmit,
            className: "w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          }, "Сохранить и продолжить")
        )
      )
    );
  };

  // Основной рендер
  if (!isSetupComplete) {
    return React.createElement(SetupScreen);
  }

  return React.createElement('div', {
    className: "min-h-screen bg-gray-100"
  }, 
    React.createElement('div', {
      className: "p-4"
    },
      React.createElement('div', {
        className: "bg-white rounded-lg shadow p-6"
      },
        React.createElement('h1', {
          className: "text-2xl font-bold text-center text-blue-900 mb-4"
        }, "Контроль диабета"),
        React.createElement('p', {
          className: "text-center text-gray-600"
        }, "Приложение успешно загружено!")
      )
    )
  );
};

// Рендер приложения
ReactDOM.render(React.createElement(DiabetesApp), document.getElementById('root'));