
import { map } from 'rxjs/operators';
import { Injectable, Input } from '@angular/core';
import { UserService } from './../user/user.service';
import { ContentService } from './../content/content.service';
import { ConfigService, ServerResponse, ResourceService } from '@sunbird/shared';
import { Observable } from 'rxjs';
import { SearchParam } from './../../interfaces/search';
import { LearnerService } from './../learner/learner.service';
import { PublicDataService } from './../public-data/public-data.service';
import * as _ from 'lodash-es';
/**
 * Service to search content
 */
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  /**
   * Contains searched content list
   */
  private _searchedContentList: any;
  /**
   * Contains searched organization list
   */
  private _searchedOrganisationList: any;
  /**
   * Reference of user service.
   */
  public user: UserService;
  /**
   * Reference of content service.
   */
  public content: ContentService;
  /**
   * Reference of config service
   */
  public config: ConfigService;
  /**
   * Reference of learner service
   */
  public learnerService: LearnerService;

  /**
   * Reference of public data service
   */
  public publicDataService: PublicDataService;
  public resourceService: ResourceService;
  private _subjectThemeAndCourse: object;
  /**
   * Default method of OrganisationService class
   *
   * @param {UserService} user user service reference
   * @param {ContentService} content content service reference
   * @param {ConfigService} config config service reference
   * @param {LearnerService} config learner service reference
   */
  constructor(user: UserService, content: ContentService, config: ConfigService,
    learnerService: LearnerService, publicDataService: PublicDataService,
    resourceService: ResourceService) {
    this.user = user;
    this.content = content;
    this.config = config;
    this.learnerService = learnerService;
    this.publicDataService = publicDataService;
    this.resourceService = resourceService;
  }
  /**
   * Search content by user id.
   *
   * @param {SearchParam} requestParam api request data
   */
  searchContentByUserId(requestParam: SearchParam, options: any = { params: {} }): Observable<ServerResponse> {
    const option = {
      url: this.config.urlConFig.URLS.COMPOSITE.SEARCH,
      param: options.params,
      data: {
        request: {
          filters: {
            status: requestParam.status || ['Live'],
            createdBy: requestParam.params.userId ? requestParam.params.userId : this.user.userid,
            contentType: requestParam.contentType || ['Course'],
            mimeType: requestParam.mimeType,
            objectType: requestParam.objectType,
            concept: requestParam.concept
          },
          limit: requestParam.limit,
          offset: (requestParam.pageNumber - 1) * requestParam.limit,
          query: requestParam.query,
          sort_by: {
            lastUpdatedOn: requestParam.params.lastUpdatedOn || 'desc'
          }
        }
      }
    };
    return this.content.post(option).pipe(
      map((data: ServerResponse) => {
        this._searchedContentList = data.result;
        return data;
      }));
  }
  /**
   * Get searched content list
   */
  get searchedContentList(): { content: Array<any>, count: number } {
    return this._searchedContentList;
  }
  /**
   * Get organization details.
   *
   * @param {requestParam} requestParam api request data
   */
  getOrganisationDetails(requestParam: SearchParam): Observable<ServerResponse> {
    const option = {
      url: this.config.urlConFig.URLS.ADMIN.ORG_EXT_SEARCH,
      data: {
        request: {
          filters: {
            id: _.get(requestParam, 'orgid'),
            locationIds: _.get(requestParam, 'locationIds')
          }
        }
      }
    };
    if (requestParam.isRootOrg) {
      option.data.request.filters['isRootOrg'] = requestParam.isRootOrg;
    }
    return this.publicDataService.post(option).pipe(
      map((data: ServerResponse) => {
        this._searchedOrganisationList = data.result.response;
        return data;
      }));
  }

  /**
   * Get organization details.
   *
   * @param {requestParam} requestParam api request data
  */
  getSubOrganisationDetails(requestParam: SearchParam): Observable<ServerResponse> {
    const option = {
      url: this.config.urlConFig.URLS.ADMIN.ORG_EXT_SEARCH,
      data: {
        request: {
          filters: {
            rootOrgId: requestParam.rootOrgId,
          }
        }
      }
    };
    return this.publicDataService.post(option).pipe(
      map((data: ServerResponse) => {
        return data;
      }));
  }
  /**
   * Get searched organization list
   */
  get searchedOrganisationList(): { content: Array<any>, count: number } {
    return this._searchedOrganisationList;
  }
  /**
   * Composite Search.
   *
   * @param {SearchParam} requestParam api request data
  */
  compositeSearch(requestParam: SearchParam): Observable<ServerResponse> {
    const option = {
      url: this.config.urlConFig.URLS.COMPOSITE.SEARCH,
      param: { ...requestParam.params },
      data: {
        request: {
          filters: requestParam.filters,
          offset: requestParam.offset,
          limit: requestParam.limit,
          query: requestParam.query,
          sort_by: requestParam.sort_by,
          facets: requestParam.facets
        }
      }
    };
    const objectType = requestParam && requestParam.filters && requestParam.filters.objectType;
    return this.content.post(option);
  }
  /**
   * User Search.
  */
  userSearch(requestParam: SearchParam): Observable<ServerResponse> {
    const option = {
      url: this.config.urlConFig.URLS.ADMIN.USER_SEARCH,
      data: {
        request: {
          filters: requestParam.filters,
          limit: requestParam.limit,
          offset: (requestParam.pageNumber - 1) * requestParam.limit,
          query: requestParam.query,
          softConstraints: { badgeAssertions: 1 }
        }
      }
    };
    return this.learnerService.post(option);
  }
  /**
   * User Search.
  */
  orgSearch(requestParam: SearchParam): Observable<ServerResponse> {
    const option = {
      url: this.config.urlConFig.URLS.ADMIN.ORG_EXT_SEARCH,
      data: {
        request: {
          filters: requestParam.filters,
          limit: requestParam.limit,
          offset: (requestParam.pageNumber - 1) * requestParam.limit,
          query: requestParam.query
        }
      }
    };
    return this.publicDataService.post(option);
  }
  /**
   * Course Search.
   *
   * @param {SearchParam} requestParam api request data
  */
  courseSearch(requestParam: SearchParam): Observable<ServerResponse> {
    const option = {
      url: this.config.urlConFig.URLS.COURSE.SEARCH,
      param: { ...requestParam.params },
      data: {
        request: {
          filters: requestParam.filters,
          offset: (requestParam.pageNumber - 1) * requestParam.limit,
          limit: requestParam.limit,
          query: requestParam.query,
          sort_by: requestParam.sort_by,
          facets: requestParam.facets
        }
      }
    };
    return this.content.post(option);
  }
  /**
   * Content Search.
   *
   * @param {SearchParam} requestParam api request data
  */
  contentSearch(requestParam: SearchParam, addDefaultContentTypesInRequest: boolean = true):
    Observable<ServerResponse> {
    const option = {
      url: this.config.urlConFig.URLS.CONTENT.SEARCH,
      param: { ...requestParam.params },
      data: {
        request: {
          filters: requestParam.filters,
          limit: requestParam.limit,
          query: requestParam.query,
          sort_by: requestParam.sort_by,
          exists: requestParam.exists,
          fields: requestParam.fields,
          softConstraints: requestParam.softConstraints,
          mode: requestParam.mode,
          facets: requestParam.facets && requestParam.facets
        }
      }
    };

    if (requestParam['pageNumber'] && requestParam['limit']) {
      option.data.request['offset'] = (requestParam.pageNumber - 1) * requestParam.limit;
    }

    if (_.get(option, 'data.request.filters') && !_.get(option, 'data.request.filters.contentType') && addDefaultContentTypesInRequest) {
      option.data.request.filters.contentType = [
        'Collection',
        'TextBook',
        'LessonPlan',
        'Resource'
      ];
    }
    return this.publicDataService.post(option);
  }
  /**
  * Batch Search.
  *
  * @param {SearchParam} requestParam api request data
 */
  batchSearch(requestParam: SearchParam): Observable<ServerResponse> {
    const offset = (requestParam.offset === 0 ||  requestParam.offset)
      ? requestParam.offset : (requestParam.pageNumber - 1) * requestParam.limit;
    const option = {
      url: this.config.urlConFig.URLS.BATCH.GET_BATCHS,
      data: {
        request: {
          filters: requestParam.filters,
          offset,
          limit: requestParam.limit,
          sort_by: requestParam.sort_by
        }
      }
    };
    return this.learnerService.post(option);
  }
  /**
   * getUserList.
   *
   * @param {SearchParam} requestParam api request data
  */
  getUserList(requestParam: SearchParam): Observable<ServerResponse> {
    const option = {
      url: this.config.urlConFig.URLS.ADMIN.USER_SEARCH,
      data: {
        request: {
          filters: requestParam.filters
        }
      }
    };
    return this.learnerService.post(option);
  }

  processFilterData(facets) {
    const facetObj = {};
    _.forEach(facets, (value) => {
        if (value) {
            let data = {};
            data = value.values;
            facetObj[value.name] = data;
        }
    });
    return facetObj;
  }

  public fetchCourses(request, contentType) {
    const option = this.getSearchRequest(request, contentType);
    let cardData = [];
    return this.contentSearch(option).pipe(map((response) => {
      const contents = _.get(response, 'result.content');
      if (_.isEmpty(contents)) {
        return [];
      } else {
        cardData = this.getFilterValues(contents);
        _.forEach(cardData, card => {
          const theme = _.get(this.getSubjectsStyles(), card.title);
          if (card && theme) {
            card.theme = theme.background;
            card.cardImg = theme.icon;
            card.titleColor = theme.titleColor;
          }
        });
        return _.compact(cardData);
      }
    }));
  }


  set subjectThemeAndCourse (subjectData) {
    this._subjectThemeAndCourse = subjectData;
  }

  get subjectThemeAndCourse () {
    return this._subjectThemeAndCourse;
  }

  getSearchRequest(request, contentType) {
    let filters = request.filters;
    filters = _.omit(filters, ['key', 'sort_by', 'sortType', 'appliedFilters']);
    filters['contentType'] = contentType; // ['Collection', 'TextBook', 'LessonPlan', 'Resource'];
    if (!request.isCustodianOrg) {
      filters['channel'] = request.channelId;
    }
    const option = {
        limit: 100 || this.config.appConfig.SEARCH.PAGE_LIMIT,
        filters: filters,
        // mode: 'soft',
        // facets: facets,
        params: _.cloneDeep(this.config.appConfig.ExplorePage.contentApiQueryParams),
    };
    if (request.frameworkId) {
      option.params.framework = request.frameworkId;
    }
    return option;
  }

  getFilterValues(contents) {
      let subjects = _.map(contents, content => {
        return (_.get(content, 'subject'));
      });
      subjects = _.values(_.groupBy(_.compact(subjects))).map((subject) => {
      return ({ title: subject[0], count: subject.length === 1 ?
        `${subject.length} ${_.upperCase(this.resourceService.frmelmnts.lbl.oneCourse)}`
        : `${subject.length} ${_.upperCase(this.resourceService.frmelmnts.lbl.courses)}`, contents: [] });
      });

      _.map(contents, content => {
        const matchedSubject =  _.find(subjects, subject => (_.trim(_.lowerCase(content.subject)) === _.trim(_.lowerCase(subject.title))));
        if (matchedSubject) {
          matchedSubject.contents.push(content);
        }
      });

    return subjects;
  }

  getSubjectsStyles() {
    return {
        Mathematics: {
          background: '#FFDFD9',
          titleColor: '#EA2E52',
          icon: './../../../../../assets/images/sub_math.svg'
        },
        Science: {
          background: '#FFD6EB',
          titleColor: '#FD59B3',
          icon: './../../../../../assets/images/sub_science.svg'
        },
        Social: {
          background: '#DAD4FF',
          titleColor: '#635CDC',
          icon: './../../../../../assets/images/sub_social.svg'
        },
        English: {
          background: '#DAFFD8',
          titleColor: '#218432',
          icon: './../../../../../assets/images/sub_english.svg'
        },
        Hindi: {
          background: '#C2E2E9',
          titleColor: '#07718A',
          icon: './../../../../../assets/images/sub_hindi.svg'
        },
        Chemistry: {
          background: '#FFE59B',
          titleColor: '#8D6A00',
          icon: './../../../../../assets/images/sub_chemistry.svg'
        },
        Geography: {
          background: '#C2ECE6',
          titleColor: '#149D88',
          icon: './../../../../../assets/images/sub_geography.svg'
        }
    };
  }

}


