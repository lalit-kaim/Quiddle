import React, { Component } from 'react'
import classes from './CreatePost.module.css'
import {MdPhotoSizeSelectActual} from 'react-icons/md'
import $ from 'jquery'
import { initialize } from '../config/Config'

class CreatePost extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             title:'',
             image:'',
             date:'',
             likes:[]
        }
    }
    file = null
    random = Math.random().toString(16).substring(2,12);

    filePreview=(event)=>{

        var reader = new FileReader();
        reader.onload = function (e) {
            $('#image').remove();
            $('#imagePreviewDiv').append('<img id="image"/>');
            $('#image').attr('src', e.target.result);
        };
        this.file = event.target.files[0]
        this.setState({image:this.random})
        reader.readAsDataURL(event.target.files[0]);
    }

    createPostHandler=()=>{
        if(this.state.title.trim().length===0 || this.file===null){
            alert('Please write title and upload picture properly.')
        }
        else{
            let storage = initialize.storage();
            let db = initialize.firestore();
            const userid = initialize.auth().currentUser.uid;
            let ref = storage.ref("posts/"+userid+"/"+this.random);
            let uploadTask = ref.put(this.file);
            uploadTask.on('state_changed', function(snapshot){
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                document.getElementById("progressMainDiv").style.display="block";
                document.getElementById("progressBar").style.width=progress+"%";
                }, function(error) {
                    
                }, function() {
                    window.location.href="/profile"
                });
            db.collection("users/"+userid+"/posts/").add({title:this.state.title,image:this.state.image, date:new Date(), likes:[]})
            .then(function(docRef) {

            })
            .catch(function(error) {
                alert("Error :", error);
            });
        }
    }

    textareaHandler=(event)=>{
        this.setState({title:event.target.value})
    }

    goBack(){
        window.location.href="/profile"
    }

    render() {

        return (
            <div className={classes.createPostMainDiv}>
                <header className={classes.header}>
                    <a onClick={this.goBack} style={{color:"#007bff"}}>Cancel</a>
                    <button onClick={this.createPostHandler}>Post</button>
                </header>
                <h5>Create Post</h5>
                <div className={classes.postForm}>
                    <div>
                        <textarea onChange={this.textareaHandler} value={this.state.title} type="text" placeholder="What's going on?"/>
                        <div id="imagePreviewDiv" className={classes.imagePreviewDiv}>
                        </div>
                    </div>
                    <div className={classes.photoUploadDiv}>
                        <button><MdPhotoSizeSelectActual size="30px"/></button>
                        <input onChange={this.filePreview} id="file" type="file"/>
                    </div>
                </div>

                <div className={classes.progressMainDiv} id="progressMainDiv">
                    <div></div>
                    <div id="processTitle">Processing...</div>
                    <div className="progress">
                        <div className="progress-bar bg-info" id="progressBar" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            </div>
        )
    }
}

export default CreatePost
