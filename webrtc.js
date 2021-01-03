 
const myVideo = document.getElementById('myVideo');
const peerStream = document.getElementById('peerStream');
const generate = document.getElementById('generate');
const joinGroupButton = document.getElementById('joinGroupButton');
const websiteLink = window.location.href;
let rtcPeerConn;
var myStream;
let signal_room=123;
var url_string = window.location.href; //window.location.href
var url = new URL(url_string);
var roomCode = url.searchParams.get("code");


function logerror(err){
    console.log(err)
}

async function startStream(){

    try {
        myStream =  await navigator.mediaDevices.getUserMedia({video:true,audio:false});

        attachVideo(myStream,myVideo)
 
     } catch (error) {
            console.log(error)
    }

    return myStream;
}


function attachVideo(stream,videoElement){
    if('srcObject' in videoElement){
        videoElement.srcObject  = stream;
    }else{
        videoElement.src  = stream;
    }
    
    videoElement.play();    
}


 



 
const socket = io('http://localhost:8000');
socket.emit('joinRoom',{signal_room:signal_room});
 
let configuration = {
    
    "iceServers":[{
        'urls': [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun.l.google.com:19302?transport=udp',
            ]
        
    },],
         'optional': [{'DtlsSrtpKeyAgreement': 'true'}]

};


 
 
function displayMessage(msg){
    console.log(msg)
}

 


 
if (navigator.webkitGetUserMedia) {  
    console.log("CHROMEee")
         RTCPeerConnection = webkitRTCPeerConnection;  
    // Firefox  
} else if(navigator.mozGetUserMedia){          
    console.log("Firefoxe")

        RTCPeerConnection = mozRTCPeerConnection;      
        RTCSessionDescription = mozRTCSessionDescription;   
        RTCIceCandidate = mozRTCIceCandidate;  
 }



socket.on("signaling_message",(data)=>{
      if(!rtcPeerConn){
       startSignaling(myStream);
     }

     if(data.type!="user_here"){
         let message  = JSON.parse(data.message);
         if(message.sdp){
             rtcPeerConn.setRemoteDescription(new RTCSessionDescription(message.sdp)).then(()=>{
                if(rtcPeerConn.remoteDescription.type=="offer"){
                     rtcPeerConn.createAnswer().then(d=>sendLocalDesc(d))
                 }
             });
         }else{

            rtcPeerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
         }
     }

});





async function startSignaling(myStream){
 
       displayMessage("start signaling...");
       rtcPeerConn = new RTCPeerConnection(configuration);
        //send ice candidate to other peer
       rtcPeerConn.onicecandidate  = function(evt){
 
               if(evt.candidate){
               socket.emit("signal",{"type":"ice candidate","message":JSON.stringify({'candidate':evt.candidate}),signal_room:signal_room})
 
               displayMessage("completed that ice candidate");
           }
  
       }
        rtcPeerConn.onnegotiationneeded = function(){
         displayMessage("on negotiationnneded");
         rtcPeerConn.createOffer().then(d =>sendLocalDesc(d));
        }

        rtcPeerConn.onaddstream = (evt,err)=>{
        displayMessage("creating  the other stream");
        if(err){
            displayMessage(err)
        }
      attachVideo(evt.stream,peerStream)
 
   
}

let stream = await startStream();
console.log(stream);
try{
    
    rtcPeerConn.addStream(stream);

}catch(e){
    logerror(e)
}


}


function sendLocalDesc(desc){

    rtcPeerConn.setLocalDescription(desc,()=>{
    displayMessage("set local description");
    socket.emit("signal",{type:"SDP",message:JSON.stringify({'sdp':rtcPeerConn.localDescription}),signal_room:signal_room})
 
    },logerror);

}



function joinConversation(){
    socket.emit('ready',{signal_room:signal_room});
    joinGroupButton.classList.remove('btn-success');
    joinGroupButton.classList.add('btn-danger');
    joinGroupButton.innerHTML='welcome';
}

 
 