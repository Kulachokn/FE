// import PouchDB from 'pouchdb';
// import faker from 'faker';
// import _ from 'lodash-es';

window.seedData = seedData;

async function seedData() {
  const usersDb = new PouchDB('users');
  const assetsDb = new PouchDB('assets');
  const users = [];
  for (let i = 0; i < 10; i++) {
    users.push({
      name: faker.internet.userName(),
      email: faker.internet.email(),
      createdAt: new Date(faker.date.past()).getTime(),
      password: btoa('pass'),
      favorites: []
    })
  }
  const reply = await usersDb.bulkDocs(users, {include_docs: true});
  users.forEach((user, idx) => {
    user._id = reply[idx].id
  });

  const assets = [];

  const contentLinks = [
    {url: 'http://localhost:5000/audio/file_example_OOG_2MG.ogg', type: 'AUDIO', fileName: 'file_example_OOG_2MG.ogg'},
    {url: 'http://localhost:5000/audio/SampleAudio_0.4mb.mp3', type: 'AUDIO', fileName: 'SampleAudio_0.4mb.mp3'},
    {url: 'http://localhost:5000/audio/web-standards-211.mp3', type: 'AUDIO', fileName: 'web-standards-211.mp3'},
    {url: 'http://localhost:5000/book/alice.epub', type: 'BOOK', fileName: 'alice.epub'},
    {url: 'http://localhost:5000/book/res.pdf', type: 'BOOK', fileName: 'res.pdf'},
    {url: 'http://localhost:5000/book/moby-dick.epub', type: 'BOOK', fileName: 'moby-dick.epub'},
    {url: 'http://localhost:5000/video/1280.ogv', type: 'VIDEO', fileName: '1280.ogv'},
    {url: 'http://localhost:5000/video/1280.webm', type: 'VIDEO', fileName: '1280.webm'},
    {url: 'http://localhost:5000/video/SampleVideo_1280x720_10mb.mp4', type: 'VIDEO', fileName: 'SampleVideo_1280x720_10mb.mp4'},
  ];

  for (let i = 0; i < 112; i++) {
    const asset = await createAsset(i);
    assets.push(asset);
  }

  console.log(assets);


  async function createAsset(n) {
    const user = _.sample(users);
    const languages = ['rus', 'eng'];
    const levels = ['beginner', 'middle', 'advanced'];
    const sampleContent = _.sample(contentLinks);

    if (!sampleContent.contentBlob) {
      sampleContent.contentBlob = await (fetch(sampleContent.url).then(result => result.blob()));
    }
    const descriptions = ["The only course you need to learn web development - HTML, CSS, JS, Node, and More!", "Become a full-stack web developer with just one co…, CSS, Javascript, Node, React, MongoDB and more!", "Master JavaScript with the most complete course! P…ges, quizzes, JavaScript ES6+, OOP, AJAX, Webpack", "Master Angular (formerly \"Angular 2\") and build aw…eactive web apps with the successor of Angular.js", "Learn to code and become a Web Developer in 2020 w…ascript, React, Node.js, Machine Learning & more!", "Become a Senior React Developer! Build a massive E…dux, Hooks, GraphQL, ContextAPI, Stripe, Firebase", "The easiest way to learn modern web design, HTML5 …tep from scratch. Design AND code a huge project.", "Vue.js is an awesome JavaScript Framework for buil…cations! VueJS mixes the Best of Angular + React!", "Learn Web Development by building 25 websites and …HTML, CSS, Javascript, PHP, Python, MySQL & more!", "The most advanced and modern CSS course on the int…x, CSS Grid, responsive design, and so much more.", "Learn to build websites with HTML , CSS , Bootstrap , Javascript , jQuery , Python 3 , and Django!", "Master React v16.6.3 and Redux with React Router, Webpack, and Create-React-App.  Includes Hooks!", "Don't limit the Usage of TypeScript to Angular! Le…asics, its Features, Workflows and how to use it!", "Build modern responsive websites & UIs with HTML5, CSS3 & Sass! Learn Flex & CSS Grid", "Build fullstack React.js applications with Node.js… MongoDB (MERN) with this project-focused course.", "Learn and build projects with pure JavaScript (No frameworks or libraries)"].concat(["The only course you need to learn web development - HTML, CSS, JS, Node, and More!", "Become a full-stack web developer with just one co…, CSS, Javascript, Node, React, MongoDB and more!", "Master JavaScript with the most complete course! P…ges, quizzes, JavaScript ES6+, OOP, AJAX, Webpack", "Master Angular (formerly \"Angular 2\") and build aw…eactive web apps with the successor of Angular.js", "Learn to code and become a Web Developer in 2020 w…ascript, React, Node.js, Machine Learning & more!", "Become a Senior React Developer! Build a massive E…dux, Hooks, GraphQL, ContextAPI, Stripe, Firebase", "The easiest way to learn modern web design, HTML5 …tep from scratch. Design AND code a huge project.", "Vue.js is an awesome JavaScript Framework for buil…cations! VueJS mixes the Best of Angular + React!", "Learn Web Development by building 25 websites and …HTML, CSS, Javascript, PHP, Python, MySQL & more!", "The most advanced and modern CSS course on the int…x, CSS Grid, responsive design, and so much more.", "Learn to build websites with HTML , CSS , Bootstrap , Javascript , jQuery , Python 3 , and Django!", "Master React v16.6.3 and Redux with React Router, Webpack, and Create-React-App.  Includes Hooks!", "Don't limit the Usage of TypeScript to Angular! Le…asics, its Features, Workflows and how to use it!", "Build modern responsive websites & UIs with HTML5, CSS3 & Sass! Learn Flex & CSS Grid", "Build fullstack React.js applications with Node.js… MongoDB (MERN) with this project-focused course.", "Learn and build projects with pure JavaScript (No frameworks or libraries)"]).concat(["The only course you need to learn web development - HTML, CSS, JS, Node, and More!", "Become a full-stack web developer with just one co…, CSS, Javascript, Node, React, MongoDB and more!", "Master JavaScript with the most complete course! P…ges, quizzes, JavaScript ES6+, OOP, AJAX, Webpack", "Master Angular (formerly \"Angular 2\") and build aw…eactive web apps with the successor of Angular.js", "Learn to code and become a Web Developer in 2020 w…ascript, React, Node.js, Machine Learning & more!", "Become a Senior React Developer! Build a massive E…dux, Hooks, GraphQL, ContextAPI, Stripe, Firebase", "The easiest way to learn modern web design, HTML5 …tep from scratch. Design AND code a huge project.", "Vue.js is an awesome JavaScript Framework for buil…cations! VueJS mixes the Best of Angular + React!", "Learn Web Development by building 25 websites and …HTML, CSS, Javascript, PHP, Python, MySQL & more!", "The most advanced and modern CSS course on the int…x, CSS Grid, responsive design, and so much more.", "Learn to build websites with HTML , CSS , Bootstrap , Javascript , jQuery , Python 3 , and Django!", "Master React v16.6.3 and Redux with React Router, Webpack, and Create-React-App.  Includes Hooks!", "Don't limit the Usage of TypeScript to Angular! Le…asics, its Features, Workflows and how to use it!", "Build modern responsive websites & UIs with HTML5, CSS3 & Sass! Learn Flex & CSS Grid", "Build fullstack React.js applications with Node.js… MongoDB (MERN) with this project-focused course.", "Learn and build projects with pure JavaScript (No frameworks or libraries)"]).concat(["Learn to master Laravel to make advanced applications like the real CMS app we build on this course", "Use Ethereum, Solidity, and Smart Contracts to build production-ready apps based on the blockchain", "Get advanced with Node.Js! Learn caching with Redi…lustering, and add image upload with S3 and Node!", "Learn to build fast, scalable and secure RESTful s…de, Express and MongoDB, from setup to production", "Build highly engaging Vue JS apps with Nuxt.js. Nu…ide-rendering and a folder-based config approach.", "Build three complete websites, learn back and fron…t, and publish your site online with DigitalOcean", "Create an advanced REST API with Python, Django RE…rk and Docker using Test Driven Development (TDD)", "Detailed walkthroughs on advanced React and Redux …tion, Testing, Middlewares, HOC's, and Deployment", "Full Stack Java developer - Core Java + JSP Servle…ng + Java Web-service/RestFul  API + Spring boot.", "Dive deep under the hood of NodeJS. Learn V8, Expr…e MEAN stack, core Javascript concepts, and more.", "Use Angular, Angular Material, Angularfire (+ Fire…h Firestore) and NgRx to build a real Angular App", "Learn Git, GitHub, Node.js, NPM, Object-oriented J…ES6, webpack, Netlify, BEM and Job Interview Tips", "Build Python Web Applications from Beginner to Expert using Python and Flask", "Understand the JavaScript language itself, Node.js…rowser and More To Create Meaningful Applications", "Develop and deploy enterprise back-end application…owing best practices using Node.js and TypeScript", "Learn the Theory and How to implement state of the…nguage Processing models in Tensorflow and Python"]).concat(["Build Amazing Java Web Services - RESTful & SOAP -…g Boot. Master REST APIs & SOAP Web Services Now!", "Learn web development with HTML, CSS, Bootstrap 4, ES6 React and Node", "Become a Full-Stack Developer - Learn Everything from Design to Front & Back-End Programming.", "Build high-performance web applications with SvelteJS - a lightweight JavaScript compiler", "Become a Full Stack Java Developer. Build Your Fir…l Stack Application with Angular and Spring Boot.", "Learn Python and build & deploy a real estate application using the Django framework & PostgreSQL", "Master ASP.NET MVC Core with hands on experience o…. A step by step course to learn ASP.NET Core MVC", "The Complete Electron course for learning to build…latform Desktop Apps using HTML, JavaScript & CSS", "JavaScript for Beginners: Projects based learning,…rd animations, coding in the browser and quizzes.", "Salesforce Development :Learn about Apex programmi…force development. Become a Salesforce Developer.", "The only course you need to become a full-stack we… HTML5, CSS3, JS, ES6, Node, APIs, Mobile & more!", "Get from zero to proficiency in Laravel PHP Framew…! Course for beginners and intermediate students!", "Full-stack blockchain programming course! A backen…th Node.js, Jest, Express, React, Heroku, & more!", "Use Quasar, Vue JS 2, Vuex & Firebase to build a C… Codebase App for Web, iOS, Android, Mac, Windows", "Learn and Use the Future of JavaScript - Today!", "Build a custom object oriented PHP MVC framework and then build an application with it"]).concat(["Don't simply follow a tutorial, learn what it real…a pro Rails developer with this immersive course.", "Everything you need to become a hirable WordPress Developer building custom themes and plugins", "Master AngularJS and the Javascript concepts behin… directives, and build a single page application.", "Learn how to develop on the ServiceNow platform!", "Learn Vue JS & Firebase by creating & deploying dynamic web apps (including Authentication).", "Finally create that App + fully-functioning user d…abase in this crash course to building a REST API", "Learn to build beautiful responsive websites with …strap version (4.1.3),  Flexbox, HTML5, and CSS3!", "PHP OOP: Learn OOP PHP and Take your skills to ano… serious money by building awesome applications. ", "Design and build beautiful data visualizations wit…An intensive introduction to the D3 library (V6).", "Learn Hibernate and JPA (Java Persistence API) using Spring and Spring Boot", "Learn JavaScript, PHP and MySQL by making the ulti…te Netflix clone website completely from scratch!", "Master Functional Programming techniques with Elix…le learning to build compelling web applications!", "Learn how to develop WordPress themes and plugins.…ooCommerce, BuddyPress and Gutenberg development.", "Learn numerous RxJs Operators, learn all RxJs and … Programming core concepts via Practical Examples", "Learn JavaScript, PHP and MySQL by building the ul…network website from scratch! The complete guide!", "MERN Stack React Node MongoDB powered E-Commerce A…nd Credit Card Payment along with Admin Dashboard"]).concat(["Get started as a front-end web developer using HTML, CSS, JavaScript, jQuery, and Bootstrap!", "The Best Resource for Building Amazing Full-Stack …h the Best in MongoDB, Express, React and Node.js", "Take your REST APIs to a whole new level with this advanced Flask and Python course!", "Master Next.js (Next 9), React (React 16+) & Node.…d Isomorphic Website, incl. SEO, Blog, Deployment", "Build the site you want using the most powerful WordPress page builder & theme creator.", "Portfolio builder loaded with projects and applica…e, extend on and enhance to add to your portfolio", "Master Symfony PHP framework: from theory, through… up to creating an advanced Real Life Application", "Master MongoDB and Mongoose design with a test-driven approach", "Socket io. For those who want to learn how to harn…nication on the web. With Cluster, redis, & React", "Learn Python coding with RESTful API's using the F…stand how to use MongoDB, Docker and Tensor flow.", "Learn how to use D3 (v5) & Firebase (Firestore) to…VG data visualizations. Bar charts, pie charts...", "Use jQuery to create stunning animations, provide …s, handle all user events and perform Ajax calls.", "Deploy a Serverless GraphQL & React JS based Javas…n the AWS Cloud using AWS AppSync and AWS Amplify", "You will learn how to build Apps without code usin…Apps and Microsoft Flow.  A powerful alternative!", "Create interactive web applications with C#", "Build simple to advanced web applications using th…ar web framework - Completely re-recorded for 5.8"]);
    const tags = ["Frontend", "Angular", "TypeScript", "HTML", "CSS", "JavaScript", "Vue", "JQuery", "React.js", "AngularJS", "Ember", "Next.js", "Elm", "Svelte", "Backend", "PHP", "Python", "Ruby on Rails", "Yii", "Laravel", "Sql", "Ruby", "Symfony", "Firebase", "Java", "Node.js", "Golang (Google Go)", "Slim", "Silex", "C Sharp (C#)", "System programming", "Marketing", "SEO", "Video/3D", "Graphic", "Tools", "GraphQL", "AWS", "Docker", "Flux", "Webpack", "Ansible", "Git", "Kubernetes", "Gulp", "Grunt", "Visual Studio Code", "VIM", "Azure", "OpenCV", "Salt", "SVN", "Atom", "Elasticsearch", "Gitlab", "Electron", "Chrome DevTools", "Yarn", "Babel", "GitHub", "Grep", "NPM", "Gatsby", "Google Cloud", "Разработка мобильных приложений", "React Native", "Ionic", "Swift", "Progressive Web App (PWA)", "Core Data", "Xamarin", "NativeScript", "Dart и Flutter", "Gamedev", "CMS", "Wordpress", "OpenCart", "Drupal", "Joomla", "1C-Битрикс", "MODX", "Blockchain", "Криптовалюты", "Тестирование / Quality Assurance (QA)", "Postman", "Selenium", "Appium", "Protractor", "Cypress", "Другое", "Подготовка к собеседованию"];

    const titles = ["The Web Developer Bootcamp", "The Complete 2020 Web Development Bootcamp", "The Complete JavaScript Course 2020: Build Real Projects!", "Angular 8 - The Complete Guide (2020 Edition)", "The Complete Web Developer in 2020: Zero to Mastery", "Complete React Developer in 2020 (w/ Redux, Hooks, GraphQL)", "Build Responsive Real World Websites with HTML5 and CSS3", "Vue JS 2 - The Complete Guide (incl. Vue Router & Vuex)", "The Complete Web Developer Course 2.0", "Advanced CSS and Sass: Flexbox, Grid, Animations and More!", "Python and Django Full Stack Web Developer Bootcamp", "Modern React with Redux [2019 Update]", "Understanding TypeScript - 2020 Edition", "Modern HTML & CSS From The Beginning (Including Sass)", "React, NodeJS, Express & MongoDB - The MERN Fullstack Guide", "Modern JavaScript From The Beginning"].concat(["Advanced JavaScript Concepts", "Build an app with ASPNET Core and Angular from scratch", "Master Microservices with Spring Boot and Spring Cloud", "Node.js API Masterclass With Express & MongoDB", "The Complete Junior to Senior Web Developer Roadmap (2020)", "Become a WordPress Developer: Unlocking Power With Code", "Node.js, Express, MongoDB & More: The Complete Bootcamp 2020", "Angular & NodeJS - The MEAN Stack Guide [2020 Edition]", "JavaScript: Understanding the Weird Parts", "REST APIs with Flask and Python", "PHP for Beginners - Become a PHP Master - CMS Project", "The Complete WordPress Website Business Course", "The Coding Interview Bootcamp: Algorithms + Data Structures", "The Complete ASP.NET MVC 5 Course", "The Advanced Web Developer Bootcamp", "MERN Stack Front To Back: Full Stack React, Redux & Node.js"]).concat(["The Complete React Developer Course (w/ Hooks and Redux)", "Bootstrap 4 From Scratch With 5 Projects", "React Front To Back", "Web Design for Beginners: Real World Coding in HTML & CSS", "AWS Serverless APIs & Apps - A Complete Introduction", "Progressive Web Apps (PWA) - The Complete Guide", "The Modern React Bootcamp (Hooks, Context, NextJS, Router)", "The Complete Ruby on Rails Developer Course", "Node with React: Fullstack Web Development", "The Modern JavaScript Bootcamp", "Modern JavaScript (from Novice to Ninja)", "Web Development w/ Google’s Go (golang) Programming Language", "Complete guide to building an app with .Net Core and React", "GraphQL with React: The Complete Developers Guide", "Python and Flask Bootcamp: Create Websites using Flask!", "The Complete Angular Course: Beginner to Advanced"]).concat(["The Complete React Developer Course (w/ Hooks and Redux)", "Bootstrap 4 From Scratch With 5 Projects", "React Front To Back", "Web Design for Beginners: Real World Coding in HTML & CSS", "AWS Serverless APIs & Apps - A Complete Introduction", "Progressive Web Apps (PWA) - The Complete Guide", "The Modern React Bootcamp (Hooks, Context, NextJS, Router)", "The Complete Ruby on Rails Developer Course", "Node with React: Fullstack Web Development", "The Modern JavaScript Bootcamp", "Modern JavaScript (from Novice to Ninja)", "Web Development w/ Google’s Go (golang) Programming Language", "Complete guide to building an app with .Net Core and React", "GraphQL with React: The Complete Developers Guide", "Python and Flask Bootcamp: Create Websites using Flask!", "The Complete Angular Course: Beginner to Advanced"]).concat(["Master Java Web Services and RESTful API with Spring Boot", "Beginner Full Stack Web Development: HTML, CSS, React & Node", "Ultimate Web Designer & Developer Course: Build 23 Projects!", "Svelte.js - The Complete Guide (incl. Sapper.js)", "Go Java Full Stack with Spring Boot and Angular", "Python Django Dev To Deployment", "Master ASP.NET MVC Core 3", "Master Electron: Desktop Apps with HTML, JavaScript & CSS", "JavaScript Beginner Bootcamp (2020)", "Salesforce Development Training for Beginners", "The Complete 2020 Web Development Course - Build 15 Projects", "Master Laravel PHP for Beginners and Intermediate", "Build a Blockchain & Cryptocurrency | Full-Stack Edition", "Quasar Framework: Cross-Platform Vue JS Vuex & Firebase Apps", "Accelerated ES6 JavaScript Training", "Object Oriented PHP & MVC"]).concat(["Dissecting Ruby on Rails 5 - Become a Professional Developer", "Complete WordPress Development Themes and Plugins Course", "Learn and Understand AngularJS", "The Complete ServiceNow Developer Course (2018)", "Build Web Apps with Vue JS 2 & Firebase", "Build a Backend REST API with Python & Django - Beginner", "The Bootstrap 4 Bootcamp", "PHP OOP: Object Oriented Programming for beginners + Project", "Mastering data visualization in D3.js", "Master Hibernate and JPA with Spring Boot in 100 Steps", "Create a Netflix clone from Scratch: JavaScript PHP + MySQL", "The Complete Elixir and Phoenix Bootcamp", "WordPress Development - Themes, Plugins & Gutenberg", "RxJs 6 In Practice (with FREE E-Book)", "Build a Social Network from Scratch: JavaScript PHP + MySQL", "MERN Stack React Node Ecommerce from Scratch to Deployment"]).concat(["The Complete Front-End Web Development Course!", "MERN Stack - The Complete Guide", "Advanced REST APIs with Flask and Python", "Complete Next.js with React & Node - Beautiful Portfolio App", "WordPress Front-End Development with Elementor", "JavaScript 50+ projects and applications Monster JavaScript", "Symfony 4 & 5 Web Development Guide: Beginner To Advanced", "The Complete Developers Guide to MongoDB", "Socket.IO (with websockets) - the details. (socket io v2)", "Python REST APIs with Flask, Docker, MongoDB, and AWS DevOps", "Build Data Visualizations with D3.js & Firebase", "The Complete jQuery Course: From Beginner To Advanced!", "AWS AppSync & Amplify with React & GraphQL - Complete Guide", "Microsoft PowerApps & Flow: Build Business Apps Without Code", "Programming in Blazor - ASP.NET Core 3.1", "Laravel 2019, the complete guide with real world projects"]);
    const thumbnailUrls = [ 'http://localhost:5000/thumbnails/1286908_1773_5.jpg','http://localhost:5000/thumbnails/1313502_b57f_2.jpg','http://localhost:5000/thumbnails/2395488_bd78_2.jpg','http://localhost:5000/thumbnails/246154_d8b0_3.jpg','http://localhost:5000/thumbnails/1241254_9cc1.jpg','http://localhost:5000/thumbnails/1329100_571a.jpg','http://localhost:5000/thumbnails/2320056_4fa0_6.jpg','http://localhost:5000/thumbnails/519442_63fe_2.jpg','http://localhost:5000/thumbnails/1254420_f6cb_4.jpg','http://localhost:5000/thumbnails/1470810_a8b0.jpg','http://localhost:5000/thumbnails/2201164_831a.jpg','http://localhost:5000/thumbnails/1002030_f3e0_5.jpg','http://localhost:5000/thumbnails/2472180_0143.jpg','http://localhost:5000/thumbnails/1109926_7f97_2.jpg','http://localhost:5000/thumbnails/1546884_86af.jpg','http://localhost:5000/thumbnails/1247828_32bb.jpg','http://localhost:5000/thumbnails/1501104_967d_11.jpg','http://localhost:5000/thumbnails/1455016_0b2d_2.jpg','http://localhost:5000/thumbnails/1352468_3d97_7.jpg','http://localhost:5000/thumbnails/2609434_23cf_2.jpg','http://localhost:5000/thumbnails/1650610_2673_5.jpg','http://localhost:5000/thumbnails/1010586_b622_3.jpg','http://localhost:5000/thumbnails/1672410_9ff1_5.jpg','http://localhost:5000/thumbnails/833442_b26e_4.jpg','http://localhost:5000/thumbnails/364426_2991_5.jpg','http://localhost:5000/thumbnails/970600_68be_4.jpg','http://localhost:5000/thumbnails/405282_27d2.jpg','http://localhost:5000/thumbnails/520116_edf5_2.jpg','http://localhost:5000/thumbnails/1409142_1879_8.jpg','http://localhost:5000/thumbnails/806922_6310_3.jpg','http://localhost:5000/thumbnails/1218586_9f86.jpg','http://localhost:5000/thumbnails/1646980_23f7_2.jpg','http://localhost:5000/thumbnails/625204_436a_2.jpg','http://localhost:5000/thumbnails/1565838_e54e_10.jpg','http://localhost:5000/thumbnails/851712_fc61_5.jpg','http://localhost:5000/thumbnails/756150_c033_2.jpg','http://localhost:5000/thumbnails/1430746_2f43_9.jpg','http://localhost:5000/thumbnails/2365628_0b60_7.jpg','http://localhost:5000/thumbnails/437398_46c3_9.jpg','http://localhost:5000/thumbnails/995016_ebf4.jpg','http://localhost:5000/thumbnails/764164_de03_2.jpg','http://localhost:5000/thumbnails/1026604_790b_2.jpg','http://localhost:5000/thumbnails/822444_a6db.jpg','http://localhost:5000/thumbnails/705264_caa9_11.jpg','http://localhost:5000/thumbnails/947098_02ec.jpg','http://localhost:5000/thumbnails/2153774_bef0_4.jpg','http://localhost:5000/thumbnails/2640372_5b44_3.jpg','http://localhost:5000/thumbnails/1463348_52a4_2.jpg','http://localhost:5000/thumbnails/758582_ea1f.jpg','http://localhost:5000/thumbnails/1466612_bead_2.jpg','http://localhost:5000/thumbnails/1587718_8fdf.jpg','http://localhost:5000/thumbnails/1638522_fbdf.jpg','http://localhost:5000/thumbnails/1523224_60cb.jpg','http://localhost:5000/thumbnails/1562632_a245_2.jpg','http://localhost:5000/thumbnails/2045310_f8a2_5.jpg','http://localhost:5000/thumbnails/781532_8b4d_6.jpg','http://localhost:5000/thumbnails/1993718_b47a.jpg','http://localhost:5000/thumbnails/461160_8d87_6.jpg','http://localhost:5000/thumbnails/1512962_9f57.jpg','http://localhost:5000/thumbnails/818990_57c0_3.jpg','http://localhost:5000/thumbnails/631128_2efb_6.jpg','http://localhost:5000/thumbnails/1436332_1fc3_5.jpg','http://localhost:5000/thumbnails/2053219_e620_2.jpg','http://localhost:5000/thumbnails/1460764_a6f8_2.jpg','http://localhost:5000/thumbnails/1302610_5c62_4.jpg','http://localhost:5000/thumbnails/1042110_ffc3_4.jpg','http://localhost:5000/thumbnails/446134_383c_2.jpg','http://localhost:5000/thumbnails/2360566_d008.jpg','http://localhost:5000/thumbnails/2023728_2d6d_4.jpg','http://localhost:5000/thumbnails/1952540_8152_2.jpg','http://localhost:5000/thumbnails/2120618_cfe6_2.jpg','http://localhost:5000/thumbnails/941998_7ec6_2.jpg','http://localhost:5000/thumbnails/860812_f16e_23.jpg','http://localhost:5000/thumbnails/622466_2dee_4.jpg','http://localhost:5000/thumbnails/548278_b005_9.jpg','http://localhost:5000/thumbnails/2020278_e07c_6.jpg','http://localhost:5000/thumbnails/2034156_1187.jpg','http://localhost:5000/thumbnails/2305152_ecfb_5.jpg','http://localhost:5000/thumbnails/886614_68cc.jpg','http://localhost:5000/thumbnails/1399390_4a26_2.jpg','http://localhost:5000/thumbnails/1052118_d5a9.jpg','http://localhost:5000/thumbnails/1178762_ac09_3.jpg','http://localhost:5000/thumbnails/289230_1056_16.jpg','http://localhost:5000/thumbnails/756266_37b6_7.jpg','http://localhost:5000/thumbnails/1639836_a03e_3.jpg','http://localhost:5000/thumbnails/1094964_35b4_4.jpg','http://localhost:5000/thumbnails/1968412_f5f5_5.jpg','http://localhost:5000/thumbnails/473548_7f72_3.jpg','http://localhost:5000/thumbnails/1360998_ccfe_6.jpg','http://localhost:5000/thumbnails/1341538_b1e7_4.jpg','http://localhost:5000/thumbnails/2588280_df00_2.jpg','http://localhost:5000/thumbnails/904462_042a_3.jpg','http://localhost:5000/thumbnails/576054_7e88_6.jpg','http://localhost:5000/thumbnails/1726420_7370.jpg','http://localhost:5000/thumbnails/418386_7e2e_6.jpg','http://localhost:5000/thumbnails/2293579_e5c9_8.jpg','http://localhost:5000/thumbnails/1166306_84a1_3.jpg','http://localhost:5000/thumbnails/2564962_073e_3.jpg','http://localhost:5000/thumbnails/1954018_dcd3_4.jpg','http://localhost:5000/thumbnails/2000856_bce7.jpg','http://localhost:5000/thumbnails/2578302_aa50_2.jpg','http://localhost:5000/thumbnails/2231706_785e_7.jpg','http://localhost:5000/thumbnails/2101568_a38c.jpg','http://localhost:5000/thumbnails/1000574_06cb.jpg','http://localhost:5000/thumbnails/1934362_ca3c.jpg','http://localhost:5000/thumbnails/1747522_f7f0.jpg','http://localhost:5000/thumbnails/1918908_8c89.jpg','http://localhost:5000/thumbnails/812588_5180_5.jpg','http://localhost:5000/thumbnails/2552991_4874.jpg','http://localhost:5000/thumbnails/1354088_80cf_2.jpg','http://localhost:5000/thumbnails/2622292_d6ab_3.jpg','http://localhost:5000/thumbnails/1064104_d365_3.jpg' ];

    const reader = new FileReader();
    const thumbnailBlob = await (fetch(thumbnailUrls[n]).then(result => result.blob()));

    const thumbnailURL = await new Promise((ok, fail) => {
      reader.onerror = fail;
      reader.onloadend = function () {
        ok(reader.result);
      };
      reader.readAsDataURL(thumbnailBlob);
    });

    const asset = {
      title: titles[n],
      description: descriptions[n],
      createdBy: {
        name: user.name,
        email: user.email,
        id: user._id
      },
      createdAt: new Date(faker.date.past()).getTime(),
      level: _.sample(levels),
      language: _.sample(languages),
      tags: _.sampleSize(tags, _.random(0, 8)),
      thumbnail: {
        url: thumbnailURL,
        contentType: thumbnailBlob.type,
        isDefault: false
      },
      rating: _.times(_.random(10, 20), () => ({userId: faker.random.uuid(), score: _.random(1, 5)})),
      contentType: sampleContent.type,
      fileName: sampleContent.fileName,
      _attachments: {
        content: {
          content_type: sampleContent.contentBlob.type,
          data: sampleContent.contentBlob
        }
      }
    };

    return assetsDb.post(asset);
  }
}


// [].map.call(document.querySelectorAll('.list-view-course-card--headline-and-instructor--2nbyp span'), e => e.textContent).filter(e => e.length > 40);
// [].map.call(document.querySelectorAll('.list-view-course-card--title--2pfA0 h4'), e => e.textContent);
// [].map.call(document.querySelectorAll('.list-view-course-card--course-image--1XvxT'), e => e.src);


// console.log('desc', descriptions.length);
// console.log('titl', titles.length);
// console.log('thumb', thumbnailsUrl.length);