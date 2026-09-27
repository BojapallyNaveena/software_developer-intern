const BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

export const fetchChatHistory = async (limit = 100) => {
  const response = await fetch(`${BASE_URL}/api/messages?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to load chat history');
  }
  return response.json();
};

export const sendRestMessage = async (messageData) => {
  const response = await fetch(`${BASE_URL}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData),
  });
  if (!response.ok) {
    throw new Error('Failed to send message via REST API');
  }
  return response.json();
};

export const loginUser = async (username) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });
  if (!response.ok) {
    throw new Error('Login failed');
  }
  return response.json();
};

export const fetchUsers = async () => {
  const response = await fetch(`${BASE_URL}/api/auth/users`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};
