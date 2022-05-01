//////////////////////////////////////////////////////////////////////
// pageTopScroller.js
// 
// @usage
//     1. Include js and css for toaster in your head element.
//     
//         //////////////////////////////////////////////////////////////////////
//         <head>
//           <link rel="stylesheet" type="text/css" href="pageTopScroller.css">
//           <script type="text/javascript" src="pageTopScroller.js"></script>
//         </head>
//         //////////////////////////////////////////////////////////////////////
//
//         That's it! It is very simple.
//
//     2. (Option) There are some options. Have a look the option variable.
//         You can set a value to them.
//         
//         IMG_SRC: The path or URL of the image. When you set it, will display it.
//         ANIMATE_DURATION: The duration of the scroll animation (milliseconds).
//         ANIMATE_INCREMENT: The increment of the scroll animation (milliseconds).
//
//////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function() {
    
    //////////////////////////////////////////////////////////////////////
    // Class
    //////////////////////////////////////////////////////////////////////
    class PageTopScroller {
        
        //////////////////////////////////////////////////
        // Constructor
        //////////////////////////////////////////////////
        constructor(options = null) {
            this.BODY = document.body;
            this.PARENT_BOX;
            this.PARENT_BOX_ID = 'ptsBox';
            this.IMG_SRC = null;
            this.ANIMATE_DURATION = 1000;
            this.ANIMATE_INCREMENT = 30;
            
            // options
            if(options !== null && Object.keys(options).length > 0) {
                // IMG_SRC
                if(options['IMG_SRC']) {
                    this.IMG_SRC = options['IMG_SRC'];
                }
                
                // ANIMATE_DURATION
                if(options['ANIMATE_DURATION']) {
                    this.ANIMATE_DURATION = options['ANIMATE_DURATION'];
                }
                
                // ANIMATE_DURATION
                if(options['ANIMATE_DURATION']) {
                    this.ANIMATE_DURATION = options['ANIMATE_DURATION'];
                }
            }
        }
        
        
        //////////////////////////////////////////////////
        // Generate HTML
        //////////////////////////////////////////////////
        generateHTML() {
            this.PARENT_BOX = document.createElement('DIV');
            this.PARENT_BOX.id = this.PARENT_BOX_ID;
            this.PARENT_BOX.classList.add(this.PARENT_BOX_ID);
            this.BODY.appendChild(this.PARENT_BOX);
            const a = document.createElement('A');
            this.PARENT_BOX.appendChild(a);
            if(this.IMG_SRC) {
                const img = document.createElement('IMG');
                img.src = this.IMG_SRC;
                a.appendChild(img);
            } else {
                const arrowUp = document.createElement('SPAN');
                arrowUp.classList.add('arrowUp');
                a.appendChild(arrowUp);
            }
        }
        
        
        //////////////////////////////////////////////////
        // easeInOutQuad
        // @param t: current time
        // @param b: begin position
        // @param c: change from end to begin position
        // @param d: duration
        //////////////////////////////////////////////////
        easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if(t < 1) {
                return c / 2 * t * t + b;
            }
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        
        //////////////////////////////////////////////////
        // Event Listener
        //////////////////////////////////////////////////
        eventListener() {
            // scroll
            let scrollTimerId;
            window.addEventListener('scroll', (e) => {
                if(scrollTimerId != null) {
                    clearTimeout(scrollTimerId);
                }
                scrollTimerId = setTimeout(() => {
                    if(window.pageYOffset > 0) {
                        this.PARENT_BOX.classList.add('active');
                    } else {
                        this.PARENT_BOX.classList.remove('active');
                    }
                }, 500);
            }, false);
            
            // click
            this.PARENT_BOX.addEventListener('click', () => {
                const duration = this.ANIMATE_DURATION;
                const start = window.pageYOffset;
                const change = -start;
                const increment = this.ANIMATE_INCREMENT;
                let currentTime = 0;
                
                const animateScroll = () => {
                    currentTime += increment;
                    const val = this.easeInOutQuad(currentTime, start, change, duration);
                    window.scrollTo(0, val);
                    if (currentTime < duration) {
                        setTimeout(animateScroll, 30);
                    } else {
                        window.scrollTo(0, 0);
                    }
                };
                animateScroll();
            }, false);
        }
        
        
        //////////////////////////////////////////////////
        // Main
        //////////////////////////////////////////////////
        Main() {
            this.generateHTML();
            this.eventListener();
        }
        
    }
    
    
    //////////////////////////////////////////////////////////////////////
    // Initialize
    //////////////////////////////////////////////////////////////////////
    options = {
        'IMG_SRC': null,
        'ANIMATE_DURATION': null,
        'ANIMATE_INCREMENT': null,
    }
    const instance = new PageTopScroller(options);
    instance.Main();
    
}, false);
