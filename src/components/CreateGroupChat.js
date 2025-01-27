import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const CreateGroupChat = ({ onGroupCreated }) => {
    const { auth } = useAuth();
    const [users, setUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Fetch all users except the logged-in user
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/users/getAll', {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });
                const allUsers = response.data.allUsers.filter(
                    (user) => user.id !== auth?.loggedInUser?.id
                );
                console.log("allUsers A1", allUsers);
                setUsers(allUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [auth]);

    const handleCheckboxChange = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!groupName) {
            setErrorMessage('Group name is required.');
            return;
        }

        if (selectedUsers.length === 0) {
            setErrorMessage('At least one member must be added to the group.');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/groups/create',
                {
                    name: groupName,
                    members: selectedUsers,
                },
                {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setErrorMessage('');
            onGroupCreated(response.data);
            setGroupName('');
            setSelectedUsers([]);
        } catch (error) {
            console.error('Error creating group:', error);
            setErrorMessage('Failed to create group. Try again.');
        }
    };

    return (
        <div className="container my-4">
            <h3>Create Group Chat</h3>
            <form onSubmit={handleCreateGroup}>
                <div className="mb-3">
                    <label htmlFor="groupName" className="form-label">
                        Group Name
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="groupName"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Enter group name"
                    />
                </div>

                <div className="mb-3">
                    <h5>Select Members</h5>
                    <div className="user-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {users.map((user) => (
                            <div key={user.id} className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`user-${user.id}`}
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => handleCheckboxChange(user.id)}
                                />
                                <label htmlFor={`user-${user.id}`} className="form-check-label">
                                    {user.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {errorMessage && <p className="text-danger">{errorMessage}</p>}

                <button type="submit" className="btn btn-primary">
                    Create Group
                </button>
            </form>
        </div>
    );
};

export default CreateGroupChat;
