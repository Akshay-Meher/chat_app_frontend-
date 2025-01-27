import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const GroupChat = () => {
    const { auth } = useAuth();
    const [socket, setSocket] = useState(null);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const newSocket = io('http://localhost:5000', {
            withCredentials: true,
            transports: ['websocket'],
        });

        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, []);

    useEffect(() => {
        if (socket && selectedGroup) {
            // Join the selected group
            socket.emit('joinGroup', { groupId: selectedGroup.id, userId: auth.loggedInUser.id });

            // Listen for group messages
            socket.on('groupMessage', (message) => {
                if (message.groupId === selectedGroup.id) {
                    setMessages((prevMessages) => [...prevMessages, message]);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('groupMessage');
            }
        };
    }, [socket, selectedGroup]);

    const fetchGroups = async () => {
        try {
            const response = await axios.get('http://localhost:5000/groups', {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            setGroups(response.data.groups);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchMessages = async (groupId) => {
        try {
            const response = await axios.get(`http://localhost:5000/group/${groupId}/messages`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching group messages:', error);
        }
    };

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        fetchMessages(group.id);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && selectedGroup) {
            socket.emit('groupMessage', {
                groupId: selectedGroup.id,
                senderId: auth.loggedInUser.id,
                content: newMessage,
            });
            setNewMessage('');
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* <div className="col-md-3 p-0 bg-light">
                    <h4 className="p-3">Groups</h4>
                    <ul className="list-group">
                        {groups.map((group) => (
                            <li
                                key={group.id}
                                className={`list-group-item ${selectedGroup?.id === group.id ? 'active' : ''}`}
                                onClick={() => handleGroupSelect(group)}
                                style={{ cursor: 'pointer' }}
                            >
                                {group.name}
                            </li>
                        ))}
                    </ul>
                </div> */}
                <div className="col-md-9 d-flex flex-column">
                    <div className="p-3 bg-primary text-white">
                        <h4>Group: {selectedGroup ? selectedGroup.name : 'Select a Group'}</h4>
                    </div>

                    <div
                        className="chat-box flex-grow-1 p-3 border"
                        style={{ height: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}
                    >
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`d-flex mb-3 ${msg.senderId === auth.loggedInUser.id ? 'justify-content-end' : 'justify-content-start'}`}>
                                <div
                                    className="p-3 rounded-3 position-relative"
                                    style={{
                                        maxWidth: '70%',
                                        backgroundColor: msg.senderId === auth.loggedInUser.id ? '#007bff' : '#f1f0f0',
                                        color: msg.senderId === auth.loggedInUser.id ? 'white' : 'black',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>
                                        {msg.senderId === auth.loggedInUser.id ? 'You' : msg.senderName}
                                    </strong>
                                    <span style={{ fontSize: '1rem' }}>{msg.content}</span>
                                    <small
                                        className="text-muted position-absolute"
                                        style={{
                                            fontSize: '0.75rem',
                                            bottom: '-20px',
                                            right: '5px',
                                        }}
                                    >
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedGroup && (
                        <form onSubmit={sendMessage} className="mt-2 p-3 border-top">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button className="btn btn-primary" type="submit">
                                    Send
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupChat;
