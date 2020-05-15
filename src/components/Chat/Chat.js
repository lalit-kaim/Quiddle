import React, { Component } from 'react'
import {IoMdArrowRoundBack} from 'react-icons/io'
import {IoMdSend} from 'react-icons/io'
import classes from './Chat.module.css'
import quiddle from '../../quiddle.svg'
import quiddleIcon from '../../quiddle.PNG'
import { initialize } from '../config/Config'
import $ from 'jquery'

class Chat extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
            name:'',
            token:null,
            imageUrl:'',
            inputVal:'',
            chatArray:[]
        }
    }

    userId = null
    tempChatArray = []

    goBackHandler(){
        window.location.href="/"
    }

    inputHandler=(event)=>{
        this.setState({inputVal:event.target.value})
    }

    userProfileHandler=(event)=>{
        window.location.href="/userprofile?userId="+event.target.id
    }

    sendHandler=()=>{
        if(this.state.inputVal.length===0)
            return
        let combinedDoc;
        let db = initialize.firestore();
        const uid = initialize.auth().currentUser.uid;
        document.getElementById("inputElement").value=""
        if(uid<this.userId){
            combinedDoc=uid+""+this.userId
        }
        else{
            combinedDoc=this.userId+""+uid
        }
        db.collection("chats").doc(combinedDoc).get()
        .then(res=>{
            if(res.data()===undefined)
                db.collection("chats").doc(combinedDoc).set({})
        })
        db.collection("chats/"+combinedDoc+"/messages").add({
            message: this.state.inputVal,
            sender : uid,
            receiver: this.userId,
            time: new Date()
        })
        .then(res=>{
            window.scrollTo(0,document.body.clientHeight)
            db.collection("chats/"+combinedDoc+"/messages/").doc(res.id).onSnapshot(doc=>{
                db.doc("users/"+uid).get().then(res=>{
                    const senderName = res.data().name
                    this.sendMessageNotification(senderName, this.state.token, doc.data().sender);
                })
            })
        })
        .catch(err=>{

        })
        this.setState({inputVal:''})
        document.getElementById("inputElement").focus()
    }

    sendMessageNotification=(senderName, FCMToken, senderId)=>{
        $.ajax({        
            type : 'POST',
            url : "https://fcm.googleapis.com/fcm/send",
            headers : {
                Authorization : 'key=' + 'AAAAgQHubVs:APA91bGu4mYyVJXQDWUfALhqrLYwBrehvhfyR20y9_R4BYM06pIO0uCkvwDzTqhDOEUFFTiJidfLQJ36M2FymLaLsKpGP6cqa7E6YNpKLRm56pk35YyqEW-MC-PjKfcATPbt2JWSWNuH'
            },
            contentType : 'application/json',
            dataType: 'json',
            data: JSON.stringify({"to": FCMToken, "notification": {"title":senderName, "body":"Send you a message", "icon":"https://firebasestorage.googleapis.com/v0/b/the-quiddle.appspot.com/o/posts%2Ftst9AFrpXRV0JiigSPxPNXJaByb2%2Fd631d40b96?alt=media&token=e6641e71-80ee-4902-b465-05ac648f7721", "requireInteraction": "true", "click_action":"/chat?userId="+senderId}}),
            success : function(response) {
                
            },
            error : function(xhr, status, error) {
                console.log(xhr.error);                   
            }
        });
    }

    componentDidMount=()=>{
        let db = initialize.firestore();
        let storage = initialize.storage();
        const uid = initialize.auth().currentUser.uid;
        let combinedDoc;
        db.collection("users").doc(this.userId).get()
        .then(res=>{
            this.setState({name:res.data().name, token:res.data().token})
        })
        .catch(err=>{
            
        })
        storage.ref("Profile_Cover/"+"profile"+this.userId).getDownloadURL()
        .then(url=>{
            this.setState({imageUrl:url})
        })
        .catch(err=>{
            console.log("Error: No profile pic was uploaded by user.")
            this.setState({imageUrl:quiddle})
        }) 

        if(uid<this.userId){
            combinedDoc=uid+""+this.userId
        }
        else{
            combinedDoc=this.userId+""+uid
        }
        let temp = 0

        db.collection("chats/"+combinedDoc+"/messages").orderBy("time").onSnapshot(docc=>{
            docc.docChanges().forEach((doc)=>{
                if(doc.doc.data().sender===uid){
                    this.tempChatArray.push(<div key={temp++} className={classes.individualMainDiv}>
                                                    <div className={classes.rightChat}>
                                                        <div>
                                                            <p>{doc.doc.data().message}</p>
                                                        </div>
                                                    </div>
                                                </div>)
                }
                else{
                    this.tempChatArray.push(<div key={temp++} className={classes.individualMainDiv}>
                                                    <div className={classes.leftChat}>
                                                        <div>
                                                            <p>{doc.doc.data().message}</p>
                                                        </div>
                                                    </div>
                                                </div>)
                }
            })
            this.setState({chatArray:[...this.tempChatArray]})
            window.scrollTo(0,document.body.clientHeight)
        })

        let typingTimer;                
        const doneTypingInterval = 2000; 
        const myInput = document.getElementById('inputElement');
        myInput.addEventListener('input', () => {
            clearTimeout(typingTimer);
            if (myInput.value) {
                db.doc("users/"+this.userId+"/friends/"+uid).set({
                    isTyping:true
                },{merge:true})
                .then(res=>{})
                typingTimer = setTimeout(doneTyping, doneTypingInterval);
            }
        });
        const myTemp = this.userId
        function doneTyping () {
            db.doc("users/"+myTemp+"/friends/"+uid).set({
                isTyping:false
            },{merge:true})
            .then(res=>{
            })
        }

        db.doc("users/"+uid+"/friends/"+this.userId).onSnapshot(doc=>{
            if(doc.data().isTyping){
                document.getElementById("typingDiv").style.opacity="1"
            }
            else{
                document.getElementById("typingDiv").style.opacity="0"
            }
        })
    }

    componentDidUpdate(){
        if(this.state.inputVal.length===0){
            const db = initialize.firestore();
            const uid = initialize.auth().currentUser.uid;
            db.doc("users/"+this.userId+"/friends/"+uid).set({
                isTyping:false
            },{merge:true})
            .then(res=>{
            })
        }
    }

    render() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.userId = urlParams.get('userId');
        const db = initialize.firestore();
        const uid = initialize.auth().currentUser.uid
        
        db.collection("users/"+uid+"/friends").where("status","==","friend").get().then(res=>{
            let temp=[]
            res.forEach(doc=>{
                temp.push(doc.id)
            })
            return temp
        })
        .then(res=>{
            if(!res.includes(this.userId)){
                window.location.href="/"
            }
        })

        return (
            <div>
                <header className={classes.header}>
                    <div>
                        <IoMdArrowRoundBack onClick={this.goBackHandler} size="35px"/>
                    </div>
                    <h4 style={{marginBottom:"9px"}}>{this.state.name}</h4>
                    <div className={classes.profilePic}> 
                        <div>
                            <img id={this.userId} onClick={this.userProfileHandler} src={this.state.imageUrl} alt="image"/>
                        </div>
                    </div>
                    <div className={classes.whenTyping} id="typingDiv">
                        <span>Typing...</span>
                    </div>
                </header>
                <div className={classes.chatMainDiv} id="focusChild">
                    {this.state.chatArray}                      
                </div>
                <footer className={classes.footer}>
                    <div className="input-group">
                        <input type="text" onChange={this.inputHandler} value={this.state.inputVal} id="inputElement" className="form-control" placeholder="Type a message..."/>
                        <div onClick={this.sendHandler} className={"input-group-append "+classes.sendBtn}>
                            <span className="input-group-text"><IoMdSend size="25px" color="white"/></span>
                        </div>
                    </div>
                </footer>
            </div>
        )
    }
}

export default Chat
