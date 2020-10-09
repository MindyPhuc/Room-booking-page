(function() {
    function setupMenuHandlers() {

        // set up slide banners
        const slide_images = [
            '../images/banner_1.JPG',
            '../images/banner_2.JPG',
            '../images/banner_3.JPG'
        ];
        let img = document.querySelector('#slide-banner');
        let currentImageIdx = 0;

        function nextImageUrl() {
            currentImageIdx++;
            if (currentImageIdx === slide_images.length) {
            currentImageIdx = 0;
            }
            return slide_images[currentImageIdx];
        }

        setInterval(function() {
            img && (img.src = nextImageUrl());
        }, 3 * 1000);        
    }

    window.onload = setupMenuHandlers;
})();       