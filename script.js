const phoneContainer = document.getElementById('phone-container');
const macImage = document.getElementById('mac-image');
const macTriggerArea = document.getElementById('mac-trigger-area');
const macContainer = document.getElementById('mac-container');


document.addEventListener('mousemove', (e) => { 
    const mouseX = e.clientX; 
    const phoneHalfWidth = phoneContainer.offsetWidth / 2;
    const newLeft = mouseX - phoneHalfWidth;
    phoneContainer.style.left = `${newLeft}px`;
});

phoneContainer.addEventListener('click', () => {
    window.location.href = 'page2.html';
});



const macImages = ['mac1.png', 'mac2.png', 'mac3.png', 'mac4.png', 'mac5.png'];
setInterval(() => {
    const randomIndex = Math.floor(Math.random() * macImages.length);
    macImage.src = macImages[randomIndex];
}, 1000); 

macTriggerArea.addEventListener('mouseenter', () => {
    macContainer.classList.toggle('is-visible');
});


window.addEventListener('load', () => {
    const scrollAmount = window.innerHeight * 0.40; 

    window.scrollTo({
        top: scrollAmount,
        left: 0,
        behavior: 'auto' 
    });
});
