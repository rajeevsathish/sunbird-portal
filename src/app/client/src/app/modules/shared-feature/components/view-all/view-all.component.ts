import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import {
  ServerResponse, PaginationService, ResourceService, ConfigService, ToasterService, INoResultMessage,
  ILoaderMessage, UtilService, ICard
} from '@sunbird/shared';
import { SearchService, CoursesService, ICourses, SearchParam, ISort, PlayerService } from '@sunbird/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPagination } from '@sunbird/announcement';
import * as _ from 'lodash';
import { takeUntil, first, mergeMap, map } from 'rxjs/operators';
import { IInteractEventObject, IInteractEventEdata, IImpressionEventInput } from '@sunbird/telemetry';
@Component({
  selector: 'app-view-all',
  templateUrl: './view-all.component.html',
  styleUrls: ['./view-all.component.css']
})
export class ViewAllComponent implements OnInit {
  /**
	 * telemetryImpression
	*/
  telemetryImpression: IImpressionEventInput;
  closeIntractEdata: IInteractEventEdata;
  cardIntractEdata: IInteractEventEdata;
  sortIntractEdata: IInteractEventEdata;
  /**
   * To call searchService which helps to use list of courses
   */
  private searchService: SearchService;
  /**
  * To call resource service which helps to use language constant
  */
  private resourceService: ResourceService;
  /**
   * To get url, app configs
   */
  public config: ConfigService;
  /**
  * To show toaster(error, success etc) after any API calls
  */
  private toasterService: ToasterService;
  /**
   * Contains list of published course(s) of logged-in user
   */
  searchList: Array<ICard> = [];
  /**
   * To navigate to other pages
   */
  private route: Router;
  /**
  * To send activatedRoute.snapshot to router navigation
  * service for redirection to parent component
  */
  private activatedRoute: ActivatedRoute;
  /**
   * For showing pagination on inbox list
   */
  private paginationService: PaginationService;
  /**
  * To get enrolled courses details.
  */
  coursesService: CoursesService;
  /**
    * To show / hide no result message when no result found
   */
  noResult = false;
  /**
   * no result  message
  */
  noResultMessage: INoResultMessage;
  /**
    * totalCount of the list
  */
  totalCount: Number;
  /**
   * Current page number of inbox list
   */
  pageNumber = 1;
  /**
	 * Contains page limit of outbox list
	 */
  pageLimit: number;
  /**
   * This variable hepls to show and hide page loader.
   * It is kept true by default as at first when we comes
   * to a page the loader should be displayed before showing
   * any data
   */
  showLoader = true;
  /**
     * loader message
    */
  loaderMessage: ILoaderMessage;
  /**
   * Contains returned object of the pagination service
   * which is needed to show the pagination on inbox view
   */
  pager: IPagination;
  /**
   *url value
   */
  queryParams: any;
  /**
 *search filters
 */
  filters: any;

  /**
   * contains the search filter type
   */
  public filterType: string;
  sortingOptions: Array<ISort>;
  defaultSortBy: any;
  closeUrl: string;
  sectionName: string;
  constructor(searchService: SearchService, route: Router, private playerService: PlayerService,
    activatedRoute: ActivatedRoute, paginationService: PaginationService,
    resourceService: ResourceService, toasterService: ToasterService,
    config: ConfigService, coursesService: CoursesService, public utilService: UtilService) {
    this.searchService = searchService;
    this.route = route;
    this.activatedRoute = activatedRoute;
    this.paginationService = paginationService;
    this.resourceService = resourceService;
    this.toasterService = toasterService;
    this.config = config;
    this.coursesService = coursesService;
    this.route.onSameUrlNavigation = 'reload';
    this.sortingOptions = this.config.dropDownConfig.FILTER.RESOURCES.sortingOptions;
  }

  ngOnInit() {
    this.filterType = this.config.appConfig.course.filterType;
    this.pageLimit = this.config.appConfig.SEARCH.PAGE_LIMIT;
    combineLatest(this.activatedRoute.params, this.activatedRoute.queryParams).pipe(
      map(results => ({ params: results[0], queryParams: this.manipulateData(results[1])})),
      mergeMap((data) => {
        this.setTelemetryImpressionData();
        this.setInteractEventData();
        return this.getContentList(data);
      })
    ).subscribe((response: any) => {
      this.showLoader = false;
      const route = this.route.url.split('?');
      if (response.contentData.result.count && response.contentData.result.content) {
        this.showLoader = false;
        this.noResult = false;
        this.totalCount = response.contentData.result.count;
        this.pager = this.paginationService.getPager(response.contentData.result.count, this.pageNumber, this.pageLimit);
        this.searchList = this.formatData(response);
      } else {
        this.noResult = true;
        this.noResultMessage = {
          'message': this.resourceService.messages.stmsg.m0007,
          'messageText': this.resourceService.messages.stmsg.m0006
        };
      }
    }, (error) => {
      this.showLoader = false;
      this.noResult = true;
      this.noResultMessage = {
        'messageText': this.resourceService.messages.fmsg.m0077
      };
      this.toasterService.error(this.resourceService.messages.fmsg.m0051);
    });
  }

  setTelemetryImpressionData() {
    this.telemetryImpression = {
      context: {
        env: this.activatedRoute.snapshot.data.telemetry.env
      },
      edata: {
        type: this.activatedRoute.snapshot.data.telemetry.type,
        pageid: this.activatedRoute.snapshot.data.telemetry.pageid,
        uri: this.route.url,
        subtype: this.activatedRoute.snapshot.data.telemetry.subtype
      }
    };
  }
  setInteractEventData() {
    this.closeIntractEdata = {
      id: 'close',
      type: 'click',
      pageid: this.activatedRoute.snapshot.data.telemetry.pageid,
    };
    this.cardIntractEdata = {
      id: 'content-card',
      type: 'click',
      pageid: this.activatedRoute.snapshot.data.telemetry.pageid,
    };
    this.sortIntractEdata = {
      id: 'sort',
      type: 'click',
      pageid: this.activatedRoute.snapshot.data.telemetry.pageid,
    };
  }
  private manipulateData(results) {
    this.queryParams = results;
    const request = JSON.parse(results.query);
    this.defaultSortBy = request.sort_by;
    if (!_.isEmpty(results)) {
      _.forOwn(results, (queryValue, queryParam) => {
        request.filters[queryParam] = queryValue;
      });
      request.filters = _.omit(request.filters, ['key', 'sort_by', 'sortType', 'query']);
    }
    if (results.sort_by && results.sortType) {
      request.sort_by = results.sort_by;
      request.sortType = results.sortType.toString();
    }
    return request;
  }

  private getContentList(request) {
    const route = this.route.url.split('/view-all');
    this.closeUrl = '/' + route[0].toString();
    const name = route[1].split('/');
    this.sectionName = name[1];
    this.pageNumber = request.params.pageNumber;
    const requestParams = {
      filters: _.pickBy(request.queryParams.filters, value => value.length > 0),
      limit: this.pageLimit,
      pageNumber: request.params.pageNumber,
      query: request.queryParams.key,
      softConstraints: { badgeAssertions: 1 },
      sort_by: _.get(request.queryParams, 'sortType') ?
        { [request.queryParams.sort_by]: request.queryParams.sortType } : this.defaultSortBy
    };
    return combineLatest(
      this.searchService.contentSearch(requestParams),
      this.coursesService.enrolledCourseData$,
      (contentData, enrolledCourseData) => ({ contentData, enrolledCourseData })
    );
  }

  private formatData(response) {
    const enrolledCoursesId = [];
    _.forEach(response.enrolledCourseData.enrolledCourses, (value, index) => {
      enrolledCoursesId[index] = _.get(response.enrolledCourseData.enrolledCourses[index], 'courseId');
    });
    _.forEach(response.contentData.result.content, (value, index) => {
      if (response.enrolledCourseData.enrolledCourses && response.enrolledCourseData.enrolledCourses.length > 0) {
        if (_.indexOf(enrolledCoursesId, response.contentData.result.content[index].identifier) !== -1) {
          const constantData = this.config.appConfig.ViewAll.enrolledCourses.constantData;
          const metaData = { metaData: this.config.appConfig.ViewAll.enrolledCourses.metaData };
          const dynamicFields = {};
          const enrolledCourses = _.find(response.enrolledCourseData.enrolledCourses,
            ['courseId', response.contentData.result.content[index].identifier]);
          response.contentData.result.content[index] = this.utilService.processContent(enrolledCourses,
            constantData, dynamicFields, metaData);
        } else {
          const constantData = this.config.appConfig.ViewAll.otherCourses.constantData;
          const metaData = this.config.appConfig.ViewAll.metaData;
          const dynamicFields = this.config.appConfig.ViewAll.dynamicFields;
          response.contentData.result.content[index] = this.utilService.processContent(response.contentData.result.content[index],
            constantData, dynamicFields, metaData);
        }
      } else {
        const constantData = this.config.appConfig.ViewAll.otherCourses.constantData;
        const metaData = this.config.appConfig.ViewAll.metaData;
        const dynamicFields = this.config.appConfig.ViewAll.dynamicFields;
        response.contentData.result.content[index] = this.utilService.processContent(response.contentData.result.content[index],
          constantData, dynamicFields, metaData);
      }
    });
    return response.contentData.result.content;
  }

  navigateToPage(page: number): undefined | void {
    const route = this.route.url.split('?');
    const url = route[0].substring(0, route[0].lastIndexOf('/'));
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }
    this.pageNumber = page;
    this.route.navigate([url, this.pageNumber], {
      queryParams: this.queryParams
    });
  }

  playContent(event) {
    if (event.data.metaData.batchId) {
      event.data.metaData.mimeType = 'application/vnd.ekstep.content-collection';
      event.data.metaData.contentType = 'Course';
    }
    this.playerService.playContent(event.data.metaData);
  }
}
