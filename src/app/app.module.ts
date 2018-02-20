import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { ReflectiveTopicComponent } from './reflective-topic/reflective-topic.component';
import { NodeComponent } from './node/node.component';
import { EdgeComponent } from './edge/edge.component';
import { UserComponent } from './user/user.component';
import { VenueComponent } from './venue/venue.component';

import { FlexLayoutModule } from '@angular/flex-layout';

import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatTabsModule,
  MatToolbarModule,
  MatTableModule
} from '@angular/material';

import 'hammerjs';


@NgModule({
  declarations: [
    AppComponent,
    ReflectiveTopicComponent,
    NodeComponent,
    EdgeComponent,
    UserComponent,
    VenueComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,

    // Material
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatToolbarModule,
    MatTableModule,

    // Flex-layout
    FlexLayoutModule
  ],
  providers: [],
  entryComponents: [ReflectiveTopicComponent, NodeComponent, EdgeComponent, UserComponent, VenueComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
