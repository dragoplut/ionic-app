import { Injectable } from '@angular/core';
import { APP_USER } from '../../app/constants';
import { PERMISSION_RULES } from '../../app/app.permissions';
// noinspection TypeScriptCheckImport
import * as _ from 'lodash';

@Injectable()
export class PermissionService {

  private activeAppUser: any = {};

  public isAdmin(user) {
    return _.includes(user.roles, 'Administrator');
  }

  public isMe(user: any) {
    this.getAuthorizedUser();
    return user.userId === this.activeAppUser.userId;
  }

  public isAllowedAction(action: string, entity: any) {
    this.getAuthorizedUser();
    if (this.activeAppUser && this.activeAppUser.roles && this.activeAppUser.roles.length) {
      let isAllowed: boolean = false;
      for (let role of this.activeAppUser.roles) {
        role = role.toLowerCase();
        let allowedForRole: boolean = PERMISSION_RULES[role] &&
          PERMISSION_RULES[role][entity] ?
            PERMISSION_RULES[role][entity][action] : false;
        if (allowedForRole) {
          isAllowed = allowedForRole;
          break;
        }
      }
      return isAllowed;
    } else {
      return false;
    }
  }

  private getAuthorizedUser() {
    this.activeAppUser = localStorage.getItem(APP_USER) ?
      JSON.parse(atob(localStorage.getItem(APP_USER))) : '';
  }
}
