import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

const CreateGroupChatModal = ({ onGroupCreated }) => {
    const { auth } = useAuth();
    const [users, setUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

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
        if (!groupName.trim()) {
            setErrorMessage('Group name is required.');
            return;
        }

        if (selectedUsers.length === 0) {
            setErrorMessage('At least one member must be added to the group.');
            return;
        }

        try {

            // API for grp creation

            const response = await axios.post(
                'http://localhost:5000/groups/create',
                {
                    admin_id: auth?.loggedInUser?.id,
                    group_name: groupName,
                    user_ids: JSON.stringify(selectedUsers),
                },
                {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log("grp creation response", response);

            // const response = await axios.post(
            //     'http://localhost:5000/group/create',
            //     {
            //         name: groupName,
            //         members: selectedUsers,
            //     },
            //     {
            //         headers: {
            //             Authorization: `Bearer ${auth.token}`,
            //             'Content-Type': 'application/json',
            //         },
            //     }
            // );

            setErrorMessage('');
            onGroupCreated(response.data);
            setGroupName('');
            setSelectedUsers([]);
            setShowModal(false);
        } catch (error) {
            console.error('Error creating group:', error);
            setErrorMessage('Failed to create group. Try again.');
        }
    };

    return (
        <div>

            <button
                className="btn btn-success d-flex align-items-center gap-2"
                onClick={() => setShowModal(true)}
            >
                create group <FontAwesomeIcon icon={faUsers} />
            </button>

            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Group Chat</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
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
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    onClick={handleCreateGroup}
                                >
                                    Create Group
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateGroupChatModal;
