import BLOCKS from "./blocks.js"

//DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisPlay = document.querySelector(".score")
const restartButton = document.querySelector(".game-text > button")
//셋팅
const GAME_ROWS = 20;
const GAME_COLS = 10;

let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem; //movingitem을 실행하기 전에 담아놓는 변수


const movingItem = { //테트리스 객체의 구조체
    type: "",
    direction: 0, //좌우로 돌려주는 지표
    top: 0,
    left: 0,
};

init();

function init(){
    tempMovingItem = {...movingItem};
    for(let i = 0; i< GAME_ROWS; i++){ //테트리스 ui 만드는 메서드 초기화
        prependNewLine(); //
    }
    score = 0;
    generateNewBlock();
}

function prependNewLine(){
    //테트리스 ui만드는 메서드
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for(let j=0; j <GAME_COLS; j++){
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    playground.prepend(li);
}
function renderBlocks(moveType=""){
    const { type, direction, top, left} = tempMovingItem; //구조체 사용
    const movingBlocks = document.querySelectorAll(".moving"); //무빙클래스를 갖고있는거 가져오기
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving");
        //움직인 애들의 타입과 moving클래스를 제거해준다.
    });
    BLOCKS[type][direction].some(block=> {
        const x = block[0] + left; //블럭의 x값
        const y = block[1] + top; //블럭의 y값
        //타겟팅을 해주기 위해 playground 안에 있는 childnode를 지정한다
        //그리고 블럭객체가 빠져나가는 것을 막기위해
        //삼항연산자를 이용하여 테두리를 확인하고 타겟변수에 넣어주는 것.
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if(isAvailable){ //빈공간이 있으면 원상태로 옮긴다
            target.classList.add(type, "moving"); //타입과 무빙을 클래스로 준다.
        } else {
            tempMovingItem = {...movingItem}
            if(moveType ==='retry'){
                clearInterval(downInterval);
                showGameoverText();
            }
            setTimeout(()=> { //스택이 무한으로 도는것을 방지
                renderBlocks('retry');
                if(moveType === "top"){
                    seizeBlock();
                }
            }, 0);
            return true; //반복문 나오기
        }
    });
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

function seizeBlock(){ //아래로 떨어질 때 벽을 만나면 고정시켜주는 메서드
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized");
    });
    checkMatch();
}

function checkMatch(){
    const childNodes = playground.childNodes;
    childNodes.forEach(child=>{ //각각의 li체크
        let matched = true;
        child.children[0].childNodes.forEach(li=>{
            if(!li.classList.contains("seized")){
                matched = false;
            }
        });
        if(matched){
            child.remove(); 
            prependNewLine();
            score++;
            scoreDisPlay.innerText = score;
        }
    })
    generateNewBlock();
}
function generateNewBlock(){
    clearInterval(downInterval); //생성되어있것 제거
    downInterval = setInterval(()=> { // 떨어지는 값 변수 선언
        moveBlock('top', 1);
    }, duration);
    
    const blockArray = Object.entries(BLOCKS); //
    const randomIndex = Math.floor(Math.random() * blockArray.length);
    movingItem.type = blockArray[randomIndex][0];
    movingItem.top = 0;
    movingItem.left = 3; //중간에 놔야하기 때문에 3을 설정해준다.
    movingItem.direction = 0;
    tempMovingItem = {...movingItem};
    renderBlocks()
}

function checkEmpty(target){//빈 여백을 체크해서 넘어가지 못하게 만드는 메서드
    if(!target || target.classList.contains("seized")){
        return false;
    }
    return true;
}
function moveBlock(moveType, amount) { //이동메서드 (방향, 움직이는 크기)
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);
}
function changeDirection(){
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderBlocks();
}
function dropBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(()=> {
        moveBlock("top", 1);
    }, 10)
}
function showGameoverText(){
    gameText.style.display = "flex"
}
//키 눌렀을 때
document.addEventListener("keydown", e=>{
    switch(e.keyCode){
        case 39: //왼쪽
            moveBlock("left", 1);
            break;
        case 37: //오른쪽
            moveBlock("left", -1);
            break;
        case 40: //아래방향키
            moveBlock("top", 1);
            break;
        case 38: //위방향키
            changeDirection();
            break;
        case 32: //스페이스 바
            dropBlock();
            break;
        default:
            break;
    }
});

restartButton.addEventListener("click", ()=> { //다시하기 이벤트
    playground.innerHTML = "";
    gameText.style.display = "none"
    init();
});