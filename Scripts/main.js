const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

canvas.style.position = 'relative';
canvas.style.top = (window.innerHeight/2) - (canvas.height/2) - 50 + 'px'; //천장 y좌표
canvas.style.left = '0px';

const canvasY = parseInt(canvas.style.top); //천장 y좌표
const canvasFloorY = parseInt(canvas.style.top) + canvas.height; //바닥 y좌표

const scoreBoard = document.getElementById('scoreBoard');
scoreBoard.style.position = 'relative';
scoreBoard.style.top = parseInt(canvas.style.top) + 'px';
scoreBoard.style.left = '0px';

const btnReGame = document.getElementById('btnReGame');
btnReGame.style.position = 'relative';
btnReGame.style.top = parseInt(canvas.style.top) - 30 + 'px';
btnReGame.style.display = "none"

let scoreList = [];
let playUserName = "";

var backgroundImages = [];
for(let i = 0; i < 3; i++){
    let img = new Image();
    img.src = `./Contents/Image/Background/${i}.png`;
    backgroundImages.push(img);
}

var cookieImages = [];
for(let i = 0; i < 8; i++){
    let img = new Image();
    img.src = `./Contents/Image/Cookie/brave${i}.png`;
    cookieImages.push(img);
}

var obstacleImages = [];
for(let i = 0; i< 12; i++){
    let img = new Image();
    img.src = `./Contents/Image/Obstacle/obs${i}.png`;
    obstacleImages.push(img);
}

var obstacleSpec = [];
obstacleSpec.push({kind: 0, type: 0, w:40, h:30 });
obstacleSpec.push({kind: 1, type: 0, w:50, h:50 });
obstacleSpec.push({kind: 2, type: 0, w:40, h:100 });
obstacleSpec.push({kind: 3, type: 0, w:50, h:110 });
obstacleSpec.push({kind: 4, type: 0, w:50, h:110 });
obstacleSpec.push({kind: 5, type: 0, w:40, h:50 });
obstacleSpec.push({kind: 6, type: 0, w:40, h:50 });
obstacleSpec.push({kind: 7, type: 0, w:50, h:40 });
obstacleSpec.push({kind: 8, type: 0, w:30, h:50 });
obstacleSpec.push({kind: 9, type: 1, w:80, h:325 });
obstacleSpec.push({kind: 10, type: 1, w:80, h:325 });
obstacleSpec.push({kind: 11, type: 1, w:80, h:325 });

function SetShadow(isAdd){
    if(isAdd){
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(255,255,255,0.5)";
    }else{
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
    }   
}
class Background{
    constructor(startX = 0){
        this.x = startX;
        this.width = canvas.width;
        this.hasNext = false;
    }
    draw(){
        ctx.drawImage(backgroundImages[2], this.x, 0, this.width, canvas.height);
    }
    drawOpening(){
        ctx.drawImage(backgroundImages[0], 0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImages[1], 150, 0, 400, 250);
         
    }

}
class Cookie{
    constructor(w = 60, h = 60){

        //고유 크기
        this.width = w;
        this.height = h;

        //시작 위치
        this.x = 100;
        this.y = canvasFloorY - h; //캔버스 내의 위치가 아니라 window 기준의 y여야한다.

        //점프 높이
        this.singleJump = 190;
        this.doubleJump = 130;

        this.currentJumpY = 0;
    }
    draw(status = 0){
        SetShadow(false);
        if(status >= 8) return;
        if(status == 7){
            //Slide
            var slideW = this.width + 10;
            var slideH = this.height - 25;
            ctx.drawImage(cookieImages[status],this.x, this.y-canvasY + 25, slideW, slideH); 
        }else{
            ctx.drawImage(cookieImages[status],this.x, this.y-canvasY, this.width, this.height); 
        }
        
    }
    jump(stack, currentY){
        this.y -= 6;
        if(stack == 2){
            //이미 한번 들어왔으면 currentY 업데이트 안함
            if(isCookieDoubleJump == false){
                //더블점프는 더블점프 시작 높이에서부터 this.doubleJump 높이만큼만 더 올라간다.위치 저장해야함
                this.currentJumpY = currentY;    
                isCookieDoubleJump = true;      
            }
            if(this.y < this.currentJumpY - this.doubleJump) isCookieJump = false;
        }else if(stack == 1){
            if(this.y < canvasFloorY - this.singleJump) isCookieJump = false;
        }
    }
    fall(){
        if(this.y >= canvasFloorY - this.height){
            isCookieFalling = false;
            cookiePrevJumpStack = 0;
            cookieJumpStack = 0;
            isCookieDoubleJump = false;
        } else if(this.y < canvasFloorY - this.height){
            isCookieFalling = true;
            this.y += 6;
        }
    }
    
}

class Obstacle{
    constructor({kind = 0, type = 0, w  = 30, h = 50}){

        //고유 크기
        this.width = w;
        this.height = h;

        //시작 위치
        this.x = 500;
        this.y = canvasFloorY - h;

        //장애물 타입 (floor:0, ceil: 1)
        this.kind = kind;
        this.type = type;

        //점수가 매겨진 장애물인지
        this.isCheckScore = false;
    }
    draw(){
        SetShadow(false);
        if(this.type == 1){
            //천장에 달린 장애물 -> 슬라이드로 피함
            ctx.drawImage(obstacleImages[this.kind],this.x, 0, this.width, this.height);            
        }else{
            // 바닥에 붙어잇는 장애물 -> 점프로 피함
            ctx.drawImage(obstacleImages[this.kind],this.x, this.y-canvasY, this.width, this.height);
        }
    }
}
class Score{
    constructor(params) {
        this.score = 0;
    }
    draw(){
        SetShadow(true);

        ctx.font="bold 30px Tahoma";
        ctx.fillStyle = "white";
        ctx.fillText(`Score: ${this.score}`, 5, 30);
    }
}

var animationFrame;
var timer = 0;

var cookieStatus = 0;
var isCookieJump = false;
var isCookieDoubleJump = false;
var isCookieFalling = false;
var isCookieSlide = false;

var cookieJumpStack = 0;
var cookiePrevJumpStack = 0; //1단점프에서 내려가면1, 2단점프에서 나려가면2, 바닥이면 0

var isCookieCrash = false;

var backgrounds = [new Background()];

var myScore = new Score();
var myCookie = new Cookie();

var obstacles = [];


var backgroundSpeed = 1;

function StartGame(){
    
    animationFrame = requestAnimationFrame(StartGame);
    
    //잰다 타이머!
    if(++timer == Number.MAX_SAFE_INTEGER) timer = 0; //최대 정수면 초기화
 
    //한다 초기화!
    ctx.clearRect(0,0,canvas.width, canvas.height);

    //그린다 배경!
    if(backgrounds.length == 0){
        backgrounds.push(new Background());
    }
    backgrounds.forEach((obj, i, a)=>{     
        obj.draw();
        if(obj.x < 0 && obj.hasNext == false){
            var startX = canvas.width - (obj.x * -1) - backgroundSpeed;
            backgrounds.push(new Background(startX));
            obj.hasNext = true;
        }
        if(obj.x + canvas.width < 0){
            setTimeout(()=>{
                a.splice(i,1); // 화면 깜박임 방지하기 위해 settimeout으로 호출
            },10)
        }
        obj.x -= backgroundSpeed; //배경 움직이는 속도
    });
    

    // 정한다! 랜덤! 간격과 종류!
    var interval = 100;
    if(timer % interval == 0){ 
        var kind = RandomNum(0,11);
        obstacles.push(new Obstacle(obstacleSpec[kind]));     
    }

    // 화면 밖으로 나가면 지운다 장애물!
    obstacles.forEach((obs, i, a)=>{
        //화면 밖으로 사라지면 배열에서 제거하기
        if(obs.x + obs.width < 0) a.splice(i,1);
    });

    //판정한다 충돌!
    obstacles.forEach((obs)=>{
        //그린다 새 장애물!
        obs.x -= 3; // x만큼 빠지는게 속도!
        obs.draw(RandomNum(0,10));

        //한다 충돌 판정!
        //이미 지나간 x는 체크하지 않는다!
        if(myCookie.x - (obs.x + obs.width) + 15 < 0 ){ //15는 난이도 조절..
            if(isCookieCrash == false){
                isCookieCrash = IsCrash(myCookie, obs);
            }
        }
        
    });
 
    //달린다 쿠키!
    var timer2 = isCookieCrash ? 3 : 10;
    if(timer % timer2 == 0){
        if(isCookieCrash == true){
            //부딪혔나! 바닥으로 보낸다 쿠키!
            if(++cookieStatus >= 6){
                if(myCookie.y <= canvasFloorY - myCookie.height){
                    //공중에서 죽지 않아 쿠키!
                    myCookie.y++;
                    cookieStatus--;
                }else{
                    EndGame();
                    return;
                }
            }
        }else{
            if(++cookieStatus >= 3) cookieStatus = 0;
        }
    }
    
    
    // 잰다 점수!
    if(timer % 10 == 0){
        myScore.score++;
    }

    
    //한다 점프!
    if(cookieJumpStack == 0 || isCookieJump == false){
        myCookie.fall();
    }else if(cookieJumpStack < 3){
        cookiePrevJumpStack = cookieJumpStack;
        cookieStatus = 6;
        myCookie.jump(cookieJumpStack, myCookie.y);
    }

    //일단 내가 넘어온건 하나뿐
    if(obstacles[0] && obstacles[0].x + obstacles[0].width < myCookie.x){
        if(obstacles[0].isCheckScore == false) myScore.score += 100; //장애물 넘으면 올라간다 100점!
        obstacles[0].isCheckScore = true;
    }

    myScore.draw();


    if(isCookieSlide == true){
        myCookie.draw(7);
    }else{
        myCookie.draw(cookieStatus);
    }
}

// 키이벤트~
document.addEventListener('keydown',(e)=>{
    if(e.code === 'Space'){
        //점프~
        if(cookiePrevJumpStack < 2){
            isCookieJump = true;
            cookieJumpStack++;
        }else{
            return;
        }     
    }else if(e.code === 'ArrowDown'){
        //슬라이드~
        isCookieSlide = true;
        console.log(isCookieSlide);
    }
});

//슬라이드 해제~
document.addEventListener('keyup', (e)=>{
    if(e.code === 'ArrowDown'){
        isCookieSlide = false;
        console.log(isCookieSlide);
    }
});

btnReGame.addEventListener('click', (e)=>{
    ReGame();
});

function IsCrash(cookie, obstacle){

    var diffX, diffY;

    //장애물 타입과 슬라이드 여부에 따라 결정되어야 한다.
    if(obstacle.type == 0){ //바닥 장애물
        if(isCookieSlide == true){
            diffX = obstacle.x - (cookie.x + cookie.width + 10) + 15;
            diffY = obstacle.y - (cookie.y + cookie.height - 25) + 15;
        }else{
            diffX = obstacle.x - (cookie.x + cookie.width) + 15;
            diffY = obstacle.y - (cookie.y + cookie.height) + 15;
        }
    }else if(obstacle.type == 1){ //천장 장애물
        //천장 장애물은 높이만 체크하면 된다.
        if(isCookieSlide == false && obstacle.x - (cookie.x+cookie.width) + 15 < 0){
            return true;
        }else{
            return false;
        }
    }

    if( diffX < 0 && diffY < 0){
        return true;
    }else{
        return false;
    }
}

function InitProperty(){
    
    animationFrame = undefined;
    timer = 0;
    
    cookieStatus = 0;
    isCookieJump = false;
    isCookieDoubleJump = false;
    isCookieFalling = false;
    isCookieSlide = false;
    
    cookieJumpStack = 0;
    cookiePrevJumpStack = 0; //1단점프에서 내려가면1, 2단점프에서 나려가면2, 바닥이면 0
    
    isCookieCrash = false;
    
    backgrounds = [new Background()];
    
    myScore = new Score();
    myCookie = new Cookie();
    
    obstacles = [];
    backgroundSpeed = 1;

    btnReGame.style.display = "none";    
}
function EndGame(){
    cancelAnimationFrame(animationFrame);

    //GameOver!
    myCookie.draw(5);
    myScore.draw();

    // 점수 추가
    AddScoreBoard(myScore.score);

    // 다시하기 버튼 show
    btnReGame.style.display = "";
}

function AddScoreBoard(score){
    scoreList.push({name: playUserName, score: score});
    
    // 점수 순으로 정렬
    scoreList.sort((a,b)=>{
        return b.score - a.score;
    });

    let tableHtml = "";
    let i = 0;
    for(value of scoreList){
        tableHtml +=
        `<tr>
            <th scope="row">${++i}</th>
            <td>${value.name}</td>
            <td>${parseInt(value.score)}</td>
        </tr>
        `;
    }
    
    document.getElementById('scoreBoardBody').innerHTML = tableHtml;
}


function RandomNum(min, max){
    return Math.floor(Math.floor(Math.random() * (max-min+1)) + min);
}


function buttonAction(e){
    
    //console.log(`clientX: ${e.clientX} \n clientY: ${e.clientY}`)
    if(e.clientY >= canvasY + 48 && e.clientY <= canvasFloorY - 244){
        if(e.clientX >= 210 && e.clientX <= 412){
            if(CheckName() == false) return;
            StartGame();
        }
    }
}

function CheckName(){
    let userName = document.getElementById("userName").value;
    if(userName == ""){
        alert("이름을 입력해주세요!");
        return false;
    }else{
        playUserName = userName;
        return true;
    }
}

function ReGame(){
    InitProperty();
    if(CheckName() == false) return;
    StartGame();
}

// 시작화면 이미지가 모두 로딩이 되어야 draw
var loadImage1 = new Promise((resolve,reject)=>{
    backgroundImages[0].onload = ()=>{
        resolve();
    };
});
var loadImage2 = new Promise((resolve,reject)=>{
    backgroundImages[1].onload = ()=>{
        resolve();
    };
});
// async await 사용해주기~
const LoadingGame = async ()=>{
 
    await loadImage1;
    await loadImage2;

    backgrounds[0].drawOpening();
}

LoadingGame();