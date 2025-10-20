const phoneContainer = document.getElementById('phone-container');

let isDragging = false;
let hasDragged = false; 
let offsetX, offsetY;

const onMouseDown = (e) => {
    isDragging = true;
    hasDragged = false; 
    phoneContainer.style.cursor = 'grabbing';
    
    offsetX = e.clientX - phoneContainer.offsetLeft;
    offsetY = e.clientY - phoneContainer.offsetTop;

    phoneContainer.style.bottom = 'auto'; 
};

const onMouseMove = (e) => {
    if (!isDragging) return;
    
    hasDragged = true; 
    e.preventDefault(); 

    const newLeft = e.clientX - offsetX;
    const newTop = e.clientY - offsetY;
    
    phoneContainer.style.left = `${newLeft}px`;
    phoneContainer.style.top = `${newTop}px`;
};

const onMouseUp = () => {
    if (isDragging && !hasDragged) {
        window.location.href = 'page2.html';
    }
    
    isDragging = false;
    phoneContainer.style.cursor = 'grab';
};

phoneContainer.addEventListener('mousedown', onMouseDown);
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp);


phoneContainer.addEventListener('touchstart', (e) => onMouseDown(e.touches[0]));
document.addEventListener('touchmove', (e) => onMouseMove(e.touches[0]));
document.addEventListener('touchend', onMouseUp);

const macImage = document.getElementById('mac-image');
const macImages = ['mac1.png', 'mac2.png', 'mac3.png', 'mac4.png', 'mac5.png'];
setInterval(() => {
    const randomIndex = Math.floor(Math.random() * macImages.length);
    macImage.src = macImages[randomIndex];
}, 1000); 



const macTriggerArea = document.getElementById('mac-trigger-area');
const macContainer = document.getElementById('mac-container');
macTriggerArea.addEventListener('mouseenter', () => {
    macContainer.classList.toggle('is-visible');
});

