import React, { useContext, useEffect, useState } from 'react'
import './Chat.css'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import ChatBox from '../../components/ChatBox/ChatBox'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import { AppContext } from '../../context/AppContext'

const Chat = () => {

  const { chatData, userData } = useContext(AppContext);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    if (chatData && userData) {
      setloading(false)
    }

  }, [chatData, userData])


  return (
    <div className='chat'>
      {
        loading
          ? <p className='laoding'>Loading...</p>
          : <div className="chat-container">

            <LeftSidebar />
            <ChatBox />
            <RightSidebar />
          </div>
      }
    </div>

  )
}

export default Chat
