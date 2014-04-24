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
	 

The following represents the functions and steps needed to traverse through the above structure. There will be 4 functions that we will use

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
	
	
