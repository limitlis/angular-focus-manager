### Focus Manager Development Stages

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