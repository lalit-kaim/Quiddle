import React, { Component } from 'react'
import {IoMdArrowRoundBack} from 'react-icons/io'
import {MdSettings, MdClose} from 'react-icons/md'
import {GiSecretBook} from 'react-icons/gi'
import classes from './Profile.module.css'
import quiddle from '../../quiddle.svg'
import coverPicture from '../../cover.JPG'
import {GoLocation,GoMortarBoard} from 'react-icons/go'
import {BsPersonDashFill, BsPersonPlusFill} from 'react-icons/bs'
import {BsPlus} from 'react-icons/bs'
import {AiFillStar, AiFillPicture} from 'react-icons/ai'
import {FaChalkboardTeacher, FaMale, FaFemale, FaHandsHelping, FaUserFriends} from 'react-icons/fa'
import {GiFemale, GiMale, GiBossKey} from 'react-icons/gi'
import { initialize } from '../config/Config'


class Profile extends Component{

    constructor(props) {
        super(props)
    
        this.state = {
             imageUrls:[],
             username:null,
             userId:null,
             name:null,
             country:'',
             city:'',
             bio:'',
             profileUrl:null,
             coverUrl:null,
             allFavourite:[],
             favFriendsProfilePic:[]
        }
    }

    postOrder = []
    totalFriends = 0;
    allFriendsProfile=[]

    settingOpenHandler(){
        document.getElementById('settingDiv').style.transform="translateX(0px)"
    }
    settingCloseHandler(){
        document.getElementById('settingDiv').style.transform="translateX(260px)"
    }
    logout(){
        localStorage.removeItem('user')
        initialize.auth().signOut();
        window.location.href="/"
    }


    componentDidMount(){
        let imageUrls = []
        let data = null

        let storage = initialize.storage();
        let db = initialize.firestore();
        const uid = initialize.auth().currentUser.uid;
        let ref = storage.ref("posts/"+uid);
        let reff = storage.ref("Profile_Cover");
        db.collection("users/"+uid+"/posts").orderBy("date","desc").get()
        .then(snapshot=>{
            snapshot.forEach((doc)=>{
                this.postOrder.push(doc.data().image)
            })
            return this.postOrder;
        })
        .then(ress =>{
            ref.listAll().then((res)=>{
                res.items.forEach((itemRef)=>{
                    for(let i=0;i<ress.length;i++){
                        if(ress[i]===itemRef.name){
                            itemRef.getDownloadURL().then((url)=>{
                                imageUrls[i]=url;
                                this.setState({imageUrls:imageUrls})
                            })
                            .catch(err=>{
            
                            })
                        }
                    }
                })
            })
            .catch(function(err){
                console.log("error",err)
            })
        })
        .catch(err=>{
            
        }) 
        db.collection("users").doc(uid).get().then((doc)=>{
            data =  doc.data()
            this.setState({username:data.username,name:data.name, userId:data.userId, country:data.country, city:data.city, bio:data.bio})
        })
        .catch(err=>{
            
        })
        storage.ref("Profile_Cover/profile"+uid).getDownloadURL().then(url=>{
            this.setState({profileUrl:url})
        }).catch(err=>{
            
        })
        storage.ref("Profile_Cover/cover"+uid).getDownloadURL().then(url=>{
            this.setState({coverUrl:url})
        }).catch(err=>{
            
        })

        db.collection("users/"+uid+"/friends").where("status","==","friend").get().then(res=>{
            this.totalFriends = res.size;
        }).catch(err=>{
            
        })

        let temp3=[]
        db.collection("users/"+uid+"/friends").where("favourite","==",true).get().then(res=>{
            res.forEach(doc=>{
                db.doc("users/"+doc.id).get().then(res=>{
                    temp3.push(res.data().userId)
                    this.setState({allFavourite:[...temp3]})
                    return this.state.allFavourite
                })
                .then(ress=>{
                    reff.listAll().then((res)=>{
                        res.items.forEach((itemRef)=>{
                            for(let i=0;i<ress.length;i++){
                                if("profile"+ress[i]===itemRef.name){
                                    itemRef.getDownloadURL().then((url)=>{
                                        this.allFriendsProfile[i]=url;
                                        this.setState({favFriendsProfilePic:[...this.allFriendsProfile]})
                                    })
                                    .catch(err=>{
            
                                    })
                                }
                                else{
                                    this.allFriendsProfile[i]=quiddle;
                                    this.setState({favFriendsProfilePic:[...this.allFriendsProfile]})
                                }
                            }
                        })
                    })
                    .catch(function(err){
                        console.log("error",err)
                    })
                })
                .catch(err=>{
            
                })
            })
        })
        .catch(err=>{
            
        })
    }

    profileChangeHandler=(event)=>{
        let storage = initialize.storage();
        let ref = storage.ref("Profile_Cover/profile"+initialize.auth().currentUser.uid);
        ref.put(event.target.files[0]).then(function(){
            alert("Profile Picture Successfully Uploaded")
            window.location.href="/profile"
        })
        .catch(err=>{
            
        })
    }
    coverChangeHandler=(event)=>{
        let storage = initialize.storage();
        let ref = storage.ref("Profile_Cover/cover"+initialize.auth().currentUser.uid);
        ref.put(event.target.files[0]).then(function(){
            alert("Cover Picture Successfully Uploaded")
            window.location.href="/profile"
        })
        .catch(err=>{
            
        })
    }
    removerProfileHandler(){
        let storage = initialize.storage();
        let ref = storage.ref("Profile_Cover/profile"+initialize.auth().currentUser.uid);
        ref.delete().then(function() {
            alert("Profile Picture Deleted")
            window.location.href="/profile"
        }).catch(function(error) {
            alert("Error: File Not Found")
        });
    }
    removerCoverHandler(){
        let storage = initialize.storage();
        let ref = storage.ref("Profile_Cover/cover"+initialize.auth().currentUser.uid+"/cover");
        ref.delete().then(function() {
            alert("Cover Picture Deleted")
            window.location.href="/profile"
        }).catch(function(error) {
            alert("Error: File Not Found")
        });
    }

    showPostHandler=(event)=>{
        window.location.href="/showpost?id="+event.target.id+"&userId="+this.state.userId
    }

    userProfileHandler=(event)=>{
        window.location.href="/userprofile?userId="+event.target.id
    }

    goBackHandler(){
        window.location.href="/"
    }

    render(){
        let list = []
        let imageList = []
        let profile = null
        let cover = null

        if(this.state.favFriendsProfilePic.length>0)
        for(let i=0;i<this.state.favFriendsProfilePic.length;i++){
            list[i]=<li key={i}><img id={this.state.allFavourite[i]} onClick={this.userProfileHandler} src={this.state.favFriendsProfilePic[i]}/></li>
        }
        if(this.state.imageUrls.length>0)
            for(let i=this.state.imageUrls.length-1;i>=0;i--){
                imageList[i]=<div key={i} className="col-4" id={this.postOrder[i]} onClick={this.showPostHandler}><img id={this.postOrder[i]} className="img-fluid" src={this.state.imageUrls[i]} alt=""/></div>
            }

        if(this.state.profileUrl){
            profile = <img className="img-fluid" src={this.state.profileUrl}/>
        }
        else{
            profile =  <img className="img-fluid" src={quiddle}/>
        }
        if(this.state.coverUrl){
            cover = <img className="img-fluid" src={this.state.coverUrl}/>
        }
        else{
            cover =  <img className="img-fluid" src={coverPicture}/>
        }

        for(let i=0;i<document.getElementsByClassName("col-4").length;i++){
            document.getElementsByClassName("col-4")[i].style.height=document.getElementsByClassName("col-4")[i].clientWidth+"px"
        } 

        return (
            <div className={classes.profileMain}>
                <header className={classes.header}>
                    <div>
                        <a onClick={this.goBackHandler}><IoMdArrowRoundBack size="30px" color="black"/></a>
                        <h5>{this.state.username}</h5>
                    </div>
                    <div onClick={this.settingOpenHandler}>
                        <MdSettings size="25px"/>
                    </div>
                    <div className={classes.settingDiv} id="settingDiv">
                        <div>
                            <a style={{textAlign:"right"}} onClick={this.settingCloseHandler} ><MdClose size="25px"/></a>
                        </div>
                        <div>
                            <a data-toggle="modal" data-target="#removeProfileCover">Remove Profile/Cover Pic</a>
                        </div>
                        <div>
                            <a data-toggle="modal" data-target="#uploadProfileCover">Upload Profile/Cover Pic</a>
                        </div>
                        <div>
                            <a href="/settings">Settings</a>
                        </div>
                        <div>
                            <a onClick={this.logout}>Logout</a>
                        </div>
                    </div>
                </header>
                <div className={classes.cover_picture_div}>
                    {cover}
                </div>
                <div className={classes.profile_picture_main}>
                    <div className={classes.profile_picture}>
                        <div style={{backgroundColor:"white"}}>
                            {profile}
                        </div>                    
                        <div>
                            <h6>{this.state.name}</h6>
                            <p><GoLocation size="20px"/>{this.state.city+", "+this.state.country}</p>
                        </div>
                    </div>
                    <div>
                        <div className={classes.friends}>
                            <span>Friends</span>
                            <span>{this.totalFriends}</span>
                        </div>
                    </div>
                </div>

{/* modal start for update profile/cover as */}

                <div className="modal fade" id="uploadProfileCover" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className={"modal-dialog "+classes.uploadProfileCover} role="document">
                        <div className="modal-content">
                            <div className={"modal-body "+classes.uploadProfileCoverInner}>
                                <div>
                                    <AiFillPicture onClick={this.removerProfileHandler} size="100px"/>
                                    <label className={classes.uploadFileLabel}>Profile Picture</label>
                                    <input className={classes.uploadFileInput} type="file" onChange={this.profileChangeHandler}/>
                                </div>
                                <div>
                                    <AiFillPicture onClick={this.removerProfileHandler} size="100px"/>
                                    <label className={classes.uploadFileLabel}>Cover Picture</label>
                                    <input className={classes.uploadFileInput} type="file" onChange={this.coverChangeHandler}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

{/* modal end for update profile/cover as */}

{/* modal start for remove profile/cover */}

                <div className="modal fade" id="removeProfileCover" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className={"modal-dialog "+classes.removeProfileCover} role="document">
                        <div className="modal-content">
                            <div className={"modal-body "+classes.removeProfileCoverInner}>
                                <div>
                                    <AiFillPicture onClick={this.removerProfileHandler} size="100px"/>
                                    <a style={{color:"#007bff"}} onClick={this.removerProfileHandler}>Remove Profile</a>
                                </div>
                                <div>
                                    <AiFillPicture onClick={this.removerCoverHandler} size="100px"/>
                                    <a style={{color:"#007bff"}} onClick={this.removerCoverHandler}>Remove Cover</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

{/* modal end for remove profile/cover */}

                <div className={classes.about}>    
                    <p><GiSecretBook /> {this.state.bio}</p>
                </div>
                <div className={classes.friendsList}>
                    <div>
                        <h6><AiFillStar color="#ffad60"/> Friends</h6>
                    </div>
                    <div className="uk-position-relative uk-visible-toggle uk-light" tabIndex="-1" uk-slider="sets:false; finite:true">
                        <ul className="uk-slider-items">
                            {list}
                        </ul>
                    </div>
                </div>
                <div className={"container "+classes.postMain}>
                    <div className="row">
                        {imageList}
                    </div>
                </div>
                <div className={classes.newPostButton} id="newPostButton">
                    <a href="/createpost"><BsPlus size="45px"/></a>
                </div>
            </div>
        )
    }
}

export default Profile
