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

**Focus Trapping**

Browsers will sometimes cause focus to go to unexpected places if at the start or end of the focus area, or if an component that has uses a popup (sucha as a select has focus.) To resolve this issue if you add an anchor tab at the beginning and end of the "body" tag, we can then monitor and trap the focus when it goes rogue. I created a service called "focusTrap" to handle this procedure.

###Phase 3: Focus management

In this phase, the goal is to start controlling the behavior in which things receive focus using indexed elements and focus groups as well as different types of focus groups.

#####Stage 5: Tab index
---

Support tab indexing as supported by the browser with the exception that tab index will be under focus groups and not traverse the entire page but move from one group to the next. 

#####Stage 6: Focus Group Index
---

Like tab index, group index controls the order in which the groups will be traversed. Similar to tabindex, groups with an index will take priority over those that do not.

	focus-group-index="1"
	
#####Stage 7: Focus Group Types
---

We have already implemented the first type, the other type we will implement is "strict" mode - only those elements with a tab index can receive focus.

**focus-group** - default will find all elements that can recieve focus

**focus-group="strict"** - only DOM elements with an attribute "tabindex" will be traversed

#####Stage 8: Stacked Groups
---

If we have modals or popups or something of the such, it is likely that we will want the focus to go to that group and basically ignore the others. Fortunatedly, we are almost there, we have the isolate groups. Now we just need to remember the stack. This will use a combination of the things we already have...

* When a popup show, we need to make sure we have an element with autofocus.
* We are going to create a new directive called "focus-stack". When set it will stack the previous focus element so when the group is destroyed, it can return the focus.

###Testing & Notes
---

Upon testing, there were a few issues that were fixed. Discovery of a new feature which is the ability to perform the trapping to correct focus issues but when at the start or end of the page, releasing the focus to the next item that would naturally take focus. This will be especially useful when embedding an application within a page that may have other controls of functionality that need to be navigated to outside of FM.

###Phase 4: Catch and release
---

In this phase, the goal is to be able to trap the focus only when the focus manager has an element that can have focus. To be able to work with non-FM enabled DOM.

#####Stage 9: Focus Index
---
We have to disable tabindex and use our own internal focusIndex. This will prevent the browser from trying to consume FM enabled elements in the browser's internal focus manager.

### Notes
---
During this stage, I found that I was having difficulty implementing this feature due to Mousetrap. Mousetrap wasn't dispatching some of the key events. So in the case of the keyboard service, I am using native event listeners to handle keydown events. Mousetrap is still being used to handle key combos. I also found in doing this I no longer needed "focusTrap". In order to have granular control of what happens when we get to the end of an isolated focus group, I refactored "focus-loop" to "focus-group-head" and "focus-group-tail" which supports either "loop" or "stop". If neither are defined, then it will release focus back to the browser and continue its native course.