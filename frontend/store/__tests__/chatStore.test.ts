import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatStore } from '../chatStore';
import { api } from '../../services/api';
import { io } from 'socket.io-client';

const socket = {
  connected: false,
  emit: vi.fn(),
  on: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => socket),
}));

vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const initialState = useChatStore.getState();

describe('useChatStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socket.connected = false;
    useChatStore.setState(initialState, true);
  });

  it('connects a socket and registers chat listeners', () => {
    useChatStore.getState().connectSocket('user-1');

    expect(io).toHaveBeenCalled();
    expect(socket.emit).toHaveBeenCalledWith('setup', 'user-1');
    expect(socket.on).toHaveBeenCalledWith('receive_message', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('typing', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('stop_typing', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('new_notification', expect.any(Function));
    expect(useChatStore.getState().socket).toBe(socket);
  });

  it('ignores duplicate received messages', () => {
    useChatStore.setState({
      currentMessages: [{ _id: 'message-1', sender: 'user-1', text: 'hi', createdAt: 'now' }],
    });
    useChatStore.getState().connectSocket('user-1');
    const receiveHandler = socket.on.mock.calls.find(([event]) => event === 'receive_message')?.[1];

    receiveHandler({ _id: 'message-1', sender: 'user-2', text: 'duplicate', createdAt: 'later' });

    expect(useChatStore.getState().currentMessages).toHaveLength(1);
  });

  it('adds optimistic messages before sending them through the socket', () => {
    useChatStore.setState({ socket: socket as any });

    useChatStore.getState().sendMessage('conversation-1', 'receiver-1', 'sender-1', 'Hello');

    expect(useChatStore.getState().currentMessages[0]).toEqual(
      expect.objectContaining({ sender: 'sender-1', text: 'Hello' })
    );
    expect(socket.emit).toHaveBeenCalledWith('send_message', {
      conversationId: 'conversation-1',
      receiverId: 'receiver-1',
      senderId: 'sender-1',
      text: 'Hello',
      clientTempId: expect.stringMatching(/^temp_/),
    });
  });

  it('replaces an optimistic message when the server echoes it back', () => {
    useChatStore.setState({
      currentMessages: [{ _id: 'temp_1', sender: 'user-1', text: 'Hello', createdAt: 'now' }],
    });
    useChatStore.getState().connectSocket('user-1');
    const receiveHandler = socket.on.mock.calls.find(([event]) => event === 'receive_message')?.[1];

    receiveHandler({
      _id: 'message-1',
      clientTempId: 'temp_1',
      conversation: 'conversation-1',
      sender: 'user-1',
      text: 'Hello',
      createdAt: 'later',
    });

    expect(useChatStore.getState().currentMessages).toEqual([
      expect.objectContaining({ _id: 'message-1', text: 'Hello' }),
    ]);
  });

  it('fetches messages and joins the conversation room', async () => {
    const messages = [{ _id: 'message-1', sender: 'user-1', text: 'Hello', createdAt: 'now' }];
    useChatStore.setState({ socket: socket as any });
    vi.mocked(api.get).mockResolvedValueOnce({ data: { messages } });

    await useChatStore.getState().fetchMessages('conversation-1');

    expect(api.get).toHaveBeenCalledWith('/chat/conversation-1');
    expect(socket.emit).toHaveBeenCalledWith('join_chat', 'conversation-1');
    expect(useChatStore.getState().currentMessages).toEqual(messages);
  });
});
