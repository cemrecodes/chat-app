'use strict';

const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting');
const chatArea = document.querySelector('#chat-messages');
const logOut = document.querySelector('#logout');

let stompClient = null;
let username = null;
let fullName = null;
let selectedUserId = null;

function connect(event) {
  username = document.querySelector('#username').value.trim();
  fullName = document.querySelector('#fullname').value.trim();

  if(username && fullName) {
    usernamePage.classList.add('hidden');
    chatPage.classList.remove('hidden');
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onConnected, onError);
  }
  event.preventDefault();
}

function onConnected(){
  console.log(username);
  stompClient.subscribe( `/user/${username}/queue/messages`, onMessageReceived);
  stompClient.subscribe( `/user/public`, onMessageReceived);

  stompClient.send('/app/user.addUser',
      {},
      JSON.stringify({username: username, fullName: fullName, status: 'ONLINE'})
      );

  document.querySelector('#connected-user-fullname').textContent = fullName;
  findAndDisplayConnectedUsers().then();
}

async function findAndDisplayConnectedUsers(){
  const connectedUserResponse = await fetch('/users');
  let connectedUsers = await connectedUserResponse.json();
  // can implement this in backend
  connectedUsers = connectedUsers.filter(user => user.username !== username);
  const connectedUsersList = document.getElementById('connectedUsers');
  connectedUsersList.innerHTML = '';

  connectedUsers.forEach( user => {
    appendUserElement(user, connectedUsersList);
    if( connectedUsers.indexOf(user) < connectedUsers.length -1){
      const separator = document.createElement('li');
      separator.classList.add('separator');
      connectedUsersList.appendChild(separator);
    }
  });
}

function appendUserElement(user, connectedUsersList){
  const listItem = document.createElement('li');
  listItem.classList.add('user-item');
  listItem.id = user.username;

  const userImg = document.createElement('img');
  userImg.src = '../img/user_icon.png';
  userImg.alt = user.fullName;

  const usernameSpan = document.createElement('span');
  usernameSpan.textContent = user.fullName;

  const receivedMessages = document.createElement('span');
  receivedMessages.textContent = '0';
  receivedMessages.classList.add('nbr-msg', 'hidden');

  listItem.appendChild(userImg);
  listItem.appendChild(usernameSpan);
  listItem.appendChild(receivedMessages);

  listItem.addEventListener('click', userItemClick);
  connectedUsersList.appendChild(listItem);
}

function userItemClick(event){
  document.querySelectorAll('.user-item').forEach( item => {
    item.classList.remove('active');
  });
  messageForm.classList.remove('hidden');

  const clickedUser = event.currentTarget;
  clickedUser.classList.add('active');
  selectedUserId = clickedUser.getAttribute('id');
  fetchAndDisplayUserChat().then();

  const nbrMsg = clickedUser.querySelector('.nbr-msg');
  nbrMsg.classList.add('hidden');
  nbrMsg.content = '0';
}

async function fetchAndDisplayUserChat(){
  const userChatResponse = await fetch(`/messages/${username}/${selectedUserId}`);
  const userChat = await userChatResponse.json();
  chatArea.innerHTML = '';
  userChat.forEach( chat => {
    displayMessage(chat.senderId, chat.content);
  });
  chatArea.scrollTop = chatArea.scrollHeight;
}

function displayMessage(senderId, content){
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message');
  if(senderId === username){
    messageContainer.classList.add('sender');
  } else{
    messageContainer.classList.add('receiver');
  }
  const message = document.createElement('p');
  message.textContent = content;
  messageContainer.appendChild(message);
  chatArea.appendChild(messageContainer);
  chatArea.scrollTop = chatArea.scrollHeight;
}

async function onMessageReceived(payload){
  await findAndDisplayConnectedUsers();
  console.log('Message received', payload);
  const message = JSON.parse(payload.body);
  console.log("selectedUSerID: ", selectedUserId)
  console.log("message:" , message.content)
  if( selectedUserId && selectedUserId === message.senderId){
    displayMessage(message.senderId, message.content);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  if (selectedUserId) {
    document.querySelector(`#${selectedUserId}`).classList.add('active');
  } else {
    messageForm.classList.add('hidden');
  }

  const notifiedUser = document.querySelector(`#${message.senderId}`);
  if( notifiedUser && !notifiedUser.classList.contains('active')){
    const nbrMsg = notifiedUser.querySelector('.nbr-msg');
    nbrMsg.classList.remove('hidden');
    nbrMsg.textContent = '';
  }
}

function sendMessage(event){
  const messageContent = messageInput.value.trim();
  if (messageContent && stompClient){
    const chatMessage = {
      senderId: username,
      recipientId: selectedUserId,
      content: messageContent,
      timestamp: new Date()
    };
    stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));
    displayMessage(username, messageContent);
    messageInput.value = '';
  }
  chatArea.scrollTop = chatArea.scrollHeight;
  event.preventDefault();
}

function onError() {
  connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
  connectingElement.style.color = 'red';
}


function onLogout(){
  stompClient.send('/app/user.disconnectUser', {},
      JSON.stringify({username: username, fullName: fullName, status: 'OFFLINE'})
  );
  window.location.reload();
}

usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
logOut.addEventListener('click', onLogout, true);
window.onbeforeunload = () => onLogout();