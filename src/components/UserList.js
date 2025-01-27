import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../css/userlist.css';

const UserList = ({ onSelectUser, onlineUsers, groups, setGroups }) => {
    const [users, setUsers] = useState([]);
    const { auth } = useAuth();

    useEffect(() => {

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/users/getAll');
                console.log('fetchUsers response', response.data)
                const allUsers = response.data.allUsers?.filter(user => user.id != auth.loggedInUser.id);
                setUsers(allUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));


    function checkIsOnline(id) {
        return onlineUsers.includes(String(id));
    }

    return (

        <>
            {/* <div className="list-group border-right custom-scrollbar" style={{ height: '35vh', overflowY: 'auto' }}> */}
            <div className="list-group border-right custom-scrollbar">
                <h3 className="p-2 text-center bg-primary rounded text-white">
                    {loggedInUser?.username}
                </h3>
                <h4 className="text-center">Users</h4>
                {users.map((user) => {
                    const isOnline = checkIsOnline(user.id);
                    return (
                        <button
                            key={user.id}
                            className={`list-group-item list-group-item-action d-flex align-items-center`}
                            onClick={() => onSelectUser(user)}
                            style={{
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                borderColor: isOnline ? 'green' : 'lightgray',
                                backgroundColor: isOnline ? '#f0fff4' : '#ffffff',
                                position: 'relative',
                            }}
                        >
                            <div
                                style={{
                                    position: 'relative',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: isOnline ? 'green' : 'transparent',
                                    overflow: 'hidden',
                                    marginRight: '10px',
                                }}
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.name}&background=random&size=40`}
                                    alt={`${user.name} avatar`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                    }}
                                />
                                {isOnline && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            zIndex: 1,
                                            bottom: '0',
                                            right: '0',
                                            width: '12px',
                                            height: '12px',
                                            backgroundColor: 'green',
                                            borderRadius: '50%',
                                            border: '2px solid white',
                                        }}
                                    ></span>
                                )}
                            </div>
                            <span className="me-auto">{user.name}</span>
                            {isOnline && (
                                <span className="badge bg-success" style={{ marginLeft: 'auto' }}>
                                    {/* Online */}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </>
    );
};

export default UserList;
