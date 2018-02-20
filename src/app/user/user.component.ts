import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

declare let vis: any;

@Component({
  templateUrl: 'user.component.html'
})

export class UserComponent
{
  //Global variable
  public static globe;

  targetUserTypes;

  constructor(public dialogRef: MatDialogRef<UserComponent>, @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.targetUserTypes = data;
  }

}
