import 'core-js';
import 'whatwg-fetch';
import './utils/seed-data';
import '../css/style.css';
import '../fontawesome/css/all.css'

import UserController from './users/UserController';
import AssetController from './assets/AssetController';

class airSlider {
    constructor() {
        //Element Description
        this.slider = document.querySelector('.slider-list');
        this.slider.children[0].classList.toggle('active-slide');
        //Slider Length
        this.length = document.querySelectorAll('.slide').length;
        //Sizes
        // if(e.width === undefined){
        //   e.width = '100%';
        // }
        // if(e.height === undefined){
        //   e.height = '300px';
        // }
        // this.slider.style.maxWidth = e.width;
        // this.slider.style.height = e.height;
        //Constrols
        let controls = document.createElement('div');
        controls.className = 'controls';
        controls.innerHTML = '<button id="prev"><</button><button id="next">></button>';
        this.slider.appendChild(controls);
        //Controls Listeners
        document.querySelector('#prev').addEventListener('click', function(){
            slider.prev();
        });
        document.querySelector('#next').addEventListener('click', function(){
            slider.next();
        });
        //AutoPlay
        // if(e.autoPlay === true){
        //   this.autoPlayTime = e.autoPlayTime;
        //   if(this.autoPlayTime === undefined){
        //     this.autoPlayTime = 5000;
        //   }
        //   setInterval(this.autoPlay, this.autoPlayTime);
        // }
    }
    prev() {
        let currentSlide = document.querySelector('.active-slide');
        let prevSlide = document.querySelector('.active-slide').previousElementSibling;
        if(prevSlide === null){
            prevSlide = this.slider.children[this.length - 1];
        }
        currentSlide.className = 'slide';
        prevSlide.classList = 'slide active-slide';
    }
    next() {
        let currentSlide = document.querySelector('.active-slide');
        let nextSlide = document.querySelector('.active-slide').nextElementSibling;
        if(nextSlide.className === 'controls'){
            nextSlide = this.slider.children[0];
        }
        currentSlide.className = 'slide';
        nextSlide.classList = 'slide active-slide fadeIn';
    }
    // autoPlay(){
    //   slider.next();
    // }
}

const tog = document.querySelector(".navigation-tog");
const nav =  document.querySelector(".navigation-list");

nav.classList.remove('navigation-list--nojs');

tog.addEventListener("click", function(event) {
    event.preventDefault();
    nav.classList.toggle("navigation-list--show");
    tog.classList.toggle("navigation-tog--close");
});

window.addEventListener("keydown", function(event) {
    if (event.keyCode === 27) {
        nav.classList.remove("navigation-list--show");
        tog.classList.remove("navigation-tog--close");
    }
});

function initializePage() {
    const page = window.location.pathname;
    const userController = new UserController();
    const assetController = new AssetController();

    userController.readCurrentUser();

    const logoutButton = document.querySelector('.user-logout');
    logoutButton.onclick = userController.logOut;

    if (page.includes('index.html')) {
        new airSlider();
        return initializeIndexPage();
    }

    if (page.includes('sign-in.html')) {
        return initializeSignInPage();
    }

    if (page.includes('sign-up.html')) {
        return initializeSignUpPage();
    }

    if (page.includes('show-content.html')) {
        return initializeShowContentPage();
    }

    if (page.includes('add-content.html')) {
        return initializeAddContentPage();
    }

    function initializeIndexPage() {
        const searchForm = document.querySelector('.site-search');
        const filterForm = document.querySelector('.filter-form');
        searchForm.onsubmit = assetController.search;
        filterForm.onsubmit = assetController.applyFilters;
        assetController.initialIndexPageRender();
    }

    function initializeSignInPage() {
        const logInForm = document.querySelector('.sign-in .registration-form');
        if (logInForm) {
            logInForm.onsubmit = userController.logIn;
        }
    }

    function initializeSignUpPage() {
        const registrationForm = document.querySelector('.sign-up .registration-form');

        if (registrationForm) {
            const registrationButton = document.querySelector('.registration-button');
            registrationButton.onclick = userController.signUp;
        }
    }

    function initializeShowContentPage() {
        const user = userController.getCurrentUser();
        assetController.showContent(user);
    }

    function initializeAddContentPage() {
        if (!userController.isUserAuthenticated()) {
            document.location = 'index.html';
        }
        const addAssetForm = document.querySelector('.add-content-form');
        if (addAssetForm) {
            addAssetForm.onsubmit = assetController.addAsset;
        }
    }
}

initializePage();