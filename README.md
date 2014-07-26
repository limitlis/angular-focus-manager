#Angular Focus Manager

###Control key and mouse navigation in your web application.
---

**[Download](https://raw.githubusercontent.com/webux/angular-focusmanager/master/build/angular-focusmanager.js)** (or **[Minified](https://raw.githubusercontent.com/webux/angular-focusmanager/master/build/angular-focusmanager.min.js)**) **|**
**[Guide](https://github.com/webux/angular-focusmanager/wiki) |**
**[API](http://webux.github.io/focusmanager/site) |**
**[Examples](http://webux.github.com/focusmanager/examples/) ([Src](https://github.com/webux/focusmanager/tree/gh-pages/sample)) |**
**[FAQ](https://github.com/webux/focusmanager/wiki/faq) |**
**[Resources](#resources) |**
**[Report an Issue](#report-an-issue) |**
**[Contribute](#contribute) |**
**[Help!](http://stackoverflow.com/questions/ask?tags=angularjs,focusmanager) |**
**[Discuss](https://groups.google.com/forum/#!categories/webux/focusmanager)**

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
* Install via Bower: by running $ bower install angular-focusmanager from your console

**(2)** Include angular-focusmanager.js (or angular-focusmanager.min.js) in your index.html, after including Angular itself

**(3)** Add "go" to your main module's list of dependencies

When you're done, your setup should look similar to the following:

>
```html
<!doctype html>
<html ng-app="myApp">
<head>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.min.js"></script>
    <script src="js/angular-focusmanager.min.js"></script>
    <script>
        var myApp = angular.module('myApp', ['go']);
    </script>
    ...
</head>
<body>
    ...
</body>
</html>
```
