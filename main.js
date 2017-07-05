//© 2016 Swainson Holness

var btnToggle = false;
var ctrlBtnToggle = false;
var timeOutSwitch = false;
var strictBtn = false;
var power = false;
var errSwitch = false;
var mainStart = false;

(function () {
    var seqArr = [];
    var num = 0;
    var breakTime;
    var startTime;
    var timeBuzz;
    var errTime;
    
    //Define random generator
    function ranNum(min, max) {
        var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomNum;
    }
    
	// create web audio api context
	var AudioContex = window.AudioContext || window.webkitAudioContext;
    var audioCtx = new AudioContex();
    
	// create Oscillator node
	var keyArr = [
		greenKey = audioCtx.createOscillator(),
		redKey = audioCtx.createOscillator(),
		blueKey = audioCtx.createOscillator(),
		yellowKey = audioCtx.createOscillator()
	];
    
    // error node
    var errKey = audioCtx.createOscillator();

	// initialize waves
	greenKey.type = 'sine'; 
    greenKey.frequency.value = 261.63; 
	redKey.type = 'sine'; 
    redKey.frequency.value = 311.13; 
	blueKey.type = 'sine'; 
    blueKey.frequency.value = 392.00; 
	yellowKey.type = 'sine'; 
    yellowKey.frequency.value = 466.16; 
	errKey.type = 'square'; 
    errKey.frequency.value = 100.16; 

	// color button mouse and touch event controls
	var mobile   = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent); 
	var start = mobile ? "touchstart" : "mousedown";
	var end = mobile ? "touchend" : "mouseup";
	var ctrlBtnArr = [
	    ctrlBtnGreen = {eventId: "ctrlBtnGreen", id: "#ctrlBtnGreen", color: "#00f91d", nocolor: "#58bb68", sound: greenKey},
	    ctrlBtnRed = {eventId: "ctrlBtnRed", id: "#ctrlBtnRed", color: "#ff0000", nocolor: "#c15252", sound: redKey},
	    ctrlBtnBlue = {eventId: "ctrlBtnBlue", id: "#ctrlBtnBlue", color: "#1db4ff", nocolor: "#4984a5", sound: blueKey},
	    ctrlBtnYellow = {eventId: "ctrlBtnYellow", id: "#ctrlBtnYellow", color: "#ffea24", nocolor: "#aea648", sound: yellowKey}
	];
	
    // turn on play btns
    function trigger() {
        for(var i = 0; i < 4; i++) {
            $(ctrlBtnArr[i].id).on(start, eventPlay).on(end, eventStop).on("mouseleave", function () {if(btnToggle === true) {eventStop();}})
        }
        timeBuzz = setTimeout(function () {
            errCall();
        }, 5000);
    }
    
    //turn off play btns
    function untrigger() {
        for(var i = 0; i < 4; i++) {
            $(ctrlBtnArr[i].id).off(start, eventPlay).off(end, eventStop).off("mouseleave", function () {if(btnToggle === true) {eventStop();}});
        }
        clearTimeout(timeBuzz);
    }
    
	//play button sound and change color on click
	function eventPlay() {
        for( var n = 0; n < 4; n++) {
            if(event.target.id === ctrlBtnArr[n].eventId){
                document.getElementById(ctrlBtnArr[n].eventId).setAttribute("fill", ctrlBtnArr[n].color);
                ctrlBtnArr[n].sound.connect(audioCtx.destination);
                btnToggle = true;
            } 
        }
    }
    
	//stop button sound and change back to default color on mouse up or leave
	function eventStop() {
        for( var m = 0; m < 4; m++) {
            if(event.target.id === ctrlBtnArr[m].eventId && btnToggle === true) {
                document.getElementById(ctrlBtnArr[m].eventId).setAttribute("fill", ctrlBtnArr[m].nocolor);
                ctrlBtnArr[m].sound.disconnect(audioCtx.destination);
                btnToggle = false;
                coreLogic(num);
                
                function coreLogic (value) {
                    
                    if(m === seqArr[value] && seqArr.length > value) {
                        clearTimeout(timeBuzz);
                        timeBuzz = setTimeout(function () {
                            errCall();
                        }, 5000);
                        num++;
                        if(seqArr.length === num) {
                            seqArr.push(ranNum(0, 3));
                            num = 0; //reset num
                            untrigger();
                            play(0);
                        }
                    } else {
                        errCall();
                    }
                }
            }
        }        
	}
    
    function errCall() {
        if(strictBtn === true) {
            seqArr = [];
            seqArr.push(ranNum(0, 3));
        }
        num = 0; //reset num
        untrigger();
        errKey.connect(audioCtx.destination);
        $("#digitCount").text("!!");
        errSwitch = true;
        errTime = setTimeout(function () {
            errKey.disconnect(audioCtx.destination);
            errSwitch = false;
            play(0);
        }, 300);
    }
    
    function wait() {
        trigger();
    }
    
    function hrdlvl() {
        if(seqArr.length >= 5) {
            return 1100;
        } else if(seqArr.length >= 9) {
            return 800;
        } else if(seqArr.length >= 13) {
            return 600;
        } else {
            return 1500;
        }
    }
    
    function play(index) {
        if(seqArr.length > index) {
            //play btn
            $("#digitCount").text(seqArr.length);
            breakTime = setTimeout(function () {
                $(ctrlBtnArr[seqArr[index]].id).attr("fill", ctrlBtnArr[seqArr[index]].color);
                ctrlBtnArr[seqArr[index]].sound.connect(audioCtx.destination);
            }, 300);
                
            startTime = setTimeout(function () {
                //stop btn
                $(ctrlBtnArr[seqArr[index]].id).attr("fill", ctrlBtnArr[seqArr[index]].nocolor);
                ctrlBtnArr[seqArr[index]].sound.disconnect(audioCtx.destination);
                play(++index);
            }, hrdlvl());
        } else {
            wait();
        }
    }
    
    function onStart() {
        if(seqArr[0] === undefined && strictBtn === false) { // strict is off and array is empty
            seqArr.push(ranNum(0, 3));
            onStart();
        } else if(strictBtn === true) { // strict is on and array is not empty
            seqArr = [];
            seqArr.push(ranNum(0, 3));
            play(0);
        } else if(strictBtn === false) { // strict is off and array is not empty
            play(0);
        } 
    }   
    
    function clearTime() {
        clearTimeout(breakTime);
        clearTimeout(startTime);
        clearTimeout(errTime);
    }
    
    function resetColor() {
        for(i = 0; i < 4; i++) {
            document.getElementById(ctrlBtnArr[i].eventId).setAttribute("fill", ctrlBtnArr[i].nocolor);
        }
    }
    
    function soundOff() {
        for(k = 0; k < 4; k++){
            if(document.getElementById(ctrlBtnArr[k].eventId).getAttribute("fill") === ctrlBtnArr[k].color) {
                ctrlBtnArr[k].sound.disconnect(audioCtx.destination);
            }
        }
    }
    
    function reset() {
        soundOff();
        untrigger();
        clearTime();
        resetColor();
        if(errSwitch === true) {
            errKey.disconnect(audioCtx.destination);
            errSwitch = false;
        }
    }
    
    (function pwrBtn() {
        $("#blueSwitch").on("click", function () {
            if(power === false) {
                power = true;
                $("#blueSwitch").attr("x", "369.002");
                $("#digitCount").attr("fill", "#e52323");
            } else {
                power = false;
                strictBtn = false;
                reset();
                seqArr = [];
                $("#blueSwitch").attr("x", "401.002");
                $("#digitCount").attr("fill", "#4a1515");
                $("#digitCount").text("--");
                $("#strictLight").attr("fill", "#4a1515");
            }
        });
    })();
    
    (function startBtn() {
        $("#startBtn").on(start, function () {
            $("#startBtnShadow").attr("fill", "none");
            $("#startBtn").attr("cy", "518.6");
        }).on(end, function () {
            $("#startBtn").attr("cy", "515.6");
            $("#startBtnShadow").attr("fill", "#777777");
            if(mainStart === false) {
                greenKey.start(audioCtx.currentTime);
                redKey.start(audioCtx.currentTime);
                blueKey.start(audioCtx.currentTime);
                yellowKey.start(audioCtx.currentTime);
                errKey.start(audioCtx.currentTime);
                mainStart = true;
            }
            if(power === true) {
                reset();
                num = 0; //reset num
                onStart();              
            } 
        });
    })();
    
    (function strtBtn() {
        $("#strictBtn").on(start, function () {
            $("#StrictBtnShadow").attr("fill", "none");
            $("#strictBtn").attr("cy", "518.6");
        }).on(end, function () {
            if(power === true) {
                if(strictBtn === false) {
                    strictBtn = true;
                    $("#strictLight").attr("fill", "#dd4848");
                } else {
                    strictBtn = false;
                    $("#strictLight").attr("fill", "#4a1515");
                }
            } 
            $("#strictBtn").attr("cy", "515.6");
            $("#StrictBtnShadow").attr("fill", "#777777"); // watch out, "StrictBtnShadow" strays away from strict naming convention
        });
    })();
})(); 