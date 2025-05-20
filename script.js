document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const prompt = document.querySelector('.prompt');
    const terminalContainer = document.querySelector('.terminal-container');
    
    // Добавляем начальное системное сообщение
    addSystemMessage('Добро пожаловать в Terminal Messenger. Начните общение...');
    
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
    
    // Обработка команд
    function handleCommand(command) {
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
            addResponseMessage('Доступные команды:\n- clear: очистить экран\n- time: показать текущее время\n- date: показать текущую дату\n- echo [текст]: вывести текст\n- ls: список файлов\n- exit: выход');
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
        else {
            // Если это русский текст, отвечаем на русском
            if (containsCyrillic) {
                const russianResponses = [
                    'Понятно!',
                    'Интересно.',
                    'Хорошо.',
                    'Согласен.',
                    'Действительно.',
                    'Ясно.',
                    'Принято!'
                ];
                const randomIndex = Math.floor(Math.random() * russianResponses.length);
                addResponseMessage(russianResponses[randomIndex]);
            }
            // Если это не команда и не русский текст, обрабатываем как обычное сообщение на английском
            else if (!isCommand) {
                // Простой ответ на сообщение
                const responses = [
                    'I understand.',
                    'Interesting.',
                    'Noted.',
                    'I see.',
                    'Got it.',
                    'Okay.'
                ];
                const randomIndex = Math.floor(Math.random() * responses.length);
                addResponseMessage(responses[randomIndex]);
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