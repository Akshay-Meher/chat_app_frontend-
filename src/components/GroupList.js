import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const GroupList = ({ userId, onSelectGroup, isNewGrpCreated }) => {
    const [groups, setGroups] = useState([]);
    const { auth } = useAuth();


    useEffect(() => {
        // Fetch groups from the API
        const userId = auth?.loggedInUser?.id
        const fetchGroups = async () => {
            try {
                console.log("fetchGroups", userId);

                const response = await axios.get(`http://localhost:5000/groups/getGroups/${userId}`, {
                    // params: { userId },
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });
                setGroups(response?.data?.data);
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };

        fetchGroups();
    }, [userId, isNewGrpCreated]);

    return (
        <div className="list-group border mb-3" >
            <h4 className="p-2 text-center bg-primary text-white">Groups</h4>
            {groups.length > 0 ? (
                groups.map((group) => (
                    <button
                        key={group.id}
                        className="list-group-item list-group-item-action"
                        onClick={() => onSelectGroup(group)}
                    >
                        {group.group_name}
                    </button>
                ))
            ) : (
                <p className="text-center p-2">No groups available</p>
            )}
        </div>
    );
};

export default GroupList;
