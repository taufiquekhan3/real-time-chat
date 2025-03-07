import React, { useContext } from 'react'
import './RightSidebar.css'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'


const RightSidebar = () => {

  const { chatUser, messages } = useContext(AppContext);

  return chatUser ? (
    <div className='rs'>
      <div className="rs-profile">
        <img src={chatUser.userData.avatar} alt="" />
        <h3>{chatUser.userData.name}{Date.now() - chatUser.userData.lastSeen <= 70000 ?(<img src={assets.green_dot} className='dot ' alt="" />) : null} </h3>
        <p>{chatUser.userData.bio}</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          {
            messages.filter(msg => msg.image )
            .map((msg,index) => (
              <img onClick={() => window.open(msg.image)} src={msg.image} key={index} alt="" />
            ))
          }
          
        </div>
      </div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
    :
    (
      <div className="rs">
        <button onClick={() => logout()}>Logout</button>
      </div>
    )


}

export default RightSidebar
