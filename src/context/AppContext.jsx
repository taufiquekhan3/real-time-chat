import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProfileUpdate from "../pages/ProfileUpdate/ProfileUpdate";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState([]);
    
    // states for setChat 
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);

    const loaduserData = async (uid) => {
        try {
            console.log(`Fetching user data for UID: ${uid}`);  // important this only works for login 
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            console.log(userSnap);
            

            if (!userSnap.exists()) {
                console.log("No user data found in Firestore!");
                navigate("/profile");
                return;
              }


            const userData = userSnap.data();

            setUserData(userData)
            if (userData.avatar && userData.name) {
                navigate('/chat');
            }
            else {
                navigate('/profile');
            }
            //  
            // console.log(userSnap);
            // const interval = setInterval(() => {
            //     updateDoc(userRef, { lastSeen: Date.now() });
            // }, 60000);
    

        } catch (error) {

        }
    }

    useEffect(() => {
        if (!userData) return;

        const userRef = doc(db, 'users', userData.id);

        // Update last seen immediately when userData is available
        updateDoc(userRef, { lastSeen: Date.now() });

        // Start an interval to update last seen every 60 seconds
        const interval = setInterval(() => {
            updateDoc(userRef, { lastSeen: Date.now() });
        }, 60000);

        // Cleanup function to clear interval on unmount
        return () => clearInterval(interval);
    }, [userData]); // Runs only when userData changes


    // this is a merging code 
    useEffect(() => {
        if (userData) {
            const chatRef = doc(db, 'chats', userData.id);
            const unSub = onSnapshot(chatRef, async (res) => { // on snapshot function to see live changes in chatsdata of current user logged in
                const chatItems = res.data().chatsData; // extracts the chatdata of current logged user 
                const tempData = [];
                // console.log(chatItems)
                for (const item of chatItems) { //Each item represents one chat conversation (e.g., with a friend)
                    const userRef = doc(db, 'users', item.rId); //item.rId is the receiver's ID (the person you're chatting with).
                    // This creates a Firestore reference to fetch their user details from the "users" collection.
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.data();
                    tempData.push({ ...item, userData })
                }
                setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt))
            })
            return () => {
                unSub();
            }
        }
    }, [userData])

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loaduserData,
        messagesId, setMessagesId,
        messages, setMessages,
        chatUser, setChatUser
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;