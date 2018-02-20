import { Component, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry, MatDialog, MatTableDataSource, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import 'rxjs/add/operator/filter';

import { ReflectiveTopicComponent } from './reflective-topic/reflective-topic.component';
import { NodeComponent } from './node/node.component';
import { EdgeComponent } from './edge/edge.component';
import { UserComponent } from './user/user.component';
import { VenueComponent } from './venue/venue.component';

declare let vis: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent
{
  //Expert tool title
  title = "Associations Editor";

  //Logo image
  logo = "logo_s.png";

  //Triples columns headers
  displayedColumns = ['from', 'to', 'label', 'action'];

  //Triples data source
  dataSource;

  //Declaring reflective topics variables
  venues; targetUserTypes; reflectiveTopics; nodes; edges; questions; network; keywords; triples;
  selectedReflectiveTopic; selectedNode; selectedEdge; selectedQuestion; selectedKeyword;

  //Global variable
  public static globe;

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private dialog: MatDialog)
  {

    //Global
    AppComponent.globe = this;

    //Reflective Topic index
    AppComponent.globe.reflectiveTopicIndex = 0;

    //Create datasets for nodes and edges
    AppComponent.globe.nodesDataset;
    AppComponent.globe.edgesDataset;
    AppComponent.globe.questionsDataset;

    //Set drawNetwork function scope as global
    AppComponent.globe.drawNetworkFunction = this.drawNetwork;

    //Set selectedNode variable scope as global
    AppComponent.globe.selectedNode;

    //Set initializeExperience function scope as global
    AppComponent.globe.initializeExperience = this.initializeExperience;

    //JSON data
    AppComponent.globe.data =
    [
      {
    		"id": 1,
    		"experienceTitle": "",
    		"venues": [],
    		"profilingQuestionnaireId": null,
    		"targetUserTypes": [],
    		"reflectiveTopics":
        [
    			{
    				"id": 1,
    				"title": "General",
    				"keywords": [],
    				"targetUserTypes": [],
    				"storyBefore":
            [
    					{
    						"targetUserTypes": [],
    						"venues": [],
    						"text": "",
    						"image": ""
    					}
    				],
    				"reflectionPoints":
            [
    					{
    						"id": 1,
    						"targetUserTypes": [],
    						"venues": [],
    						"message": ""
    					}
    				],
    				"nodesData": [],
    				"edgesData": [],
    				"questionsData": []
    			}
    		]
    	}
    ];

    //Initialize experience with reflective topics data
    this.initializeExperience();

    //Draw network when DOM content is loaded
    document.addEventListener("DOMContentLoaded", function(event)
    {
      //console.log("DOM fully loaded and parsed");
      AppComponent.globe.drawNetworkFunction();
    });

  }

  //Initialize experience data
  initializeExperience()
  {
    //Set target user types data
    this.targetUserTypes = AppComponent.globe.data[0].targetUserTypes;

    //Set venues data
    this.venues = AppComponent.globe.data[0].venues;

    //Set reflective topics data
    this.reflectiveTopics = AppComponent.globe.data[0].reflectiveTopics;

    //Initialize selected reflective topic to first one
    AppComponent.globe.selectedReflectiveTopic = this.reflectiveTopics[0];

    //Set reflective topic components' data
    this.setData();
  }

  //Update selected reflective topic's data on tab change
  setReflectiveTopic = (tabChangeEvent): void =>
  {
    console.log("Tab index", tabChangeEvent.index);

    //Deselect node
    AppComponent.globe.selectedNode = null;

    //Get the index of the tab/reflectiveTopic
    AppComponent.globe.reflectiveTopicIndex = tabChangeEvent.index;

    //Focus on reflective topic
    AppComponent.globe.selectedReflectiveTopic = this.reflectiveTopics[AppComponent.globe.reflectiveTopicIndex];

    //Set reflective topic components' data
    this.setData();

    //Display Network
    this.drawNetwork();
  }

  //Set reflective topic components' data
  setData()
  {
    //Note: Minimize edges and nodes variables = edgesDataset and NodesDataset
    //Note: nodes, edges, and questions variables are useless here
    this.nodes = AppComponent.globe.selectedReflectiveTopic.nodesData;
    this.edges = AppComponent.globe.selectedReflectiveTopic.edgesData;
    this.questions = AppComponent.globe.selectedReflectiveTopic.questionsData;
    this.keywords = AppComponent.globe.selectedReflectiveTopic.keywords;

    //Create datasets
    AppComponent.globe.nodesDataset = new vis.DataSet();
    AppComponent.globe.edgesDataset = new vis.DataSet();
    AppComponent.globe.questionsDataset = new vis.DataSet();

    //Assign data from nodes, questions and edges variables to datasets
    AppComponent.globe.nodesDataset.add(AppComponent.globe.selectedReflectiveTopic.nodesData);
    AppComponent.globe.edgesDataset.add(AppComponent.globe.selectedReflectiveTopic.edgesData);
    AppComponent.globe.questionsDataset.add(AppComponent.globe.selectedReflectiveTopic.questionsData);

    //Display triples if nodes exist
    //if(AppComponent.globe.selectedReflectiveTopic.nodesData.length > 0)
    {
      //Display triples
      this.displayTriples();
    }

    console.log("Data Set!");
  }

  //Display triples table
  displayTriples()
  {
    //Initialize triples
    this.triples = [];

    //Retrieve edges and nodes data to be displayed in the triples table
    for(let i = 0; i < AppComponent.globe.selectedReflectiveTopic.edgesData.length; i++)
    {
      this.triples.push
      ({
        "id": AppComponent.globe.selectedReflectiveTopic.edgesData[i].id,
        "from": AppComponent.globe.nodesDataset.get(AppComponent.globe.selectedReflectiveTopic.edgesData[i].from).label,
        "to": AppComponent.globe.nodesDataset.get(AppComponent.globe.selectedReflectiveTopic.edgesData[i].to).label,
        "label": AppComponent.globe.selectedReflectiveTopic.edgesData[i].label,
      });
    }

    //Assign triples data to table
    this.dataSource = new MatTableDataSource(this.triples);

    console.log("Triples displayed");
  }

  //Display Network
  drawNetwork()
  {
    //console.log("Ref. Topic: ", AppComponent.globe.selectedReflectiveTopic.id);
    let networkDiv = 'network-' + AppComponent.globe.selectedReflectiveTopic.id;

    // create a network
		let networkContainer = document.getElementById(networkDiv);

    //Nodes options
    let nodesOptions =
    {
      shape: 'box'
    };

    //Edges options
    let edgesOptions =
    {};

    //Use nodes and edges data to be displayed in the network
    let networkData =
		{
			nodes: AppComponent.globe.nodesDataset,
			edges: AppComponent.globe.edgesDataset
		};

    //Network Options
    let networkOptions =
    {
      //autoResize: true,
      //height: '100%',
      //width: '100%',
      //clickToUse: true,
      edges: edgesOptions,
      nodes: nodesOptions
    };

    //Execute when network div is loaded
    this.network = new vis.Network(networkContainer, networkData, networkOptions);
    this.network.redraw();

    //Action when the network is selected
		this.network.on("click", function (params)
    {
      params.event = "click";

      //Retrieve the id of the clicked node
      let selectedNodeId = parseInt(params.nodes);

      //Retrieve edges ids linked to the clicked node
      let edgesSelected = params.edges;

      //Retrieve node position
      let DOMx = params['pointer']['DOM']['x'];
			let DOMy = params['pointer']['DOM']['y'];
			let canvasx = params['pointer']['canvas']['x'];
			let canvasy = params['pointer']['canvas']['y'];

      //Check if a node is clicked
      if(isNaN(selectedNodeId) == false)
      {
        AppComponent.globe.selectedNode = AppComponent.globe.nodesDataset.get(selectedNodeId);
        //console.log("Selected node: ", AppComponent.globe.selectedNode);
      }
      else
      {
        AppComponent.globe.selectedNode = null;
      }

    });

    //Action when the network is double clicked
    this.network.on("doubleClick", function (params)
		{

      params.event = "doubleClick";

      //Retrieve the id of the clicked node
      let selectedNodeId = parseInt(params.nodes);

      //Check if a node is clicked
      if(isNaN(selectedNodeId) == false)
      {
        AppComponent.globe.selectedNode = AppComponent.globe.nodesDataset.get(selectedNodeId);
        console.log("Double clicked: ", AppComponent.globe.selectedNode);

        //Open node dialog    Note:Make it global to use
        //this.openNodeDialog('edit');
      }
      else
      {
        AppComponent.globe.selectedNode = null;
      }

    });

  }

  //Open reflective topic dialog
  openReflectiveTopicDialog()
  {
    this.dialog.open(ReflectiveTopicComponent,
    {
      data: this.targetUserTypes,
      width: '500px',
    }).afterClosed()
      .filter(result => !!result)
      .subscribe(reflectiveTopic =>
      {
        this.addReflectiveTopic(reflectiveTopic);
      });
  }

  //Open Node Dialog
  openNodeDialog(action)
  {
    //Selected Node
    let selectedNodeInstance;

    //Selected Node Question
    let selectedNodeQuestion;

    if(action == "edit")
    {
      //Retrieve selected node's data
      selectedNodeInstance = AppComponent.globe.selectedNode;

      //Filter questions dataset to get the node question
      selectedNodeQuestion = AppComponent.globe.questionsDataset.get
      ({
        filter: function(question)
        {
          return question.nodeId == selectedNodeInstance.id;
        }
      });

      //Check if there is no question saved for the selected node
      if(selectedNodeQuestion.length == 0)
      {
        //Set the selectedNodeQuestion to null
        selectedNodeQuestion = null;
      }

      console.log("selectedNodeQuestion", selectedNodeQuestion);
    }

    //Open the node dialog
    this.dialog.open(NodeComponent,
    {
      //Pass node, question and target users data to the node dialog
      data:
      {
        nodesData: selectedNodeInstance,
        questionData: selectedNodeQuestion,
        targetUsersData: this.targetUserTypes
      },
      //Set dialog width
      width: '500px',
    }).afterClosed()
      .filter(result => !!result)
      .subscribe(node =>
      {
        //Display the data submitted by the node dialog
        console.log(node);

        //If data was submitted by an add action, add a new node
        if(action == "add")
          this.addNode(node);
        //Else update the modified node
        else if(action == "edit")
          this.updateNode(node);
      });
  }

//Open the edge dialog
  openEdgeDialog()
  {
    this.dialog.open(EdgeComponent,
    {
      data: AppComponent.globe.selectedReflectiveTopic.nodesData,
      width: '500px',
    }).afterClosed()
      .filter(result => !!result)
      .subscribe(edge =>
      {
        this.addEdge(edge);
      });
  }

  //Open target user dialog
  openTargetUserTypeDialog()
  {
    this.dialog.open(UserComponent,
    {
      data: this.targetUserTypes,
      width: '500px',
    }).afterClosed()
      .filter(result => !!result)
      .subscribe(userType =>
      {
        this.addTargetUserType(userType);
      });
  }

  //Open venue dialog
  openVenueDialog()
  {
    this.dialog.open(VenueComponent,
    {
      width: '500px',
    }).afterClosed()
      .filter(result => !!result)
      .subscribe(venue =>
      {
        this.addVenue(venue);
      });
  }

  //Add a new node
  addNode(node)
  {
    try
    {
      //Initialize the new node's id with 1
      let newNodeId = 1;

      //note: update to get the largest id instead of the id of the last node
      if(AppComponent.globe.selectedReflectiveTopic.nodesData.length > 0)
      {
        //Increment last node id
        newNodeId = AppComponent.globe.selectedReflectiveTopic.nodesData[AppComponent.globe.selectedReflectiveTopic.nodesData.length-1].id + 1;
      }
      else
      {
        //Display triples if the first node is added
        this.displayTriples();
      }

      //Set id of the new node
      node["id"] = newNodeId;

      //If node type was not set, set it to "information"
      if(node.nodeType == null)
        node.nodeType = 1;

      //If node group was not set, set it to "normal"
      if(node.group == null)
        node.group = 1;

      //Check if the node is a question
      if(node.nodeType > 1)
        node.question = true;
      else
        node.question = false;

      //Create new node
      let newNode =
      {
        id: node.id,
        label: node.label,
        info: node.info,
        group: node.group,
        image: node.image,
        question: node.question
      };

      //If the node is a timeline, add date
      if(node.nodeType == 3)
      {
        newNode["start"] = node.start;
      }
      //If the node is a map, add location
      else if(node.nodeType == 4)
      {
        newNode["location"] = node.location;
      }

      console.log("newNode", newNode);

      //Add the new node to the nodesDataset to be displayed in the network
      AppComponent.globe.nodesDataset.add(newNode);

      //Add the new node to the reflectiveTopics
      AppComponent.globe.selectedReflectiveTopic.nodesData.push(newNode);

      //If the node is a question, call the add question function
      if(node.question == true)
        this.addQuestion(node);

    }
    catch (err)
    {
        alert(err);
    }
  }

  //Update an existing node
  updateNode(node)
  {
    //Check if the node is a question
    if(node.nodeType > 1)
      node.question = true;
    else
      node.question = false;

    try
    {
      //Update the nodesDataset to appear in the network
      AppComponent.globe.nodesDataset.update
      ({
        id: AppComponent.globe.selectedNode.id,
        label: node.label,
        info: node.info,
        group: node.group,
        image: node.image,
        question: node.question
      });

      let selectedNodeQuestion;
      node["id"] = AppComponent.globe.selectedNode.id;

      //Search if question exists
      selectedNodeQuestion = AppComponent.globe.questionsDataset.get
      ({
        filter: function(question)
        {
          return question.nodeId == node.id;
        }
      });

      console.log("selectedNodeQuestion", selectedNodeQuestion[0]);

      //Check if the node is a question
      if(node.question == true)
      {

        //Check question type to update node fields
        if(node.nodeType == 2)
        {

          if(node.location)
          {
            delete node.location;
          }

          if(node.start)
          {
            delete node.start;
          }

          AppComponent.globe.nodesDataset.update({
            id: AppComponent.globe.selectedNode.id,
            start: "",
            location: ""
          });

        }
        else if(node.nodeType == 3)
        {
          //delete map fields if existed
          if(node.location)
          {
            delete node.location;
          }

          AppComponent.globe.nodesDataset.update
          ({
            id: AppComponent.globe.selectedNode.id,
            start: node.start,
            location: ""
          });
        }
        else if(node.nodeType == 4)
        {
          //delete timeline fields if existed
          if(node.start)
          {
            delete node.start;
          }

          AppComponent.globe.nodesDataset.update
          ({
            id: AppComponent.globe.selectedNode.id,
            start: "",
            location: node.location
          });
        }

        AppComponent.globe.selectedReflectiveTopic.nodesData = AppComponent.globe.nodesDataset.get();


        //--- Update Question --\\

        //Check if a question already exists for this node
        if(selectedNodeQuestion.length == 0)
        {
          this.addQuestion(node);
        }
        else
        {
          this.updateQuestion(node, selectedNodeQuestion[0].id);
        }
      }
      else
      {
        //The node is not a question, hence delete question if exists
        if(selectedNodeQuestion.length > 0)
          this.removeQuestion(selectedNodeQuestion.id);
      }

      AppComponent.globe.selectedNode = AppComponent.globe.nodesDataset.get(AppComponent.globe.selectedNode.id);

      //note: retrieve nodeIndex in a smarter way
      let nodeIndex;

      //Retrieve node index
      for(let i = 0; i < AppComponent.globe.selectedReflectiveTopic.nodesData.length; i++)
      {
        if(AppComponent.globe.selectedReflectiveTopic.nodesData[i].id == AppComponent.globe.selectedNode.id)
        {
          nodeIndex = i;
        }
      }

      //Update the node in the selected reflective topic
      AppComponent.globe.selectedReflectiveTopic.nodesData[nodeIndex] = AppComponent.globe.selectedNode;

      console.log("RT nodes", AppComponent.globe.selectedReflectiveTopic.nodesData[nodeIndex]);

      //Update triples labels
      this.displayTriples();
    }
    catch (err)
    {
      alert(err);
    }
  }

  removeNode()
  {
    AppComponent.globe.nodesDataset.remove
    ({
      id: AppComponent.globe.selectedNode.id
    });

    AppComponent.globe.selectedReflectiveTopic.nodesData = AppComponent.globe.nodesDataset.get();

    let selectedNodeQuestion;

    //Search if question exists
    selectedNodeQuestion = AppComponent.globe.questionsDataset.get
    ({
      filter: function(question)
      {
        return question.nodeId == AppComponent.globe.selectedNode.id;
      }
    });

    //delete question if exist,
    if(selectedNodeQuestion.length > 0)
    {
      //console.log("delete question", selectedNodeQuestion[0].id);
      this.removeQuestion(selectedNodeQuestion[0].id);
    }

    let selectedNodeEdges;

    //Search for node edges
    selectedNodeEdges = AppComponent.globe.edgesDataset.get
    ({
      filter: function(edge)
      {
        return ((edge.from == AppComponent.globe.selectedNode.id) || (edge.to == AppComponent.globe.selectedNode.id));
      }
    });

    console.log("Selected Egdges to be deleted", selectedNodeEdges);

    for(let i = 0; i < selectedNodeEdges.length; i++)
    {
      this.removeEdge(selectedNodeEdges[i].id);
    }

    //Deselect node
    AppComponent.globe.selectedNode = null;

    //re-display triples
    this.displayTriples();

  }

  addQuestion(node)
  {
    console.log("Question x node", node);

    if(node.question == true)
    {
      let newQuestionId = 1;

      //note: update to get the largest id
      if(AppComponent.globe.selectedReflectiveTopic.questionsData.length > 0)
      {
        //Increment last question id
        newQuestionId = AppComponent.globe.selectedReflectiveTopic.questionsData[AppComponent.globe.selectedReflectiveTopic.questionsData.length-1].id + 1;
      }

      console.log("newQuestionId", newQuestionId);

      let newQuestion =
      {
        id: newQuestionId,
        nodeId: node.id,
        questionType: node.nodeType-1,
        title: node.questionTitle,
        choiceSets:
        [
          {
            choices:
            [
              {
                id: 1,
                content: node["choice-1"],
                correct: false
              },
              {
                id: 2,
                content: node["choice-2"],
                correct: false
              },
              {
                id: 3,
                content: node["choice-3"],
                correct: false
              },
              {
                id: 4,
                content: node["label"],
                correct: true
              }
            ],
            targetUserTypes: []
          }
        ]
      }

      if(node.nodeType == 3)
      {
        for(let i = 0; i < 3; i++)
        {
          newQuestion["choiceSets"][0]["choices"][i]["start"] = node["start-"+(i+1)];
        }

        newQuestion["choiceSets"][0]["choices"][3]["start"] = node["start"];
      }

      if(node.nodeType == 4)
      {
        for(let i = 0; i < 3; i++)
        {
          newQuestion["choiceSets"][0]["choices"][i]["location"] = node["location-"+(i+1)];
        }

        newQuestion["choiceSets"][0]["choices"][3]["location"] = node["location"];
      }

      for(let i = 0; i < this.targetUserTypes.length; i++)
      {
        console.log(node["userTypes["+i+"]"]);

        if(node["userTypes["+i+"]"] == true)
          newQuestion["choiceSets"][0]["targetUserTypes"].push(this.targetUserTypes[i].id)
      }


      console.log("newQuestion", newQuestion);

      AppComponent.globe.questionsDataset.add(newQuestion);
      console.log("AppComponent.globe.questionsDataset", AppComponent.globe.questionsDataset);

      //Add the new question to the reflectiveTopics
      AppComponent.globe.selectedReflectiveTopic.questionsData.push(newQuestion);
      console.log("AppComponent.globe.selectedReflectiveTopic.questionsData", AppComponent.globe.selectedReflectiveTopic.questionsData);
    }

  }

  updateQuestion(node, selectedNodeQuestionId)
  {
    console.log("Update question!", node);

    let questionTargetUserTypes = [];

    for(let i = 0; i < this.targetUserTypes.length; i++)
    {
      console.log(node["userTypes["+i+"]"]);

      if(node["userTypes["+i+"]"] == true)
        questionTargetUserTypes.push(this.targetUserTypes[i].id)
    }

    try
    {
      //Update the questionsDataset
      AppComponent.globe.questionsDataset.update
      ({
        id: selectedNodeQuestionId,
        nodeId: node.id,
        questionType: node.nodeType-1,
        title: node.questionTitle,
        choiceSets:
        [
          {
            choices:
            [
              {
                id: 1,
                content: node["choice-1"],
                correct: false
              },
              {
                id: 2,
                content: node["choice-2"],
                correct: false
              },
              {
                id: 3,
                content: node["choice-3"],
                correct: false
              },
              {
                id: 4,
                content: node["label"],
                correct: true
              }
            ],
            targetUserTypes: questionTargetUserTypes
          }
        ]
      });

      AppComponent.globe.selectedReflectiveTopic.questionsData = AppComponent.globe.questionsDataset.get();

      console.log("questionTargetUserTypes", questionTargetUserTypes);
      console.log("selectedReflectiveTopic.questionsData", AppComponent.globe.selectedReflectiveTopic.questionsData);


    }
    catch (err)
    {
      alert(err);
    }

    //console.log("questionsDataset", AppComponent.globe.selectedReflectiveTopic.questionsData);

  }

  removeQuestion(questionId)
  {
    console.log("Remove the question", questionId);

    AppComponent.globe.questionsDataset.remove
    ({
      id: questionId
    });

    AppComponent.globe.selectedReflectiveTopic.questionsData = AppComponent.globe.questionsDataset.get();

  }

  addEdge(edge)
  {
    try
    {
      let newEdgeId = 1;

      //note: update to get the largest id
      if(AppComponent.globe.selectedReflectiveTopic.edgesData.length > 0)
        newEdgeId = AppComponent.globe.selectedReflectiveTopic.edgesData[AppComponent.globe.selectedReflectiveTopic.edgesData.length-1].id + 1;

      edge["id"] = newEdgeId;
      //console.log(edge);

      //Add the new edge to the edgesDataset to be displayed in the network
      AppComponent.globe.edgesDataset.add(edge);

      //Add the new edge to the reflectiveTopics
      AppComponent.globe.selectedReflectiveTopic.edgesData.push(edge);

      //Re-display triples after adding the new edge
      this.displayTriples();
    }
    catch (err)
    {
      alert(err);
    }
  }

  updateEdge(edge)
  {}

  removeEdge(edgeId)
  {
    console.log("remove edge!");

    AppComponent.globe.edgesDataset.remove
    ({
      id: edgeId
    });

    AppComponent.globe.selectedReflectiveTopic.edgesData = AppComponent.globe.edgesDataset.get();

    //this.displayTriples();

  }

  addTargetUserType(userType)
  {
    //console.log("userType", userType);

    let newTargetUserTypeId = 1;

    if(this.targetUserTypes.length > 0)
        newTargetUserTypeId = this.targetUserTypes[this.targetUserTypes.length-1].id + 1;

    this.targetUserTypes.push
    ({
      id: newTargetUserTypeId,
      userTypeName: userType.userTypeName,
      matchingCriteria: [userType.matchingCriteria]
    });

    //console.log("targetUserTypes", this.targetUserTypes);
    //console.log("AppComponent.globe.data", AppComponent.globe.data);
  }

  addVenue(venue)
  {
    console.log("venue", venue);

    let newVenueId = 1;

    if(this.venues.length > 0)
        newVenueId = this.venues[this.venues.length-1].id + 1;

    this.venues.push
    ({
      id: newVenueId,
      venueName: venue.venueName,
      location: venue.location,
      text: venue.text
    });

    console.log("venues", this.venues);
    console.log("AppComponent.globe.data", AppComponent.globe.data);
  }

  addKeywords()
  {
    console.log(this.keywords);

    if(this.keywords != "")
    {
      let reflectiveTopicKeywords = this.keywords.split(',');
      console.log("keyword:", reflectiveTopicKeywords);

      AppComponent.globe.selectedReflectiveTopic.keywords = [reflectiveTopicKeywords];
    }

  }

  addReflectiveTopic(reflectiveTopic)
  {
    let newReflectiveTopicId = 1;

    //note: update to get the largest id
    if(this.reflectiveTopics.length > 0)
      newReflectiveTopicId = this.reflectiveTopics[this.reflectiveTopics.length-1].id + 1;

    let reflectiveTopicTargetUserTypes = [];

    for(let i = 0; i < this.targetUserTypes.length; i++)
    {
      console.log(reflectiveTopic["userTypes["+i+"]"]);

      if(reflectiveTopic["userTypes["+i+"]"] == true)
        reflectiveTopicTargetUserTypes.push(this.targetUserTypes[i].id);
    }

    console.log(reflectiveTopicTargetUserTypes);

    console.log(reflectiveTopic);

    this.reflectiveTopics.push
    ({
      id: newReflectiveTopicId,
      title: reflectiveTopic.title,
      keywords: [],
      targetUserTypes: reflectiveTopicTargetUserTypes,
      storyBefore: [],
      reflectionPoints: [],
      nodesData: [],
      edgesData: [],
      questionsData: []
    });
    console.log(this.reflectiveTopics);
  }

  removeReflectiveTopic(reflectiveTopicId)
  {
    console.log("remove reflectiveTopic!", AppComponent.globe.selectedReflectiveTopic.id);

    //Note: Check that reflective topics length is greater than 0 to display delete button
    //Note: Initialize data if a reflective topic exists

    //AppComponent.globe.data[0].reflectiveTopics.splice(AppComponent.globe.reflectiveTopicIndex, 1);

    //AppComponent.globe.initializeExperience();
  }

  //Export JSON to file
	saveFile()
	{
		let writeJSON = JSON.stringify(AppComponent.globe.data, null, 4);
		let JSONasBlob = new Blob([writeJSON], {type:'text/plain'});
		let JSONsaveAs = "experience.json";
		let downloadLink = document.createElement("a");
		downloadLink.download = JSONsaveAs;
		downloadLink.innerHTML = "Download File";

		if (window.URL != null)
		{
			// Chrome allows the link to be clicked
			// without actually adding it to the DOM.
			downloadLink.href = window.URL.createObjectURL(JSONasBlob);
		}
		else
		{
			// Firefox requires the link to be added to the DOM
			// before it can be clicked.
			downloadLink.href = window.URL.createObjectURL(JSONasBlob);
			//downloadLink.onclick = destroyClickedElement;
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);
		}

		downloadLink.click();
	}

  //Import JSON from file
  loadFile()
	{
    let input, file, fileReader;

    input = document.getElementById('load-file');

    file = input.files[0];
    fileReader = new FileReader();

    fileReader.onload = function(e)
    {
      //Parse loaded JSON data and set it to experience data
      AppComponent.globe.data = JSON.parse(fileReader.result);

      //Initialize experience with loaded data
      AppComponent.globe.initializeExperience();

      //Re-draw the network after timeout to load previous components
      setTimeout(function(){ AppComponent.globe.drawNetworkFunction(); }, 100);
    }

    fileReader.readAsText(file);

	}

  //Start a new experience
  newFile()
  {
    //reload the page
    location.reload();
  }

  rateTriple(tripleId, rating)
  {
    console.log(tripleId, rating);
  }

}
