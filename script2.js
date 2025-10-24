const canvas = document.getElementById('mask-canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('scratch-container');
const blurImage = document.getElementById('blur-image');
const rainBlurImage = document.getElementById('rain-blur-image');
const wiperLeft = document.getElementById('wiper-left');
const wiperRight = document.getElementById('wiper-right');
const fingerCursor = document.getElementById('finger-cursor');
const toolABtn = document.getElementById('tool-a-btn'); 
let currentMode = null;
let wiperAnimationId = null;

const wiperStampCanvas = document.createElement('canvas');
const wiperStampCtx = wiperStampCanvas.getContext('2d');
let isWiperStampReady = false;

const stampImage = new Image();
stampImage.src = wiperLeft.src; 
stampImage.onload = () => {
    wiperStampCanvas.width = stampImage.naturalWidth;
    wiperStampCanvas.height = stampImage.naturalHeight;
    wiperStampCtx.drawImage(stampImage, 0, 0);
    const imageData = wiperStampCtx.getImageData(0, 0, wiperStampCanvas.width, wiperStampCanvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 10) { 
            data[i + 3] = 255;
        }
    }
    wiperStampCtx.putImageData(imageData, 0, 0);
    isWiperStampReady = true;
    checkAllImagesLoaded();
};
stampImage.onerror = () => {
    console.error("와이퍼 스탬프 이미지 로드 실패!");
    checkAllImagesLoaded(); 
};

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
let lastAngle = angle;
const minAngle = -100, maxAngle = 100;
let direction = 1;
const speed = 1.5; // 속도 1.5

function wiperLoop() {
    lastAngle = angle;
    angle += speed * direction;
    if (angle > maxAngle || angle < minAngle) {
        direction *= -1;
        angle = Math.max(minAngle, Math.min(maxAngle, angle));
    }

    const transformStyle = `translateX(-50%) rotate(${angle}deg)`;
    wiperLeft.style.transform = transformStyle;
    wiperRight.style.transform = transformStyle;

    const centerL = canvas.width * 0.25;
    const centerR = canvas.width * 0.75;
    const centerY = canvas.height;

    if (!isWiperStampReady) {
        wiperAnimationId = requestAnimationFrame(wiperLoop);
        return;
    }

    const startAngle = Math.min(lastAngle, angle);
    const endAngle = Math.max(lastAngle, angle);
    const step = 0.5;

    for (let a = startAngle; a <= endAngle; a += step) {
        const angleRad = a * (Math.PI / 180);

        ctx.save();
        ctx.translate(centerL, centerY);
        ctx.rotate(angleRad);
        ctx.globalAlpha = 0.05; 
        ctx.drawImage(wiperStampCanvas, -wiperLeft.offsetWidth / 2, -wiperLeft.offsetHeight, wiperLeft.offsetWidth, wiperLeft.offsetHeight);
        ctx.restore();

        ctx.save();
        ctx.translate(centerR, centerY);
        ctx.rotate(angleRad);
        ctx.globalAlpha = 0.05; 
        ctx.drawImage(wiperStampCanvas, -wiperRight.offsetWidth / 2, -wiperRight.offsetHeight, wiperRight.offsetWidth, wiperRight.offsetHeight);
        ctx.restore();
    }

    wiperAnimationId = requestAnimationFrame(wiperLoop);
}

// =======================================================
// B: 손가락 긁기 인터랙션 관련 코드
// =======================================================
let isDrawing = false;
const getPos = (e) => ({ x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top });

const startDrawing = (e) => {
    isDrawing = true;
    const event = e.touches ? e.touches[0] : e;
    const pos = getPos(event);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = window.innerWidth * 0.03;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
};

const draw = (e) => {
    if (e.touches) e.preventDefault();
    const event = e.touches ? e.touches[0] : e;
    requestAnimationFrame(() => { 
        fingerCursor.style.left = `${event.clientX}px`;
        fingerCursor.style.top = `${event.clientY}px`;
    });
    if (!isDrawing) return;
    const pos = getPos(event);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
};

const stopDrawing = () => isDrawing = false;

function addScratchListeners() {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
}

function removeScratchListeners() {
    canvas.removeEventListener('mousedown', startDrawing);
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseup', stopDrawing);
    canvas.removeEventListener('mouseleave', stopDrawing);
    canvas.removeEventListener('touchstart', startDrawing);
    canvas.removeEventListener('touchmove', draw);
    canvas.removeEventListener('touchend', stopDrawing);
    canvas.removeEventListener('touchcancel', stopDrawing);
}

function setMode(newMode) {
    if (currentMode === newMode) return;
    if (currentMode === 'wiper') { cancelAnimationFrame(wiperAnimationId); }
    else if (currentMode === 'scratch') { removeScratchListeners(); }

    wiperLeft.style.display = 'none';
    wiperRight.style.display = 'none';
    fingerCursor.style.display = 'none';
    document.body.classList.remove('scratch-mode-active'); 

    currentMode = newMode;
    if (currentMode === 'wiper') { 
        initializeCanvas(rainBlurImage);
        wiperLeft.style.display = 'block';
        wiperRight.style.display = 'block';
        toolABtn.classList.add('active'); 
        lastAngle = -60; angle = -60;
        wiperLoop();
    } else if (currentMode === 'scratch') { 
        initializeCanvas(blurImage);
        fingerCursor.style.display = 'block';
        document.body.classList.add('scratch-mode-active'); 
        toolABtn.classList.remove('active'); 
        addScratchListeners();
    }
}

let imagesLoadedCount = 0;
const imagesToLoad = [blurImage, rainBlurImage];
const totalImagesToLoad = imagesToLoad.length;

function checkAllImagesLoaded() {
    if (imagesLoadedCount === totalImagesToLoad && isWiperStampReady) {
        setMode('wiper');
    }
};

window.addEventListener('load', () => {
    imagesToLoad.forEach(img => {
        if(img.complete) { imagesLoadedCount++; }
        else { img.onload = () => { imagesLoadedCount++; checkAllImagesLoaded(); }; img.onerror = () => { imagesLoadedCount++; checkAllImagesLoaded(); }; }
    });
    checkAllImagesLoaded();

    resetTimer();
});

window.addEventListener('resize', () => {
    if (currentMode === 'wiper') { initializeCanvas(rainBlurImage); }
    else if (currentMode === 'scratch') { initializeCanvas(blurImage); }
});

toolABtn.addEventListener('click', () => {
    const nextMode = currentMode === 'wiper' ? 'scratch' : 'wiper';
    setMode(nextMode);
});

let inactivityTimer;
function resetTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (window.location.href.includes('page2.html')) {
           window.location.href = 'index.html';
        }
    }, 20000); 
}

document.addEventListener('mousemove', resetTimer);
document.addEventListener('keydown', resetTimer);
document.addEventListener('scroll', resetTimer);
document.addEventListener('touchstart', resetTimer);
