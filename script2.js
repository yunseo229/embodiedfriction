
const canvas = document.getElementById('mask-canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('scratch-container');
const blurImage = document.getElementById('blur-image');
const rainBlurImage = document.getElementById('rain-blur-image');
const wiperLeft = document.getElementById('wiper-left');
const wiperRight = document.getElementById('wiper-right');
const fingerCursor = document.getElementById('finger-cursor');


const toolABtn = document.getElementById('tool-a-btn');
const toolBBtn = document.getElementById('tool-b-btn');


let currentMode = null; 
let wiperAnimationId = null; 


// =======================================================
// 🎨 캔버스 초기화 (어떤 이미지를 그릴지 인자로 받음)
// =======================================================
function initializeCanvas(sourceImage) {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (sourceImage && sourceImage.complete && sourceImage.naturalWidth > 0) {
        const imgRatio = sourceImage.naturalWidth / sourceImage.naturalHeight;
        const canvasRatio = canvas.width / canvas.height;
        let sx = 0, sy = 0, sWidth = sourceImage.naturalWidth, sHeight = sourceImage.naturalHeight;

        if (imgRatio > canvasRatio) {
            sWidth = sHeight * canvasRatio;
            sx = (sourceImage.naturalWidth - sWidth) / 2;
        } else {
            sHeight = sWidth / canvasRatio;
            sy = (sourceImage.naturalHeight - sHeight) / 2;
        }
        ctx.drawImage(sourceImage, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    }
    ctx.globalCompositeOperation = 'destination-out';
}


// =======================================================
// A: 와이퍼 인터랙션 관련 코드
// =======================================================
let angle = -60;
const minAngle = -100, maxAngle = 100;
let direction = 1;
const speed = 1.0;

function wiperLoop() {
    angle += speed * direction;
    if (angle > maxAngle || angle < minAngle) direction *= -1;

    const transformStyle = `translateX(-50%) rotate(${angle}deg)`;
    wiperLeft.style.transform = transformStyle;
    wiperRight.style.transform = transformStyle;

    const angleRad = angle * (Math.PI / 180);
    const centerL = canvas.width * 0.25;
    const centerR = canvas.width * 0.75;
    const centerY = canvas.height;

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
    ctx.lineWidth = window.innerWidth * 0.01; 
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


// =======================================================
// ⚙️ 모드 제어 (가장 중요한 부분)
// =======================================================
function setMode(newMode) {
    if (currentMode === newMode) return;

   
    if (currentMode === 'wiper') {
        cancelAnimationFrame(wiperAnimationId);
    } else if (currentMode === 'scratch') {
        removeScratchListeners();
    }
  
    wiperLeft.style.display = 'none';
    wiperRight.style.display = 'none';
    fingerCursor.style.display = 'none';
    document.body.style.cursor = 'default';

    
    currentMode = newMode;
    if (currentMode === 'wiper') { 
        initializeCanvas(rainBlurImage); 
        
        wiperLeft.style.display = 'block';
        wiperRight.style.display = 'block';

        toolABtn.classList.add('active');
        toolBBtn.classList.remove('active');
        
        wiperLoop(); 

    } else if (currentMode === 'scratch') { 
        initializeCanvas(blurImage); 
        
        fingerCursor.style.display = 'block';
        document.body.style.cursor = 'none';

        toolBBtn.classList.add('active');
        toolABtn.classList.remove('active');
        
        addScratchListeners(); 
    }
}


// =======================================================
// 🚀 초기 실행 및 이벤트 리스너
// =======================================================
window.addEventListener('load', () => {
    let imagesLoaded = 0;
    const imagesToLoad = [blurImage, rainBlurImage, wiperLeft];
    const totalImages = imagesToLoad.length;

    const onImageLoad = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            setMode('wiper'); 
        }
    };

    imagesToLoad.forEach(img => {
        if(img.complete) {
            onImageLoad();
        } else {
            img.onload = onImageLoad;
            img.onerror = onImageLoad; 
        }
    });
});

window.addEventListener('resize', () => {
    if (currentMode === 'wiper') {
        initializeCanvas(rainBlurImage);
    } else if (currentMode === 'scratch') {
        initializeCanvas(blurImage);
    }
});

toolABtn.addEventListener('click', () => setMode('wiper'));
toolBBtn.addEventListener('click', () => setMode('scratch'));
