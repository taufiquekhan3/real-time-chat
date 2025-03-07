import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'
import uploadToCloudinary from '../../lib/upload'

const ChatBox = () => {


  const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext)

  const [input, setinput] = useState("");
  console.log(chatUser)

  const sendMessage = async () => {

    try {
      // console.log(messagesId);
      if (input && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date()
          })
        })

        const userIDs = [chatUser.rId, userData.id];

        // userIDs.forEach(async (id) => {
        for (const id of userIDs) {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);
          // console.log(userChatsSnapshot);


          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();

            // Get correct index
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messagesId === messagesId)

            if (chatIndex !== -1) {

              userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 15);
              userChatData.chatsData[chatIndex].updatedAt = Date.now();

              // Ensure message is marked unread for the receiver tauseef 
              if (userChatData.chatsData[chatIndex].rId === userData.id) {
                userChatData.chatsData[chatIndex].messageSeen = false;
              }

              // Update Firestore
              await updateDoc(userChatsRef, {
                chatsData: userChatData.chatsData
              })
            }

          }
        }

      }
      setinput("");

    } catch (error) {
      toast.error(error.message)
    }
  }

  const sendImage = async (e) => {
    try {
      const fileUrl = await uploadToCloudinary(e.target.files[0]);

      if (fileUrl && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date()
          })
        })

        const userIDs = [chatUser.rId, userData.id];

        // userIDs.forEach(async (id) => {
        for (const id of userIDs) {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);
          console.log(userChatsSnapshot);


          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();

            // Get correct index
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messagesId === messagesId)
            console.log(`inside chatindex ${chatIndex}`)

            if (chatIndex !== -1) {

              userChatData.chatsData[chatIndex].lastMessage = "Image";
              userChatData.chatsData[chatIndex].updatedAt = Date.now();

              // Ensure message is marked unread for the receiver tauseef 
              if (userChatData.chatsData[chatIndex].rId === userData.id) {
                userChatData.chatsData[chatIndex].messageSeen = false;
              }

              // Update Firestore
              await updateDoc(userChatsRef, {
                chatsData: userChatData.chatsData
              })
            }

          }
        }


      }
    } catch (error) {
      toast.error(error.message);
      console.log(error.message);

    }
  }

  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    if (hour > 12) {
      return hour - 12 + ":" + minute + "PM";
    }
    else {
      return hour + ":" + minute + "AM";
    }

  }

  // starts from here main
  useEffect(() => {

    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        // console.log("Firestore response:", res.data()); // Debugging Firestore data
        setMessages([...res.data().messages.reverse()])  // storing all the messages between me and tauseef in reverse order since 
        // console.log(res.data().messages.reverse()); // messagesId for me and tauseef is same.
        console.log(messages);
      })

      // console.log(messages);


      return () => {
        unSub();
      }
    }
  }, [messagesId])


  // console.log("Time Difference:", Date.now() - chatUser?.userData?.lastSeen);
  // console.log("Time Difference current time :", Date.now());
  // console.log("Time Difference lastseen:", chatUser?.userData?.lastSeen);
  console.log("Message Seen:", chatUser?.messageSeen);
  console.log(chatUser);
  
 

  return chatUser ? (

    <div className="chat-box">
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>{chatUser.userData.name}{Date.now() - chatUser.userData.lastSeen <= 70000 ? (<img src={assets.green_dot} className='dot ' alt="" />) : null}  </p>

        <img src={assets.help_icon} className='help' alt="" />
      </div>

      <div className="chat-msg">

        {
          messages.map((msg, index) => (

            <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
              {msg["image"]
                ? <img src={msg.image} className='msg-img' alt="" /> :
                <p className="msg">{msg.text}</p>}

              <div>
                <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />


                <p>{convertTimestamp(msg.createdAt)} {chatUser.messageSeen && (msg.sId === userData.id) ? userData.email : ""} </p>
              </div>
            </div>
          ))
        }


        {/* <div className="s-msg">
          <img src={assets.pic1} className='msg-img' alt="" />
          <div>
            <img src={assets.profile_img} alt="" />
            <p>2:30 PM</p>
          </div>
        </div>

        <div className="r-msg">
          <p className="msg">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Accusantium, veritatis.</p>
          <div>
            <img src={chatUser.userData.avatar} alt="" />
            <p>2:30 PM</p>
          </div>
        </div> */}

      </div>


      <div className='chat-input'>
        <input onChange={(e) => setinput(e.target.value)} value={input} type="text" placeholder='Send a message' />
        <input onChange={sendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />

        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>

  ) : <div className="chat-welcome">
    <img src={assets.logo_icon} alt="" />
    <p>Chat anytime,anywhere</p>
  </div>
}

export default ChatBox
