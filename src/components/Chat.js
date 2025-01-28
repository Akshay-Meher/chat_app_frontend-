import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import UserList from './UserList';
import axios from 'axios';
import CreateGroupChat from './CreateGroupChat';
import CreateGroupChatModal from './CreateGroupChatModal';
import GroupList from './GroupList';


const Chat = () => {
    const { auth } = useAuth();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [page, setPage] = useState(0); // Pagination state
    const [hasMore, setHasMore] = useState(true); // To stop fetching when no more messages
    const chatBoxRef = useRef(null); // Ref for chat container
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [display, setDisplay] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        // Limit the number of files to 5
        if (files.length + selectedFiles.length > 5) {
            alert('You can only upload a maximum of 5 files.');
            return;
        }

        // Add new files to the selected files list
        setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    useEffect(() => {

        const newSocket = io('http://localhost:5000', {
            withCredentials: true,
            transports: ['websocket'],
        });


        newSocket.on('connect', () => {
            console.log(`Connected to server: ${newSocket.id}`);
            if (auth?.loggedInUser) {
                newSocket.emit('join', auth?.loggedInUser);
            }
        });

        newSocket.on('privateMessage', (message) => {
            console.log('Received private message:', message);
            setMessages((prevMessages) => [...prevMessages, message]);
        });


        setSocket(newSocket);

        newSocket.on('update-user-list', (userIds) => {
            console.log("Event: update-user-list", userIds);
            setOnlineUsers(userIds);
        });

        // console.log("Auth", auth);
        // Cleanup on component unmount
        return () => {
            newSocket.disconnect();
        };
    }, [auth?.username]);

    //* Fetch messages with pagination

    const fetchMessages = async (reset = false) => {
        if (!selectedUser && !selectedGroup) return;

        try {
            const currentPage = reset ? 0 : page;
            // console.log("currentPage", currentPage);
            console.log("selectedGroup", selectedGroup);
            // const url = selectedUser
            //     ? `http://localhost:5000/message/${selectedUser.id}/${auth.loggedInUser.id}?page=${currentPage}&limit=10`
            //     : `http://localhost:5000/group/${selectedGroup.id}/messages?page=${currentPage}&limit=10`;

            let url;
            if (selectedGroup) {
                url = `http://localhost:5000/messages/group/${selectedGroup.id}`
            } else {
                url = `http://localhost:5000/messages/group/${selectedGroup.id}`
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${auth?.token}` },
            });

            const fetchedMessages = response?.data?.messages;

            console.log("messages with pagination", response);

            if (fetchedMessages.length < 10) {
                setHasMore(false);
            }

            // setMessages((prevMessages) => reset ? fetchedMessages : [...fetchedMessages, ...prevMessages]);
            setMessages((prevMessages) => [...prevMessages, ...fetchedMessages]);

            setPage(currentPage + 1);

            if (reset) {
                setTimeout(() => scrollToBottom(), 0);
            }

        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Fetch messages when user/group changes
    useEffect(() => {
        setMessages([]);
        setPage(0);
        setHasMore(true);
        fetchMessages(true);
    }, [selectedUser, selectedGroup]);

    // Scroll to bottom
    const scrollToBottom = () => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    };

    // Handle scroll to top for fetching more messages
    const handleScroll = () => {
        // console.log("chatBoxRef.current.scrollTop", chatBoxRef.current.scrollTop);
        // console.log("hasMore", hasMore);

        if (chatBoxRef.current.scrollTop === 0 && hasMore) {
            const targetScrollPosition = chatBoxRef.current.scrollHeight * 0.5;
            chatBoxRef.current.scrollTop = targetScrollPosition;
            fetchMessages();
            setPage((prevPage) => prevPage + 1);
        }

    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && selectedUser) {

            socket.emit('chatMessage', {
                senderId: auth?.loggedInUser?.id,
                receiverId: selectedUser.id,
                content: newMessage,
            });

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    senderId: auth?.loggedInUser?.id,
                    receiverId: selectedUser.id,
                    content: newMessage
                },
            ]);

            setNewMessage('');
        }
    };

    const sendGrpMessage = async (e) => {
        e.preventDefault();

        if (selectedFiles.length === 0 && newMessage.trim() === '') {
            alert('Please enter a message or select at least one file.');
            return;
        }

        const formData = new FormData();
        formData.append('message', newMessage);
        selectedFiles.forEach((file, index) => {
            // formData.append(`files[${index}]`, file); // Add files to FormData
            formData.append('files', file);
        });

        console.log("formData", formData);

        try {

            if (selectedFiles.length !== 0) {
                const response = await axios.post('http://localhost:5000/messages/uploadFiles', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                console.log('Response:', response?.data);
                console.log('response.success:', response);
                const { success, message, data } = response?.data;
                // const file_url = JSON.stringify(data?.filePaths);

                const { filePaths, fileNames, fileTypes, fileSizes } = data;

                const filename = JSON.stringify(fileNames);
                const file_url = JSON.stringify(filePaths);
                const filetype = JSON.stringify(fileTypes);
                const filesize = JSON.stringify(fileSizes);

                setSelectedFiles([]);
                if (response.status == 200) {

                    console.log(" socket.emit'groupMessage'");
                    socket.emit('groupMessage', {
                        groupId: selectedGroup.id,
                        senderId: auth.loggedInUser.id,
                        content: newMessage,
                        filename, file_url, filetype, filesize
                    });
                    setNewMessage('');
                }

            } else if (newMessage.trim() && selectedGroup) {
                console.log(" socket.emit'groupMessage'");
                socket.emit('groupMessage', {
                    groupId: selectedGroup.id,
                    senderId: auth.loggedInUser.id,
                    content: newMessage,
                });
                setNewMessage('');
            }

            // if (newMessage.trim() && selectedGroup) {

            //     console.log(" socket.emit'groupMessage'");
            //     socket.emit('groupMessage', {
            //         groupId: selectedGroup.id,
            //         senderId: auth.loggedInUser.id,
            //         content: newMessage,
            //         filename, file_url, filetype, filesize
            //     });
            //     setNewMessage('');
            // }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };



    // const sendGrpMessage = (e) => {
    //     e.preventDefault();
    //     if (newMessage.trim() && selectedGroup) {
    //         socket.emit('groupMessage', {
    //             groupId: selectedGroup.id,
    //             senderId: auth.loggedInUser.id,
    //             content: newMessage,
    //         });
    //         setNewMessage('');
    //     }
    // };

    const handleSelectUser = (user) => {
        console.log("onSelect user", user);
        setSelectedUser(user);
        setSelectedGroup(null);
        // setMessages([]);
    };


    //* group chat
    useEffect(() => {
        if (socket && selectedGroup) {

            socket.emit('joinGroup', { groupId: selectedGroup.id, userId: auth.loggedInUser.id });

            socket.on('groupMessage', (message) => {

                if (message.group_id === selectedGroup.id) {
                    console.log("setMessages", true);
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


    const handleGroupCreated = (group) => {
        console.log('Group created successfully:', group);
        setGroups(prevGroups => [...prevGroups, group]);
        // Optionally refresh group list or navigate to the group chat
    };

    const handleSelectedGroup = (group) => {
        console.log("handleSelectedGroup", group);
        setSelectedGroup(group);
        setSelectedUser(null);
    };


    const handleReply = (msg) => {
        console.log("handleReply", msg);
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div
                    className="col-md-3 pr-1 bg-light custom-scrollbar"
                    style={{ height: '85vh', overflowY: 'auto' }}
                // onScroll={handleScroll}
                // ref={chatBoxRef}
                >
                    <div className='m-2'>
                        <CreateGroupChatModal onGroupCreated={handleGroupCreated} />
                    </div>
                    <GroupList
                        onSelectGroup={handleSelectedGroup}
                        userId={auth?.loggedInUser?.id}
                        isNewGrpCreated={groups}
                    />
                    <UserList
                        onSelectUser={handleSelectUser}
                        onlineUsers={onlineUsers}
                    />

                </div>


                {
                    // for one to one user
                    selectedUser && <div className="col-md-9 d-flex flex-column">
                        <div className="p-3 bg-primary text-white">
                            <h4>Chat with {selectedUser ? selectedUser?.username : '...'}</h4>
                        </div>

                        <div className="chat-box flex-grow-1 p-3 border"

                            style={{ height: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}
                        >
                            {
                                // selectedUser && [...messages]?.reverse()?.map((msg, idx)
                                selectedUser && [...messages]?.map((msg, idx) => {
                                    const isCurrentUser = msg.senderId === auth?.loggedInUser?.id;
                                    // console.log("isCurrentUser", isCurrentUser);

                                    if (isCurrentUser) {
                                        return (
                                            <div key={idx} className="d-flex mb-3 justify-content-end">
                                                <div
                                                    className="p-3 rounded-3 position-relative"
                                                    style={{
                                                        maxWidth: '70%',
                                                        backgroundColor: '#007bff',
                                                        color: 'white',
                                                        wordBreak: 'break-word',
                                                    }}
                                                >
                                                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>
                                                        You
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
                                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </small>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div key={idx} className="d-flex mb-3 justify-content-start">
                                                <div
                                                    className="p-3 rounded-3 position-relative"
                                                    style={{
                                                        maxWidth: '70%',
                                                        backgroundColor: '#f1f0f0',
                                                        color: 'black',
                                                        wordBreak: 'break-word',
                                                    }}
                                                >
                                                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>
                                                        {msg.senderName}
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
                                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </small>
                                                </div>
                                            </div>
                                        );
                                    }
                                })}
                        </div>


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
                    </div>
                }

                {

                    // for group 
                    selectedGroup && <div className="col-md-9 d-flex flex-column">
                        <div className="p-3 bg-primary text-white">
                            <h4>Group: {selectedGroup && !Array.isArray(selectedGroup) ? selectedGroup?.name : 'Select a Group'}</h4>
                        </div>

                        <div
                            className="chat-box flex-grow-1 p-3 border custom-scrollbar"
                            style={{ height: '50vh', overflowY: 'auto', display: 'hhhhflex', flexDirection: 'column-reverse' }}
                            onScroll={handleScroll}
                            ref={chatBoxRef}
                        >

                            {

                                [...messages]?.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`d-flex mb-4 ${msg.sender_id === auth.loggedInUser.id ? 'justify-content-end' : 'justify-content-start'}`}
                                    >
                                        <div
                                            className={`card shadow-sm ${msg.sender_id === auth.loggedInUser.id ? 'bg-primary text-white sender-item' : 'bg-light text-dark receiver-item'
                                                }`}
                                            style={{ maxWidth: '70%' }}
                                        >

                                            <div className="card-body" onMouseEnter={e => setDisplay(idx)} onMouseLeave={e => setDisplay(null)}>

                                                <div
                                                    className="hover-icons position-absolute"
                                                    style={{
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        right: msg.sender_id === auth.loggedInUser.id ? '100%' : 'auto',
                                                        left: msg.sender_id === auth.loggedInUser.id ? 'auto' : '100%',
                                                        display: display == idx ? "" : "none",
                                                        flexDirection: 'column',
                                                        gap: '5px',
                                                    }}
                                                >
                                                    {/* Reply Icon */}
                                                    <button className="btn btn-sm btn-light shadow-sm" title="Reply" onClick={() => { handleReply(msg) }}>
                                                        <i className="bi bi-reply"></i>
                                                        reply
                                                    </button>
                                                    {/* Reaction Icon */}
                                                    <button className="btn btn-sm btn-light shadow-sm" title="React">
                                                        <i className="bi bi-emoji-smile"></i>
                                                        react
                                                    </button>
                                                </div>


                                                {/* Sender Info */}
                                                <h6 className="card-title " style={{ fontSize: '0.9rem' }}>
                                                    {msg.sender_id === auth.loggedInUser.id ? 'You' : msg.Sender?.name}
                                                </h6>

                                                {/* Files Section */}
                                                {msg.file_url && Array.isArray(JSON.parse(msg.file_url)) && (
                                                    <div className="">
                                                        {JSON.parse(msg.file_url).map((fileUrl, fileIdx) => {
                                                            const validUrl = `http://localhost:5000/${fileUrl}`;
                                                            const fileName = JSON.parse(msg.filename)[fileIdx];
                                                            const fileType = JSON.parse(msg.filetype)[fileIdx];

                                                            if (fileType.startsWith('image/')) {
                                                                // Image preview
                                                                return (
                                                                    <div key={fileIdx} className="">
                                                                        <img
                                                                            src={validUrl}
                                                                            alt={fileName}
                                                                            className="img-fluid rounded"
                                                                            style={{ maxHeight: '200px', objectFit: 'contain' }}
                                                                        />
                                                                        <small className="d-block text-muted mt-1">{fileName}</small>
                                                                    </div>
                                                                );
                                                            } else {
                                                                // File download link
                                                                return (
                                                                    <div key={fileIdx} className="file-item border m-1 p-3 bg-light shadow-sm">
                                                                        <a href={validUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                                                            <i className="bi bi-file-earmark"></i> {fileName}
                                                                        </a>
                                                                        <small className="d-block text-muted mt-1">({fileType})</small>
                                                                    </div>
                                                                );
                                                            }
                                                        })}


                                                        {/* Message Content */}
                                                        {msg.content && (
                                                            <p className={`${msg.sender_id === auth.loggedInUser.id ? 'sender-message-item' : 'receiver-message-item'
                                                                } card-text bg-info shadow-sm p-1 message-item`} style={{ fontSize: '1rem', wordBreak: 'break-word' }}>
                                                                {msg.content}
                                                            </p>
                                                        )}

                                                    </div>
                                                )}
                                            </div>

                                            {/* Timestamp */}
                                            <div
                                                className={`text-muted small p-1 ${msg.sender_id === auth.loggedInUser.id ? 'text-end' : 'text-start'
                                                    }`}
                                            >
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }


                        </div>

                        {selectedGroup && (

                            <form onSubmit={sendGrpMessage} className="mt-2 p-3 border-top">
                                {/* File preview section */}
                                {selectedFiles.length > 0 && (
                                    <div className="mt-2">
                                        <div
                                            className="d-flex align-items-center overflow-auto"
                                            style={{
                                                maxWidth: '100%',
                                                whiteSpace: 'nowrap',
                                                gap: '0.5rem',
                                            }}
                                        >
                                            {selectedFiles.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="position-relative d-inline-block"
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        borderRadius: '0.5rem',
                                                        background: '#f8f9fa',
                                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                                        overflow: 'hidden',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {file.type.startsWith('image/') ? (
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`Preview ${index}`}
                                                            className="w-100 h-100"
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="d-flex flex-column justify-content-center align-items-center h-100"
                                                            style={{ fontSize: '0.8rem' }}
                                                        >
                                                            <i className="bi bi-file-earmark-fill fs-4 text-secondary"></i>
                                                            <span className="text-truncate w-100" title={file.name}>
                                                                {file.name}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Remove Button */}
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger position-absolute"
                                                        style={{
                                                            top: '0',
                                                            right: '0',
                                                            padding: '0.25rem',
                                                            borderRadius: '50%',
                                                        }}
                                                        onClick={() => removeFile(index)}
                                                    >
                                                        <i className="bi bi-x"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
                                            You can upload a maximum of 5 files.
                                        </p>
                                    </div>
                                )}

                                <div className="input-group">
                                    <div className="file-upload">
                                        <label htmlFor="file-input" className="btn btn-outline-secondary">
                                            <i className="bi bi-paperclip"></i>
                                        </label>
                                        <input
                                            type="file"
                                            name='files'
                                            id="file-input"
                                            style={{ display: 'none' }}
                                            // accept="image/*,application/pdf" // Allowed file types
                                            onChange={handleFileChange}
                                            multiple // Allow multiple file selection
                                        />
                                    </div>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />

                                    <button className="btn btn-primary" type="submit" disabled={selectedFiles.length === 0 && newMessage.trim() === ''}>
                                        Send
                                    </button>
                                </div>
                            </form>
                        )}

                    </div>
                }

                {
                    !selectedGroup && !selectedUser &&
                    <div div className="col-md-9 d-flex flex-column d-flex flex-column align-items-center justify-content-center vh-50 text-center">
                        <img
                            src="https://plus.unsplash.com/premium_photo-1677252438450-b779a923b0f6?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="Select chat illustration"
                            className="img-fluid mb-4 rounded"
                            style={{ maxWidth: '300px' }}
                        />
                        <h3 className="text-muted">Please select a chat to start a conversation</h3>
                    </div>
                }

            </div>
        </div >
    );
};

export default Chat;