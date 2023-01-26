const playpausebtn = document.querySelector("#pause-play-button")
const videoContainer = document.querySelector(".video-container")
const miniplayerbtn = document.querySelector(".mini-player-btn")
const theaterbtn = document.querySelector(".theater-btn")
const currentTime = document.querySelector(".current-time")
const totalTime = document.querySelector(".total-time")
const fullscrbtn = document.querySelector(".full-screen-btn")
const video = document.querySelector("video")
const mutebtn = document.querySelector(".mute-btn")
const volumeSlider = document.querySelector(".volume-slider")
const timeLineContainer = document.querySelector(".timeline-container")
const previewimg = document.querySelector(".preview-image")
const thumbimg = document.querySelector(".thumbnail-img")
const captionsBtn = document.querySelector(".closed-caption-btn")
const playBackSpeed = document.querySelector(".speed-btn")

// timeline 

timeLineContainer.addEventListener("mousemove", updateChange)
timeLineContainer.addEventListener("mousedown", toggleScrubbing)
document.addEventListener("mouseup", e => {
    if (isScrubbing) toggleScrubbing(e)
    video.play()
})
document.addEventListener("mousemove", e => {
    if (isScrubbing) updateChange(e)
})
let isScrubbing = false
let WasPaused
function toggleScrubbing(e) {
    const rect = timeLineContainer.getBoundingClientRect()
    const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
    isScrubbing = (e.buttons & 1) === 1
    videoContainer.classList.toggle("scrubbing", isScrubbing)
    if (isScrubbing) {
        WasPaused = video.paused
        video.pause()
    } else {
        video.currentTime = percent * video.duration
        if (!WasPaused) video.play
    }
    updateChange(e)
}

function updateChange(e) {
    const rect = timeLineContainer.getBoundingClientRect()
    const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
    const previewImgNumber = Math.max(
        1,
        Math.floor((percent * video.duration) / 10)
    )
    const previewImgSrc = `previewimgs/img00${previewImgNumber}.jpg`
    previewimg.src = previewImgSrc
    timeLineContainer.style.setProperty("--preview-position", percent)

    if (isScrubbing) {
        e.preventDefault()
        thumbimg.src = previewImgSrc
        timeLineContainer.style.setProperty("--progress-position", percent)
    }
}


//playback speed 
playBackSpeed.addEventListener("click", ChangePlayBackSpeed)
function ChangePlayBackSpeed() {
    let newSpeed = video.playbackRate + 0.25
    if (newSpeed > 2) {
        newSpeed = 0.25
    }
    video.playbackRate = newSpeed;
    playBackSpeed.textContent = `${newSpeed}x`;
}


// captions
video.textTracks[0].mode = "hidden"
captionsBtn.addEventListener("click", toggleCaptions)
function toggleCaptions() {
    let isHidden = video.textTracks[0].mode === "hidden"
    video.textTracks[0].mode = isHidden ? "showing" : "hidden"
    videoContainer.classList.toggle("captions", isHidden)
}


video.addEventListener("loadeddata", () => {
    totalTime.textContent = formatDuration(video.duration);
})
video.addEventListener("timeupdate", () => {
    currentTime.textContent = formatDuration(video.currentTime)
    const percent = video.currentTime / video.duration
    timeLineContainer.style.setProperty("--progress-position", percent)
})

let ZeroFormatter = Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 })
function formatDuration(time) {
    let seconds = Math.floor(time)
    let minutes = Math.floor(time / 60)
    let hours = Math.floor(time / 3600)
    if (hours === 0) {
        return `${minutes}:${ZeroFormatter.format(seconds)}`
    } else {
        return `${hours}:${ZeroFormatter.format(minutes)}:${ZeroFormatter.format(seconds)}`
    }
}

mutebtn.addEventListener("click", toggleMute)
function toggleMute() {
    video.muted = !video.muted
}
miniplayerbtn.addEventListener("click", toggleMiniPlayer)
theaterbtn.addEventListener("click", toggleTheater)
fullscrbtn.addEventListener("click", toggleFullScreen)

volumeSlider.addEventListener("input", (e) => {
    video.volume = e.target.value
    video.muted = e.target.value === 0
})

video.addEventListener("volumechange", () => {
    volumeSlider.value = video.volume
    let volumeLevel;
    if (video.volume == 0 || video.muted) {
        volumeLevel = "muted";
        volumeSlider.value = 0
    } else if (video.volume >= .5) {
        volumeLevel = "high"
    } else {
        volumeLevel = "low"
    }
    videoContainer.dataset.volumeLevel = volumeLevel
})

function toggleMiniPlayer() {
    if (videoContainer.classList.contains("mini-player")) {
        document.exitPictureInPicture()
    }
    else {
        video.requestPictureInPicture()
    }
}
function toggleTheater() {
    videoContainer.classList.toggle("theater")
}
function toggleFullScreen() {
    if (document.fullscreenElement == null) {
        videoContainer.requestFullscreen()
    }
    else {
        document.exitFullscreen()
    }
}

video.addEventListener("enterpictureinpicture", () => {
    videoContainer.classList.add("mini-player")
})

video.addEventListener("leavepictureinpicture", () => {
    videoContainer.classList.remove("mini-player")
})
document.addEventListener("fullscreenchange", () => {
    videoContainer.classList.toggle("full-screen", document.fullscreenElement)
})
video.addEventListener("click", () => {
    togglePlay()
})
document.addEventListener("keydown", (e) => {
    const tagName = document.activeElement.tagName.toLowerCase();
    if (tagName === "input") return
    switch (e.key.toLowerCase()) {
        case " ":
            if (tagName === "button") return
            break
        case "k":
            togglePlay()
            break
        case "f":
            toggleFullScreen()
            break
        case "i":
            toggleMiniPlayer()
            break
        case "t":
            toggleTheater()
            break
        case "m":
            toggleMute()
            break
        case "j":
            skip(-5)
            break
        case "l":
            skip(5)
            break
    }
})

function skip(time) {
    video.currentTime += time;

}

playpausebtn.addEventListener("click", togglePlay)
function togglePlay() {
    video.paused ? video.play() : video.pause()
}

video.addEventListener("play", () => {
    videoContainer.classList.remove("paused")
})
video.addEventListener("pause", () => {
    videoContainer.classList.add("paused")
})