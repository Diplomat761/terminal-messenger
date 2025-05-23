document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const prompt = document.querySelector('.prompt');
    const terminalContainer = document.querySelector('.terminal-container');
    const settingsButton = document.getElementById('settingsButton');
    const settingsModal = document.getElementById('settingsModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const useAiSwitch = document.getElementById('useAiSwitch');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    
    // Конфигурация API (загружаем из localStorage или используем предустановленный ключ)
    let API_KEY = localStorage.getItem('deepseek_api_key') || 'sk-689a8bb7c9ed4019a17c389743e5a0ac';
    let USE_AI = localStorage.getItem('use_ai') === 'true' || true; // По умолчанию включен
    let AI_MODEL = localStorage.getItem('ai_model') || 'deepseek'; // По умолчанию deepseek
    
    // Устанавливаем начальные значения в форме настроек
    apiKeyInput.value = API_KEY;
    useAiSwitch.checked = USE_AI;
    
    // Обработка кнопки настроек
    settingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
    });
    
    // Сохранение настроек
    saveSettingsBtn.addEventListener('click', () => {
        API_KEY = apiKeyInput.value.trim();
        USE_AI = useAiSwitch.checked;
        
        // Сохраняем в localStorage
        localStorage.setItem('deepseek_api_key', API_KEY);
        localStorage.setItem('use_ai', USE_AI.toString());
        
        // Закрываем модальное окно
        settingsModal.style.display = 'none';
        
        // Показываем сообщение об успешном сохранении настроек
        addSystemMessage('Настройки сохранены. ' + (USE_AI ? 'DeepSeek включен.' : 'DeepSeek отключен.'));
    });
    
    // Отмена настроек
    cancelSettingsBtn.addEventListener('click', () => {
        // Восстанавливаем предыдущие значения
        apiKeyInput.value = API_KEY;
        useAiSwitch.checked = USE_AI;
        
        // Закрываем модальное окно
        settingsModal.style.display = 'none';
    });
    
    // Закрытие модального окна при клике вне его
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
    
    // Добавляем начальное системное сообщение
    addSystemMessage('Добро пожаловать в Terminal Messenger. Начните общение...');
    addSystemMessage('DeepSeek AI уже включен и готов к использованию!');
    
    // Обработчик ввода сообщений
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && messageInput.value.trim() !== '') {
            const userInput = messageInput.value.trim();
            
            // Добавляем сообщение пользователя
            addUserMessage(userInput);
            
            // Очищаем поле ввода
            messageInput.value = '';
            
            // Обрабатываем команды
            handleCommand(userInput);
        }
    });
    
    // Адаптивность для мобильных устройств
    function adjustPromptForMobile() {
        if (window.innerWidth <= 480) {
            const shortPrompt = "$ ";
            if (prompt.textContent !== shortPrompt) {
                prompt.dataset.fullPrompt = prompt.textContent;
                prompt.textContent = shortPrompt;
            }
        } else {
            if (prompt.dataset.fullPrompt) {
                prompt.textContent = prompt.dataset.fullPrompt;
            }
        }
    }
    
    // Обработка фокуса на поле ввода для мобильных устройств
    messageInput.addEventListener('focus', () => {
        if (window.innerWidth <= 480) {
            // Прокручиваем к полю ввода при появлении клавиатуры
            setTimeout(() => {
                window.scrollTo(0, document.body.scrollHeight);
                messageInput.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 300);
            
            // Добавляем класс для изменения стилей при открытой клавиатуре
            terminalContainer.classList.add('keyboard-open');
        }
    });
    
    messageInput.addEventListener('blur', () => {
        // Удаляем класс при закрытии клавиатуры
        terminalContainer.classList.remove('keyboard-open');
    });
    
    // Определяем изменение высоты окна (признак открытия/закрытия клавиатуры)
    let windowHeight = window.innerHeight;
    window.addEventListener('resize', () => {
        // Если высота уменьшилась, вероятно, открылась клавиатура
        if (window.innerHeight < windowHeight && window.innerWidth <= 480) {
            terminalContainer.classList.add('keyboard-open');
            setTimeout(() => {
                messageInput.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 100);
        } else if (window.innerHeight > windowHeight) {
            // Если высота увеличилась, вероятно, клавиатура закрылась
            terminalContainer.classList.remove('keyboard-open');
        }
        windowHeight = window.innerHeight;
        
        // Также обновляем промпт при изменении размера
        adjustPromptForMobile();
    });
    
    // Вызываем при загрузке
    adjustPromptForMobile();
    
    // Функция добавления сообщения пользователя
    function addUserMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        if (window.innerWidth <= 480) {
            messageElement.innerHTML = `<span class="prompt">$ </span>${text}`;
        } else {
            messageElement.innerHTML = `<span class="prompt">alexeypereverzev@MacBook-Air-Alexey ~ % </span>${text}`;
        }
        
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Функция добавления ответа системы
    function addResponseMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Функция добавления системного сообщения
    function addSystemMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'message-system');
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Функция для вызова DeepSeek API
    async function generateAIResponse(prompt) {
        if (!API_KEY || !USE_AI) {
            // Если ключ API не задан или AI отключен, используем стандартные ответы
            return null;
        }
        
        // Показываем индикатор загрузки
        const loadingElement = document.createElement('div');
        loadingElement.classList.add('message', 'message-system');
        loadingElement.textContent = 'Генерация ответа...';
        chatMessages.appendChild(loadingElement);
        scrollToBottom();
        
        try {
            // URL для DeepSeek API
            const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat', // Используйте правильное имя модели для DeepSeek
                    messages: [
                        {
                            role: 'system',
                            content: 'Ты помощник в терминальном чате. Давай короткие ответы на русском языке. Максимум 1-2 предложения.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 100,
                    temperature: 0.7
                })
            });
            
            const data = await response.json();
            
            // Удаляем индикатор загрузки
            chatMessages.removeChild(loadingElement);
            
            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content.trim();
            }
            
            return null;
        } catch (error) {
            console.error('Ошибка при запросе к API DeepSeek:', error);
            
            // Удаляем индикатор загрузки
            chatMessages.removeChild(loadingElement);
            
            addSystemMessage('Ошибка при генерации ответа.');
            return null;
        }
    }
    
    // Обработка команд
    async function handleCommand(command) {
        const originalCommand = command;
        command = command.toLowerCase();
        
        // Определяем, является ли это командой
        const isCommand = command.startsWith('/') || 
                            command === 'clear' || 
                            command === 'cls' || 
                            command === 'help' || 
                            command === 'time' || 
                            command === 'date' || 
                            command === 'ls' || 
                            command === 'exit' || 
                            command.startsWith('echo ');
        
        // Проверяем, содержит ли текст кириллицу (русский текст)
        const containsCyrillic = /[а-яА-ЯёЁ]/.test(originalCommand);
        
        // Базовые команды терминала
        if (command === 'clear' || command === 'cls') {
            chatMessages.innerHTML = '';
            addSystemMessage('Окно терминала очищено');
        } 
        else if (command === 'help') {
            addResponseMessage('Доступные команды:\n- clear: очистить экран\n- time: показать текущее время\n- date: показать текущую дату\n- echo [текст]: вывести текст\n- ls: список файлов\n- settings: настройки DeepSeek AI\n- about: информация о DeepSeek\n- exit: выход');
        }
        else if (command === 'time') {
            const now = new Date();
            addResponseMessage(`Текущее время: ${now.toLocaleTimeString()}`);
        }
        else if (command === 'date') {
            const now = new Date();
            addResponseMessage(`Текущая дата: ${now.toLocaleDateString()}`);
        }
        else if (command.startsWith('echo ')) {
            const text = originalCommand.substring(5);
            addResponseMessage(text);
        }
        else if (command === 'ls') {
            addResponseMessage('Desktop\nDocuments\nDownloads\nPictures\nApplications');
        }
        else if (command === 'exit') {
            addSystemMessage('Выход из терминала...');
            setTimeout(() => {
                addSystemMessage('Нажмите F5, чтобы перезапустить терминал');
            }, 1000);
        }
        else if (command === 'settings' || command === 'config') {
            // Открываем настройки при вводе команды settings
            settingsModal.style.display = 'flex';
        }
        else if (command === 'about') {
            // Информация о DeepSeek и как получить ключ
            addResponseMessage('DeepSeek AI - это платформа искусственного интеллекта, которая предоставляет мощные языковые модели.\n\nЧтобы получить API ключ DeepSeek:\n1. Зарегистрируйтесь на сайте https://deepseek.com\n2. Перейдите в личный кабинет\n3. Найдите раздел API или Developer\n4. Создайте новый API ключ\n\nПосле получения ключа добавьте его в настройках (команда "settings").');
        }
        else {
            // Используем AI для генерации ответов на сообщения
            if (!isCommand) {
                try {
                    // Пытаемся получить ответ от AI, если она включена
                    const aiResponse = USE_AI ? await generateAIResponse(originalCommand) : null;
                    
                    if (aiResponse) {
                        // Если получили ответ от AI, используем его
                        addResponseMessage(aiResponse);
                    } else {
                        // Если AI отключен или нет ответа от API
                        if (USE_AI && API_KEY) {
                            // Если AI включен, но ответа нет, сообщаем об ошибке
                            addSystemMessage('Не удалось получить ответ от нейросети. Используем стандартный ответ.');
                        }
                        
                        // Если это русский текст, отвечаем на русском
                        if (containsCyrillic) {
                            const russianResponses = [
                                'Понятно!',
                                'Интересно.',
                                'Хорошо.',
                                'Согласен.',
                                'Действительно.',
                                'Ясно.',
                                'Принято!',
                                'Отлично!',
                                'Сейчас подумаю над этим.',
                                'Спасибо за информацию!',
                                'Точно подмечено.'
                            ];
                            const randomIndex = Math.floor(Math.random() * russianResponses.length);
                            addResponseMessage(russianResponses[randomIndex]);
                        }
                        // Если это не русский текст, отвечаем на английском
                        else {
                            const responses = [
                                'I understand.',
                                'Interesting.',
                                'Noted.',
                                'I see.',
                                'Got it.',
                                'Okay.',
                                'Thanks for sharing!',
                                'Makes sense.',
                                'Good point.',
                                "I'll think about it."
                            ];
                            const randomIndex = Math.floor(Math.random() * responses.length);
                            addResponseMessage(responses[randomIndex]);
                        }
                    }
                } catch (error) {
                    console.error('Ошибка при обработке сообщения:', error);
                    addSystemMessage('Произошла ошибка при обработке сообщения.');
                    
                    // Используем стандартные ответы при ошибке
                    if (containsCyrillic) {
                        addResponseMessage('Извините, произошла ошибка. Можете повторить?');
                    } else {
                        addResponseMessage('Sorry, an error occurred. Could you repeat that?');
                    }
                }
            } else {
                // Это неизвестная команда
                addResponseMessage(`zsh: command not found: ${command}`);
            }
        }
    }
    
    // Прокрутка чата вниз
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
        // Для мобильных устройств также прокручиваем страницу
        if (window.innerWidth <= 480) {
            messageInput.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }
    
    // Фокус на поле ввода
    messageInput.focus();
    
    // Сохраняем фокус на поле ввода при клике в любом месте терминала
    terminalContainer.addEventListener('click', () => {
        messageInput.focus();
    });
}); 