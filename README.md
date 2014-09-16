#Angular Focus Manager

###Easily control key and mouse navigation in your Angular JS application.
---

**[Download](https://raw.githubusercontent.com/obogo/angular-focus-manager/master/build/angular-focusmanager.js)** (or **[Minified](https://raw.githubusercontent.com/obogo/angular-focusmanager/master/build/angular-focusmanager.min.js)**) **|**
**[Guide](https://github.com/obogo/angular-focus-manager/wiki) |**
**[API](http://obogo.github.io/focusmanager/site) |**
**[Examples](http://obogo.github.com/focusmanager/examples/) ([Src](https://github.com/obogo/focusmanager/tree/gh-pages/sample)) |**
**[FAQ](https://github.com/obogo/focusmanager/wiki/faq) |**
**[Resources](#resources) |**
**[Report an Issue](#report-an-issue) |**
**[Contribute](#contribute) |**
**[Help!](http://stackoverflow.com/questions/ask?tags=angularjs,focusmanager) |**
**[Discuss](https://groups.google.com/forum/#!categories/obogo/focusmanager)**

---

**Angular Focus Manager** allows you to organize your interface to into ***groups*** to have better control over the order in which elements receive focus. Focus Manager is built for web applications that have complex UI such as panels, popups, sections, and custom widgets. Here are some of the benefits to using Focus Manager:

* Simple integration
* ARIA compatible
* Cross-browser support
* No jQuery dependencies
* Small footprint
* Service-based plugin architecture
* Mobile support
* Custom focus highlighter
* Shortcut key support (uses [Mousetrap.js](http://craig.is/killing/mice))

####What's wrong with the browser's focus manager?
---

Have you ever tried navigating through a web application using the TAB key? You have probably found the results to be less than desirable. The browser treats all elements as if it were a single web page, including your application. Angular Focus Manager fixes this limitation of the browser by allowing you to organize your application into ***focus groups***. Focus groups organize elements into sections maintaining the focus index on a more granular level.


##Getting Started
---
**(1)** Get Angular Focus Manager in one of 3 ways:

* Clone this repository
* Download the release (or minified)
* Install via Bower: by running $ bower install angular-focus-manager from your console

**(2)** Include angular-focus-manager.js (or angular-focus-manager.min.js) in your index.html, after including Angular itself

**(3)** Add "fm" to your main module's list of dependencies

When you're done, your setup should look similar to the following:

>
```html
<!doctype html>
<html ng-app="myApp">
<head>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.min.js"></script>
    <script src="js/angular-focus-manager.min.js"></script>
    <script>
        var myApp = angular.module('myApp', ['fm']);
    </script>
    ...
</head>
<body>
    ...
</body>
</html>
```

####Article: "Steps on how the focus manager was created"
---

[Click here to read the article](https://github.com/obogo/angular-focus-manager/wiki/How-the-focus-manager-was-created)