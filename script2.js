// --- 1. 공통 요소 가져오기 ---
const canvas = document.getElementById('mask-canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('scratch-container');
const blurImage = document.getElementById('blur-image');

// --- 2. 각 인터랙션별 요소 가져오기 ---
const wiperLeft = document.getElementById('wiper-left');
const wiperRight = document.getElementById('wiper-right');
const fingerCursor = document.getElementById('finger-cursor');
const toolABtn = document.getElementById('tool-a-btn');
const toolBBtn = document.getElementById('tool-b-btn');

// --- 3. 상태 관리 및 설정 변수 ---
let currentMode = null; // 현재 활성화된 모드 ( 'wiper' 또는 'scratch' )
let wiperAnimationId = null;

// =======================================================
// 🎨 캔버스 초기화 (공통 함수)
// =======================================================
function initializeCanvas() {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (blurImage.complete && blurImage.naturalWidth > 0) {
        const imgRatio = blurImage.naturalWidth / blurImage.naturalHeight;
        const canvasRatio = canvas.width / canvas.height;
        let sx = 0, sy = 0, sWidth = blurImage.naturalWidth, sHeight = blurImage.naturalHeight;

        if (imgRatio > canvasRatio) {
            sWidth = sHeight * canvasRatio;
            sx = (blurImage.naturalWidth - sWidth) / 2;
        } else {
            sHeight = sWidth / canvasRatio;
            sy = (blurImage.naturalHeight - sHeight) / 2;
        }
        ctx.drawImage(blurImage, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    }
    ctx.globalCompositeOperation = 'destination-out';
}

// =======================================================
// A: 와이퍼 인터랙션 관련 코드
// =======================================================
let angle = -60;
const minAngle = -100, maxAngle = 100;
let direction = 1;
const speed = 0.8;
let centerL, centerR, centerY;

function wiperLoop() {
    angle += speed * direction;
    if (angle > maxAngle || angle < minAngle) direction *= -1;

    const transformStyle = `translateX(-50%) rotate(${angle}deg)`;
    wiperLeft.style.transform = transformStyle;
    wiperRight.style.transform = transformStyle;

    const angleRad = angle * (Math.PI / 180);
    centerL = canvas.width * 0.25;
    centerR = canvas.width * 0.75;
    centerY = canvas.height;

    ctx.save();
    ctx.translate(centerL, centerY);
    ctx.rotate(angleRad);
    ctx.drawImage(wiperLeft, -wiperLeft.offsetWidth / 2, -wiperLeft.offsetHeight, wiperLeft.offsetWidth, wiperLeft.offsetHeight);
    ctx.restore();

    ctx.save();
    ctx.translate(centerR, centerY);
    ctx.rotate(angleRad);
    ctx.drawImage(wiperRight, -wiperRight.offsetWidth / 2, -wiperRight.offsetHeight, wiperRight.offsetWidth, wiperRight.offsetHeight);
    ctx.restore();

    wiperAnimationId = requestAnimationFrame(wiperLoop);
}

// =======================================================
// B: 손가락 긁기 인터랙션 관련 코드
// =======================================================
let isDrawing = false;

const getPos = (e) => ({
    x: e.clientX - canvas.getBoundingClientRect().left,
    y: e.clientY - canvas.getBoundingClientRect().top
});

const startDrawing = (e) => {
    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = window.innerWidth * 0.02;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
};

const draw = (e) => {
    fingerCursor.style.left = `${e.clientX}px`;
    fingerCursor.style.top = `${e.clientY}px`;
    if (!isDrawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
};

const stopDrawing = () => isDrawing = false;

function addScratchListeners() {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
}
function removeScratchListeners() {
    canvas.removeEventListener('mousedown', startDrawing);
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseup', stopDrawing);
    canvas.removeEventListener('mouseleave', stopDrawing);
}


function setMode(newMode) {
    if (currentMode === newMode) return;

    if (currentMode === 'wiper') {
        cancelAnimationFrame(wiperAnimationId);
        wiperLeft.style.display = 'none';
        wiperRight.style.display = 'none';
    } else if (currentMode === 'scratch') {
        removeScratchListeners();
    }

    initializeCanvas();
    document.body.style.cursor = 'default'; 


    currentMode = newMode;
    if (currentMode === 'wiper') {

        wiperLeft.style.display = 'block';
        wiperRight.style.display = 'block';
        fingerCursor.style.display = 'none'; 

        toolABtn.classList.add('active');
        toolBBtn.classList.remove('active');
        wiperLoop();
    } else if (currentMode === 'scratch') {

        addScratchListeners();
        fingerCursor.style.display = 'block'; 
        document.body.style.cursor = 'none'; 
        toolBBtn.classList.add('active');
        toolABtn.classList.remove('active');
    }
}

window.addEventListener('load', () => {
    initializeCanvas();
    setMode('wiper'); 
});
window.addEventListener('resize', initializeCanvas);
toolABtn.addEventListener('click', () => setMode('wiper'));
toolBBtn.addEventListener('click', () => setMode('scratch'));