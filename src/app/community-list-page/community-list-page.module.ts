import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CommunityListPageComponent } from './community-list-page.component';
import { CommunityListPageRoutingModule } from './community-list-page.routing.module';
import { CommunityListComponent } from './community-list/community-list.component';
import { CdkTreeModule } from '@angular/cdk/tree';

/**
 * The page which houses a title and the community list, as described in community-list.component
 */
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CommunityListPageRoutingModule,
    CdkTreeModule,
  ],
  declarations: [
    CommunityListPageComponent,
    CommunityListComponent
  ]
})
export class CommunityListPageModule {

}