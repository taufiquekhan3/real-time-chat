import React, { useContext, useState } from 'react'
import './LeftSidebar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import ProfileUpdate from '../../pages/ProfileUpdate/ProfileUpdate'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { AppContext } from '../../context/AppContext'
import { db } from '../../config/firebase'

const LeftSidebar = () => {

    const navigate = useNavigate();
    const { userData, chatData, messagesId, setMessagesId,
        messages, setMessages,
        chatUser, setChatUser } = useContext(AppContext);

    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);


    // Prevents popping duplicate chats in your list.
    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                const userRef = collection(db, 'users'); // searching for the user with input name
                const q = query(userRef, where("username", "==", input.toLowerCase()));
                const querySnap = await getDocs(q);
                if (!querySnap.empty && querySnap.docs[0].data().id != userData.id) { // avoiding to display our own name
                    let userExist = false
                    chatData.map((item) => {  // looping through chatData items to check if the user we searched for exist in chatData or not ???
                        if (item.rId === querySnap.docs[0].data().id) { // if yes then okk 
                            userExist = true;
                        }
                    })
                    if (!userExist) { //if not then we will add that user in the chatdata              
                        setUser(querySnap.docs[0].data());
                    }
                }
                else {
                    setUser(null);
                }
            }
            else {
                setShowSearch(false);
            }

        } catch (error) {

        }
    }

    const addChat = async () => {
        const messagesRef = collection(db, "messages");// at first I am creating messagesID, with that ID I'updating to taukeer and me messagesId 
        const chatsRef = collection(db, "chats");
        try {
            const newMessageRef = doc(messagesRef);

            await setDoc(newMessageRef, { // create a document with timestamp inside messages
                createAt: serverTimestamp(),
                messages: []
            })

            await updateDoc(doc(chatsRef, userData.id), { // updating document of user with the rid to whom he is chatting when clicked on chat in chat list when logged in.
                chatsData: arrayUnion({
                    messagesId: newMessageRef.id,
                    lastMessage: "",
                    rId: user.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })

            await updateDoc(doc(chatsRef, user.id), {  // updating document of user with the id(sening messages), logged in and sending message to that user
                chatsData: arrayUnion({
                    messagesId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id, // only this changes
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })
        } catch (error) {
            toast.error(error.message);
            console.log(error.message)
        }
    }

    // making chat ready 
    const setChat = async (item) => {
        setMessagesId(item.messagesId); // setting tauseef messageid
        setChatUser(item) // setting tauseef userdata and chats which is inside item 
        const userChatsRef = doc(db,'chats',userData.id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        const userChatData = userChatsSnapshot.data();
        const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === item.messageId);
        console.log(chatIndex);
        userChatData.chatsData[chatIndex].messageSeen = true;
        await updateDoc(userChatsRef , {
            chatsData : userChatData.chatsData
        })
        
        // console.log(item);// receiving taukeer lastSeen etc. and his userdata

    }
    // console.log(messagesId)

    return (
        <div className='ls'>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} className='logo' alt="" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                        <div className="sub-menu">
                            <p onClick={() => navigate('/profile')}>Edit profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>

                    </div>
                </div>
                <div className="ls-search">
                    <img src={assets.search_icon} alt="" />
                    <input onChange={inputHandler} type="text" placeholder='search here...' />
                </div>
            </div>
            <div className="ls-list">
                {showSearch && user
                    ? <div onClick={addChat} className="friends add-user">
                        <img src={user.avatar} alt="" />
                        <p>{user.name}</p>
                    </div>
                    :
                    chatData.map((item, index) => (  // receiving tauseef lastSeen etc. and his userdata in item.
                        <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "":"border"}`}>
                            <img src={item.userData.avatar} alt="" />
                            <div>
                                <p>{item.userData.name}</p>
                                <span>{item.lastMessage}...</span>
                            </div>
                        </div>
                    ))


                }


            </div>
        </div>
    )
}

export default LeftSidebar
