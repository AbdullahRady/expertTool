import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  templateUrl: 'reflective-topic.component.html'
})

export class ReflectiveTopicComponent
{
  //Target user types
  targetUserTypes;

  constructor(public dialogRef: MatDialogRef<ReflectiveTopicComponent>, @Inject(MAT_DIALOG_DATA) public data: any)
  {
    //console.log(data);
    this.targetUserTypes = data;
  }
}
