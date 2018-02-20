import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  templateUrl: 'edge.component.html'
})

export class EdgeComponent
{

  constructor(public dialogRef: MatDialogRef<EdgeComponent>, @Inject(MAT_DIALOG_DATA) public data: any)
  {
    console.log(data);
  }
}
