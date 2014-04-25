## Focus Manager Development

The goal is to create a focus manager that:

* Can navigate through elements in a controlled manner.
* ARIA compatible
* Easy to use but able to handle complex environments with popups, dialogs, multiple sections, etc.
* No jQuery dependencies

The Focus Manager is dependent on AngularJS in a limited capacity and it may be possible to break it out for other frameworks though that is not one of the primary goals at this time.

The devlopement will be broken into phases and stages to document the development cycle, thoughts, challenges and workflow.


###Phase 1: Element Traversal
---
The goal with this phase is to be able to traverse through the focus elements using the TAB and SHIFT+TAB. There should be groups to help organize the order in which things are traversed. In the end, it won't look to much different from what you would see if we didn't have the Focus Manager, which means it is working, with the following exceptions. The FM will have:

* **Isolated groups**: certain groups will receive focus unless an element inside of it has focus
* **Loops**: Once the last element has been reached, the next request will loop back to the start.

#####Stage 1: Next Element Traversal
---

The following represents structure to test against during development.

	group-1
		el-1
		el-2
		group-1-1
			group-1-1-1
				el-3
		group-1-2
			group-1-2-1
				el-4
				el-5
	 

The following represents the functions and steps needed to traverse through the above structure. These are the following function we will use:

* **findNextElement(groupId [, elementId])**: Finds the next element in the group
* **findNextGroup([containerId, groupId])**: Goes up chain of focus groups until next group is found
* **findNextChildGroup(groupId)**: Finds the next child focus group

The following represents the flow:

	findNextGroup() -> "group-1"
	findNextElement("group-1") -> "el-1"
	findNextElement("group-1", "el-1") -> "el-2"
	findNextElement("group-1", el-2") -> NULL
	findNextChildGroup("group-1") -> "group-1-1"
	findNextElement("group-1-1") -> NULL
	findNextChildGroup("group1-1") -> "group-1-1-1"	findNextElement("group-1-1-1") -> "el-3"
	findNextElement("group-1-1-1", "el-3") -> NULL && findNextChildGroup("group-1-1-1") -> NULL
	findNextGroup("group-1-1", "group-1-1-1") -> NULL
	findNextGroup("group-1", "group-1-1") -> "group-1-2"
	findNextElement("group-1-2") -> NULL
	findNextChildGroup("group-1-2") -> "group-1-2-1"
	findNextElement("group-1-2-1") -> "el-4"
	findNextElement("group-1-2-1", el-4") -> "el-5"
	findNextElement("group-1-2-1", el-5") -> NULL && findNextChildGroup("group-1-2-1") -> NULL
	findNextGroup("group-1-2", "group-1-2-1") -> NULL
	findNextGroup("group-1", "group-1-2") -> NULL
	
	CHECK FOR LOOP
	
#####Stage 2: Previous Element Traversal
---

The following represents structure to test against during development.

	group-1
		el-1
		el-2
		group-1-1
			group-1-1-1
				el-3
		group-1-2
			group-1-2-1
				el-4
				el-5
					

The following represents the functions and steps needed to traverse through the above structure. These are the following functions we will use

* **findPrevElement(groupId [, elementId])**: Finds the previous element in the group
* **findPrevGroup([containerId, groupId])**: Goes up chain of focus groups until next group is found
* **findPrevChildGroup(groupId)**: Finds the previous child focus group

The following represents the flow:

	findPrevChildGroup() -> "group-1"
	findPrevChildGroup() -> "group-1-2"
	findPrevChildGroup("group-1-2") -> "group-1-2-1"
	findPrevChildGroup("group-1-2-1") -> NULL
	findPrevElement("group-1-2-1") -> "el-5"
	findPrevElement("group-1-2-1", "el-5") -> "el-4"
	findPrevElement("group-1-2-1", "el-4") -> NULL
	findPrevGroup("group-1-2", "group-1-2-1") -> NULL
	findPrevGroup("group-1", "group-1-2") -> "group-1-1"
	findPrevChildGroup("group-1-1") -> "group-1-1-1"
	findPrevChildGroup("group-1-1-1") -> NULL
	findPrevElement("group-1-1-1") -> "el-3"
	findPrevElement("group-1-1-1", "el-3") -> NULL
	findPrevGroup("group-1-1", "group-1-1-1") -> NULL
	findPrevGroup("group-1", "group-1-1") -> NULL
	findPrevElement("group-1") -> "el-2"
	findPrevElement("group-1", "el-2") -> "el-1"
	findPrevElement("group-1", "el-1") -> NULL

	CHECK FOR LOOP
	
	
#####Stage 3: Loops
---

As part of the cleanup I added a new property to allow looping. I had it listed as "CHECK FOR LOOP". This will complete The first phase of development.

	focus-loop="true"
	
###Cleanup and Grunt Integration
---
Setting up Gruntfile; committing build. Cleanup.	
	
	
###Phase 2: User Interaction
---

The goal is to support Key and Mouse interaction through registering hotkey and combo keys to a public interfacing API, ability to mute and unmute actions.

##### Stage 3: Mouse Interaction
---
	focusMouse.mute()
	focusMouse.unmute()
	

##### Stage 4: Keyboard Interaction
---

	<div focus-keyboard="SHIFT+Q"></div>

	focusKeyboard.mute()
	focusKeyboard.unmute()
	
I chose to use "Mousetrap.js". It has the capabilities I am looking for and has a small footprint. It will be compiled into Focus Manager.


###Testing & Notes
---

**Event Dispatcher**

Upon testing the current status of the application, things seem to be working well in Chrome, since that was what I was developing in but not so much in Firefox. I know that the main problem is that Firefox does not support "focusin" and "focusout" events. I also know the focus events are not what I necessarily want other components listening to inside Focus Manager since they are not reflective of what is happening internally. So I built a EventDispatcher that FM is using to send out events. This is also what would be used to listen to events externally as well. Example: FocusHighlight directive.

**Scope**

Another thing I had to add was a scope on focus groups. This is not an isolate scope, so it should not affect any directives or controllers contained within. This was needed to help with the dispatching of events to other directives such as the "focusKeyboard" directive to turn on and off key bindings.

**Throttle & Debounce**

I am a fan of these two functions from underscore and like to add them where I find they can help with performance. Highlighter throttles the events it receives to prevent from overcompensating for rapid change events. I also use it in group to handle the change in the activeElement to bind and unbind key events.

**Mousetrap.js**

I chose mousetrap.js because it is simple to use but offers a power API. I have simplified focusKeyboard by using it to register keys to the focusModel API. Other keys (such as the navigation) have been registered like this as well.

The keyboard API now looks like this...

	focusKeyboard.enableTabKeys()
    focusKeyboard.disableTabKeys()
    focusKeyboard.enableArrowKeys()
    focusKeyboard.disableArrowKeys()
    focusKeyboard.toggleTabArrowKeys()

**Triggering Key Events***

The browser will not recognize some elements as focus elements by default. (Good thing we are building a Focus Manager). In order to invoke "native" events we have to fire off the events ourselves. I found a function from this url that seems to do the job...

[http://stackoverflow.com/questions/2381572/how-can-i-trigger-a-javascript-event-click](http://stackoverflow.com/questions/2381572/how-can-i-trigger-a-javascript-event-click)

I want the enter key to be the thing which invokes stuff. I will need to try it out on different elements to see when it is needed and make sure I haven't broken native browser support and ARIA support.