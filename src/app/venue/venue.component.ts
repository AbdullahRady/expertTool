import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

declare let vis: any;

@Component({
  templateUrl: 'venue.component.html'
})

export class VenueComponent
{
  //Global variable
  public static globe;

  constructor(public dialogRef: MatDialogRef<VenueComponent>, @Inject(MAT_DIALOG_DATA) public data: any)
  {

  }

}
