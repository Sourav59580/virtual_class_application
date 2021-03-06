
// Name entry
let name;
let gender;
let imagesrc;
do {
    name = prompt('Please enter your name: ')
    gender = prompt('Please enter your gender: ')
} while(!name||!gender)

// set avatar
if(gender.toLowerCase()=='male')
imagesrc = "https://img.icons8.com/color/36/000000/administrator-male.png";
else if(gender.toLowerCase()=='female')
imagesrc = "https://img.icons8.com/office/36/000000/person-female.png";



const socket = io('/')
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    //port: '3001'
    port : '443'
})

// select video grid container
const videoGrid = document.getElementById("video-grid");

let myVideoStream;
let ownVideoStream;
//create a video 
const myvideo = document.createElement("VIDEO");
myvideo.addClass = "video"
myvideo.muted = true;

//count person
var person = 1;

// total present in video chat
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    ownVideoStream = stream
    addVideoStream(myvideo, ownVideoStream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        video.addClass = "video"
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        console.log("User connected " + userId)
        connectToNewUser(userId, stream);
    })

    // message send to server
    $('html').keydown(function (e) {
        var text = $("#chat_message").val();
        if (e.which == 13 && text.length > 0) {
            var d = new Date()
            var time = (d.toLocaleTimeString().replace(/:\d{2}\s/,' '));
            let msg = {
                user: name,
                message: text.trim(),
                imagesrc: imagesrc,
                time : time
            }
            socket.emit('message', msg);
            appendmessages(msg,'outgoing')
            scrollToBottom();
            $("#chat_message").val("");
        }
    })

    // message get from server
    socket.on('createMessage', message => {
        //$(".messages").append(`<li class='message'><b>${message.user}</b><br>${message.message}</li>`);
        appendmessages(message,'incomming')
        scrollToBottom();
    })

    // disconnect end call user
    socket.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close()
        child();
        // send server count of user decrease
        


    })
})


// other new user video setup
function connectToNewUser(userId, stream) {
    person+=1;
    console.log(person)
    // send server count of user increase

    const call = myPeer.call(userId, stream)
    const video = document.createElement("video")
    video.addClass = "video"
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove();
    })
    peers[userId] = call
}


// own video setup
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addClass = "video"
    video.addEventListener('loadedmetadata', () => {
        video.play()
        child();
    })
    videoGrid.append(video);
}

function child(){
    count = 0;
    var width = ($("#video-grid").innerWidth());
    console.log(width);
    $("video").addClass("video")
    var child = $("#video-grid video").length
    console.log(child);
    $(".participants").html("");
    $(".participants").html(child)
    $(".video").css("width",width/child);
    $(".video").css("height","auto");
 }

myPeer.on('open', id => {
    socket.emit('join-room', roomId, id)
})

// outgoing message
function appendmessages(msg,type){
  if(type=='incomming')
  {
    $(".messages").append(`<div class="incomming my-1">
    <div class="d-flex justify-content-between px-3 mb-1">
        <small>${msg.user}</small>
        <small>${msg.time}</small>
    </div>
    <div class="media px-3">
        <div class="rounded-circle text-center text-light">
            <img class="direct-chat-img" src="${msg.imagesrc}" alt="message user image">
        </div>
        <div class="media-body bg-warning p-2 rounded ml-2">
            <p>${msg.message}</p>
        </div>
    </div>
</div>`)
  }else{
    $(".messages").append(` <div class="outgoing mt-3">
    <div class="d-flex justify-content-between px-3 mb-1">
        <small>${msg.time}</small>
        <small>${msg.user}</small>
    </div>
    <div class="media px-3">
        <div class="media-body bg-info text-light p-2 rounded mr-2">
            <p>${msg.message}</p>
        </div>
        <div class="rounded-circle text-center text-light">
            <img class="direct-chat-img" src="${msg.imagesrc}" alt="message user image">
        </div>
    </div>
</div>`)
  }

}



// scrollToBottom
function scrollToBottom() {
    var chat_window = $(".main__chat_window")
    chat_window.scrollTop(chat_window.prop("scrollHeight"))
}

// muteUnmute
function muteUnmute() {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        $(".audio").removeClass('d-none');
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        $(".audio").addClass('d-none');
    }
}

//play stop video
function playStop() {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        $(".playstop").removeClass('d-none');
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        $(".playstop").addClass('d-none');
    }
}

// share screen
function shareScreen() {

    navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    }).then(stream => {
        ownVideoStream = stream;
        addVideoStream(myvideo, ownVideoStream)

        myPeer.on('call', call => {
            call.answer(stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        })

        socket.on('user-connected', userId => {
            console.log("User connected " + userId)
            connectToNewUser(userId, stream);
        })

        // disconnect end call user
        socket.on('user-disconnected', userId => {
            if (peers[userId]) peers[userId].close()
            person -= 1;
            console.log(person);
            $(".participants").html(person);
        })
    })

}