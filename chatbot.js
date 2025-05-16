function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const message = input.value.trim();

  if (message === "") return;

  // Show user message
  chatBox.innerHTML += `<div><strong>You:</strong> ${message}</div>`;
  input.value = "";

  // Simulate bot response
  setTimeout(() => {
    const reply = getBotReply(message);
    chatBox.innerHTML += `<div><strong>Bot:</strong> ${reply}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 500);
}

function getBotReply(msg) {
  msg = msg.toLowerCase();
  if (msg.includes("hello") || msg.includes("hi")) return "Hello! How can I help you?";
  if (msg.includes("name")) return "I am your AI assistant!";
  if (msg.includes("bye")) return "Goodbye! Have a nice day.";
  return "Sorry, I didn't understand that.";
}
