const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`);

ws.onmessage = (event) => {
  console.log('Received from server:', event.data); // ✅ Debug line
  const message = JSON.parse(event.data);

  // Only render messages of type 'message'
  if (message.type === 'message') {
    chatMessages.innerHTML += createChatMessageElement(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
};

const userInfoModal = document.querySelector('.user-info-modal');
const userInfoForm = document.querySelector('.user-info-form');
const chatHeader = document.querySelector('.chat-header');
const chatMessages = document.querySelector('.chat-messages');
const chatInputForm = document.querySelector('.chat-input-form');
const chatInput = document.querySelector('.chat-input');
const clearChatBtn = document.querySelector('.clear-chat-button');

let messageSender = '';
let chatCode = '';

const createChatMessageElement = (message) => `
  <div class="message ${message.sender === messageSender ? 'blue-bg' : 'gray-bg'}">
    <div class="message-sender">${message.sender}</div>
    <div class="message-text">${message.text}</div>
    <div class="message-timestamp">${message.timestamp}</div>
  </div>
`;

const updateMessageSender = (name, code) => {
  messageSender = name;
  chatCode = code;
  chatHeader.innerText = `${name} chatting with code: ${code}`;
  chatInput.placeholder = `Type here, ${messageSender}...`;
  chatInput.focus();
};

userInfoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = e.target.username.value.trim();
  const code = e.target.chatCode.value.trim();

  if (!username || !code) return;

  updateMessageSender(username, code);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'join', chatCode: code }));
  } else {
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ type: 'join', chatCode: code }));
    });
  }
  userInfoModal.style.display = 'none';
});

const sendMessage = (e) => {
  e.preventDefault();

  const text = chatInput.value.trim();
  if (!text) return;

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const message = {
    type: 'message',
    sender: messageSender,
    text,
    timestamp,
    chatCode
  };

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
  chatInputForm.reset();
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

chatInputForm.addEventListener('submit', sendMessage);

clearChatBtn.addEventListener('click', () => {
  chatMessages.innerHTML = '';
});
