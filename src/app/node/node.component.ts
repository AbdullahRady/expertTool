import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

declare let vis: any;

@Component({
  templateUrl: 'node.component.html',
  styleUrls: ['node.component.css']
})

export class NodeComponent
{
  //Global variable
  public static globe;

  nodeAction = "Add";

  nodeLabel;
  nodeInfo;
  nodeGroup = 1;
  nodeImage;
  nodeLocation;
  nodeStart;
  nodeType = 1;
  question = false;
  questionTargetUserType = [];
  nodeQuestion =
  {
    questionType: 1,
    title: "",
    choiceSets:
    [
      {
        choices:
        [
          {
            content: "",
            start: "",
            location: ""
          },
          {
            content: "",
            start: "",
            location: ""
          },
          {
            content: "",
            start: "",
            location: ""
          }
        ]
      }
    ]
  };

  //Node types displayed in select input
  nodeTypes =
  [
    {"id": 1, "label": "Information"},
    {"id": 2, "label": "MCQ"},
    {"id": 3, "label": "Timeline"},
    {"id": 4, "label": "Map"}
  ];

  //Node types displayed in select input
  nodeGroups =
  [
    {"id": 1, "label": "Normal"},
    {"id": 2, "label": "Important"},
    {"id": 3, "label": "Venue"}
  ];

  options =
  [
    {
      "value": ""
    },
    {
      "value": ""
    },
    {
      "value": ""
    }
  ];

  targetUserTypes;

  constructor(public dialogRef: MatDialogRef<NodeComponent>, @Inject(MAT_DIALOG_DATA) public data: any)
  {
    //Global
    NodeComponent.globe = this;
    NodeComponent.globe.displayTimelineFunction = this.displayTimeline;

    console.log(data);

    if(data.nodesData != null)
    {
      this.nodeAction = "Edit";

      this.nodeLabel = data.nodesData.label;
      this.nodeInfo = data.nodesData.info;
      this.nodeGroup = data.nodesData.group;
      this.nodeImage = data.nodesData.image;

      if(data.nodesData.question == false)
      {
        this.nodeType = 1;
      }

    }

    if(data.targetUsersData != null)
    {
      this.targetUserTypes = data.targetUsersData;
      console.log("targetUserTypes", this.targetUserTypes);


    }

    if(data.questionData != null)
    {
      console.log("data.questionData", data.questionData);

      this.nodeQuestion = data.questionData[0];

      this.nodeType = this.nodeQuestion.questionType + 1;
      console.log("this.nodeType", this.nodeType);

      console.log("question users", data.questionData[0].choiceSets[0].targetUserTypes);

      for(let i = 0; i < this.targetUserTypes.length; i++)
      {
        console.log(this.targetUserTypes[i].id);

        let x = data.questionData[0].choiceSets[0].targetUserTypes;
        let y = this.targetUserTypes[i].id;

        console.log("x = ", x);
        console.log("y = ", y);
        console.log(x.includes(y));

        if(x.includes(y))
          this.questionTargetUserType[i] = true;
        else
          this.questionTargetUserType[i] = false;

        console.log("questionTargetUserType["+i+"]", this.questionTargetUserType[i]);

      }
    }

    if(this.nodeType == 3)
    {
      this.nodeStart = data.nodesData.start;
    }
    else if(this.nodeType == 4)
    {
      this.nodeLocation = data.nodesData.location;
    }


  }

  //Displays node question fields
  displayQuestionFields(value)
  {
    //Verifies that the node is a question
    if(value > 1)
    {
      this.nodeType = value;
      this.question = true;
      console.log(this.nodeType);

      document.addEventListener("DOMContentLoaded", function(event)
      {
        console.log("DOM fully loaded and parsed");
        //NodeComponent.globe.displayTimelineFunction();
      });

      if(this.nodeType == 3)
      {
        this.isElementLoaded("timeline", function()
        {
          NodeComponent.globe.displayTimelineFunction();
          console.log("Timeline loaded..");
        });
      }
    }
    else
    {
      this.nodeType = null;
      this.question = false;
      //console.log(this.nodeType);
    }
  }

  isElementLoaded(id, callback)
  {
    let x = setInterval(function()
    {
        if(document.getElementById(id))
        {
            clearInterval(x);
            callback();
        }
    }, 100);
  }

  displayTimeline()
  {
    console.log("Timeline");

    let timelineDiv = 'timeline';

    document.getElementById(timelineDiv).innerHTML = "";

    // DOM element where the Timeline will be attached
		let timelineContainer = document.getElementById(timelineDiv);

    // Create a DataSet (allows two way data-binding)
		let timelineData = new vis.DataSet();


    if(this.nodeLabel != null && this.nodeStart != null)
    {
      timelineData.add
      ([
        {id: 4, content: this.nodeLabel, start: this.nodeStart}
      ]);
    }

    for(let i = 0; i < 3; i++)
    {
      if(this.nodeQuestion.choiceSets[0].choices[i].content != null && this.nodeQuestion.choiceSets[0].choices[i].start)
      {
        timelineData.add
        ([
          {id: i+1, content: this.nodeQuestion.choiceSets[0].choices[i].content, start: this.nodeQuestion.choiceSets[0].choices[i].start}
        ]);
      }
    }



    // Configuration for the Timeline
		var timelineOptions = {};

		// Create a Timeline
		var timeline = new vis.Timeline(timelineContainer, timelineData, timelineOptions);
  }
}
