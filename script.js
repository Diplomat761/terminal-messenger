document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    
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
            
            // Обрабатываем командыы
            handleCommand(userInput);
        }
    });
    
    // Функция добавления сообщения пользователя
    function addUserMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<span class="prompt">alexeypereverzev@MacBook-Air-Alexey ~ % </span>${text}`;
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
        command = command.toLowerCase();
        
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
            const text = command.substring(5);
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
        else if (command === 'привет') {
            addResponseMessage('zsh: command not found: привет');
        }
        else {
            addResponseMessage(`zsh: command not found: ${command}`);
        }
    }
    
    // Прокрутка чата вниз
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Фокус на поле ввода
    messageInput.focus();
    
    // Сохраняем фокус на поле ввода при клике в любом месте терминала
    document.querySelector('.terminal-container').addEventListener('click', () => {
        messageInput.focus();
    });
}); 